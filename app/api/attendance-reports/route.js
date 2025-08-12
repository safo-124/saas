import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';

const prisma = new PrismaClient();
const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET);

export async function GET(request) {
    try {
        const tokenCookie = cookies().get('auth_token');
        if (!tokenCookie) { return NextResponse.json({ message: 'Unauthorized' }, { status: 401 }); }

        const { payload } = await jwtVerify(tokenCookie.value, JWT_SECRET);
        if (!payload.schoolId || payload.role !== 'ADMIN') {
            return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
        }
        const schoolId = payload.schoolId;

        const { searchParams } = new URL(request.url);
        const classId = searchParams.get('classId');
        const date = new Date(searchParams.get('date'));
        
        if (!classId || !date) {
            return NextResponse.json({ message: 'Class ID and date are required' }, { status: 400 });
        }

        // Get all students in the class
        const students = await prisma.student.findMany({
            where: { classId: classId, schoolId: schoolId },
            orderBy: { name: 'asc' }
        });

        // Get all attendance records for those students on that date
        const records = await prisma.attendanceRecord.findMany({
            where: {
                studentId: { in: students.map(s => s.id) },
                date: date
            }
        });

        // Combine the data, defaulting to ABSENT if no record is found
        const report = students.map(student => {
            const record = records.find(r => r.studentId === student.id);
            return {
                ...student,
                status: record?.status || 'ABSENT'
            };
        });

        return NextResponse.json(report);

    } catch (error) {
        console.error('Fetch attendance report error:', error);
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
    }
}