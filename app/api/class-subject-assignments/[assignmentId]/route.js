import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
// You would add the same JWT verification here as in the POST route

const prisma = new PrismaClient();

export async function DELETE(request, { params }) {
    try {
        // Add JWT verification here to ensure user is an authorized admin
        const { assignmentId } = params;
        await prisma.classSubjectAssignment.delete({
            where: { id: assignmentId },
        });
        return NextResponse.json({ message: 'Assignment deleted' }, { status: 200 });
    } catch (error) {
        console.error('Delete assignment error:', error);
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
    }
}