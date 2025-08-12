import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';

const prisma = new PrismaClient();
const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET);

export async function GET(request, { params }) {
    try {
        const tokenCookie = cookies().get('auth_token');
        if (!tokenCookie) { return NextResponse.json({ message: 'Unauthorized' }, { status: 401 }); }

        const { payload } = await jwtVerify(tokenCookie.value, JWT_SECRET);
        const { classId } = params;

        // Security Check: Only the assigned class teacher or an admin can fetch this data.
        const targetClass = await prisma.class.findFirst({
            where: { id: classId, schoolId: payload.schoolId },
        });

        if (!targetClass || (payload.role === 'TEACHER' && targetClass.classTeacherId !== payload.userId)) {
            return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
        }

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const [classData, todaysRecords] = await Promise.all([
            prisma.class.findUnique({
                where: { id: classId },
                select: {
                    name: true,
                    students: { orderBy: { name: 'asc' } },
                }
            }),
            prisma.attendanceRecord.findMany({
                where: {
                    date: today,
                    student: { classId: classId }
                },
                select: { studentId: true, status: true }
            })
        ]);
        
        if (!classData) {
            return NextResponse.json({ message: 'Class not found' }, { status: 404 });
        }

        // Combine student data with today's attendance status
        const studentsWithStatus = classData.students.map(student => {
            const record = todaysRecords.find(r => r.studentId === student.id);
            return { ...student, status: record?.status || 'PRESENT' }; // Default to PRESENT
        });
        
        return NextResponse.json({
            className: classData.name,
            students: studentsWithStatus,
        });

    } catch (error) {
        console.error('Fetch attendance data error:', error);
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
    }
}