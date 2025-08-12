import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';

const prisma = new PrismaClient();
const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET);

export async function POST(request) {
    try {
        const tokenCookie = cookies().get('auth_token');
        if (!tokenCookie) { return NextResponse.json({ message: 'Unauthorized' }, { status: 401 }); }

        const { payload } = await jwtVerify(tokenCookie.value, JWT_SECRET);
        if (payload.role !== 'TEACHER' && payload.role !== 'ADMIN') {
            return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
        }

        const { classId, attendanceData } = await request.json(); // attendanceData is an array of { studentId, status }

        // Security Check: Verify the teacher is the class teacher for this class
        const targetClass = await prisma.class.findFirst({
            where: { id: classId, classTeacherId: payload.userId }
        });
        if (!targetClass && payload.role !== 'ADMIN') {
             return NextResponse.json({ message: 'You are not authorized to mark attendance for this class.' }, { status: 403 });
        }

        const today = new Date();
        today.setHours(0, 0, 0, 0); // Normalize to the start of the day

        const transactions = attendanceData.map(record => 
            prisma.attendanceRecord.upsert({
                where: { studentId_date: { studentId: record.studentId, date: today } },
                update: { status: record.status, takenById: payload.userId },
                create: {
                    date: today,
                    status: record.status,
                    studentId: record.studentId,
                    takenById: payload.userId,
                    schoolId: payload.schoolId
                }
            })
        );

        await prisma.$transaction(transactions);

        return NextResponse.json({ message: 'Attendance submitted successfully' });
    } catch (error) {
        console.error('Submit attendance error:', error);
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
    }
}