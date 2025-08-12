import { PrismaClient } from '@prisma/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, GraduationCap, Banknote, BookOpen } from 'lucide-react';

const prisma = new PrismaClient();

// A simple card for displaying stats
function StatCard({ title, value, icon }) {
    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">{title}</CardTitle>
                {icon}
            </CardHeader>
            <CardContent>
                <div className="text-3xl font-bold">{value}</div>
            </CardContent>
        </Card>
    );
}

export default async function SchoolDashboardPage({ params }) {
    // Fetch stats specific to this school
    const school = await prisma.school.findUnique({
        where: { subdomain: params.domain },
        select: {
            id: true,
        }
    });

    if (!school) {
        return <div>School not found.</div>;
    }

    const [staffCount, studentCount] = await Promise.all([
        prisma.user.count({ where: { schoolId: school.id } }),
        prisma.student.count({ where: { schoolId: school.id } })
    ]);

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold">Dashboard</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard title="Total Students" value={studentCount} icon={<GraduationCap className="h-5 w-5 text-gray-500" />} />
                <StatCard title="Total Staff" value={staffCount} icon={<Users className="h-5 w-5 text-gray-500" />} />
                <StatCard title="Subjects" value="0" icon={<BookOpen className="h-5 w-5 text-gray-500" />} />
                <StatCard title="Pending Fees" value="$0" icon={<Banknote className="h-5 w-5 text-gray-500" />} />
            </div>
            <div className="pt-6">
                <h2 className="text-2xl font-semibold">Welcome, Admin!</h2>
                <p className="text-gray-600">Heres a quick overview of your schools activities.</p>
                {/* More detailed charts and widgets can be added here */}
            </div>
        </div>
    );
}