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
        const { schoolId } = payload;
        
        const { searchParams } = new URL(request.url);
        const classId = searchParams.get('classId');
        const subjectId = searchParams.get('subjectId');
        const examId = searchParams.get('examId');
        
        if (!classId || !subjectId || !examId) {
            return NextResponse.json({ message: 'Class, Subject, and Exam are required' }, { status: 400 });
        }

        // 1. Get all students in the class
        const students = await prisma.student.findMany({
            where: { classId, schoolId },
            orderBy: { name: 'asc' }
        });

        // 2. Get existing grades for this specific exam and subject
        const grades = await prisma.grade.findMany({
            where: { examId, subjectId, studentId: { in: students.map(s => s.id) } }
        });

        // 3. Combine students with their existing grades
        const markSheet = students.map(student => {
            const grade = grades.find(g => g.studentId === student.id);
            return {
                studentId: student.id,
                name: student.name,
                examMarks: grade?.examMarks ?? '',
                maxExamMarks: grade?.maxExamMarks ?? 100, // Default to 100
                remarks: grade?.remarks ?? '',
            };
        });

        return NextResponse.json(markSheet);
    } catch (error) {
        console.error('Fetch mark sheet error:', error);
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
    }
}