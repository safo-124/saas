import { cookies } from 'next/headers';
import { jwtDecode } from 'jwt-decode';
import Link from 'next/link';
import { PrismaClient } from '@prisma/client';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { ArrowRight, Users, GraduationCap, Banknote, BookOpen } from 'lucide-react';

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

/**
 * The dashboard view for School Administrators.
 */
async function AdminDashboard({ schoolId }) {
    const [staffCount, studentCount] = await Promise.all([
        prisma.user.count({ where: { schoolId: schoolId } }),
        prisma.student.count({ where: { schoolId: schoolId } })
    ]);

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard title="Total Students" value={studentCount} icon={<GraduationCap className="h-5 w-5 text-gray-500" />} />
                <StatCard title="Total Staff" value={staffCount} icon={<Users className="h-5 w-5 text-gray-500" />} />
                <StatCard title="Subjects" value="0" icon={<BookOpen className="h-5 w-5 text-gray-500" />} />
                <StatCard title="Pending Fees" value="$0" icon={<Banknote className="h-5 w-5 text-gray-500" />} />
            </div>
             <div className="pt-6">
                <h2 className="text-2xl font-semibold">Welcome, Admin!</h2>
                <p className="text-gray-600">Heres a quick overview of your schools activities.</p>
            </div>
        </div>
    );
}

/**
 * The dashboard view for Teachers.
 */
async function TeacherDashboard({ teacherId, schoolId }) {
    const classesInCharge = await prisma.class.findMany({
        where: {
            schoolId: schoolId,
            classTeacherId: teacherId, // Fetch only classes where this user is the class teacher
        },
        include: {
            _count: { select: { students: true } },
        },
        orderBy: { name: 'asc' },
    });

    return (
        <div className="space-y-4">
            <h2 className="text-2xl font-semibold">My Classes</h2>
            <p className="text-gray-500">Select a class to take todays attendance.</p>
            {classesInCharge.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {classesInCharge.map(c => (
                        <Link key={c.id} href={`/attendance/${c.id}`}>
                            <Card className="hover:shadow-md hover:border-blue-500 transition-all h-full">
                                <CardHeader>
                                    <CardTitle>{c.name}</CardTitle>
                                    <CardDescription>{c._count.students} Student(s)</CardDescription>
                                </CardHeader>
                                <CardContent className="flex justify-between items-center">
                                    <p className="text-sm text-blue-600 font-semibold">Take Attendance</p>
                                    <ArrowRight className="h-5 w-5 text-gray-400" />
                                </CardContent>
                            </Card>
                        </Link>
                    ))}
                </div>
            ) : (
                <div className="text-center text-gray-500 py-12 border-2 border-dashed rounded-lg">
                    <p>You are not assigned as the class teacher for any class.</p>
                </div>
            )}
        </div>
    );
}

/**
 * The main page component that decides which dashboard to render.
 */
export default async function SchoolDashboardPage({ params }) {
    // Read the user's role from their authentication token (cookie)
    const token = cookies().get('auth_token')?.value;
    if (!token) {
        // This should theoretically be caught by middleware, but it's good practice
        return <div>Unauthorized.</div>;
    }

    const decodedToken = jwtDecode(token);
    const { role, userId, schoolId } = decodedToken;

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold">Dashboard</h1>
            {role === 'ADMIN' ? (
                <AdminDashboard schoolId={schoolId} />
            ) : (
                <TeacherDashboard teacherId={userId} schoolId={schoolId} />
            )}
        </div>
    );
}