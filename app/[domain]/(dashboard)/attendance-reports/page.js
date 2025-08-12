import { PrismaClient } from '@prisma/client';
import { AttendanceReportViewer } from './_components/attendance-report-viewer';

const prisma = new PrismaClient();

export default async function AttendanceReportPage({ params }) {
    const school = await prisma.school.findUnique({
        where: { subdomain: params.domain },
        select: { id: true },
    });
    if (!school) { return <div>School not found.</div>; }

    const classes = await prisma.class.findMany({
        where: { schoolId: school.id },
        orderBy: { name: 'asc' },
    });

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold tracking-tight">Attendance Reports</h1>
            <AttendanceReportViewer classes={classes} />
        </div>
    );
}