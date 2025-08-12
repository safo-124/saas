import { PrismaClient } from '@prisma/client';
import { notFound } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Package, Users, GraduationCap } from 'lucide-react';
import { AddStaffDialog } from './_components/add-staff-dialog';

const prisma = new PrismaClient();

// Helper component for displaying stats
function StatCard({ title, value, icon }) {
    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">{title}</CardTitle>
                {icon}
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{value}</div>
            </CardContent>
        </Card>
    );
}

export default async function SchoolDetailsPage({ params }) {
  // Fetch all school details in a single, efficient query
  const school = await prisma.school.findUnique({
    where: { id: params.schoolId },
    include: {
      plan: { select: { name: true } },
      modules: { select: { name: true, key: true } },
      users: { 
        select: { name: true, email: true, role: true },
        orderBy: { createdAt: 'desc' }
      },
      // Get the count of related students and users
      _count: {
        select: { students: true, users: true },
      },
    },
  });

  if (!school) {
    notFound();
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">{school.name}</h1>
        <p className="text-gray-500">subdomain: {school.subdomain}</p>
      </div>

      {/* Stat Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard title="Total Staff" value={school._count.users} icon={<Users className="h-4 w-4 text-gray-500"/>} />
        <StatCard title="Total Students" value={school._count.students} icon={<GraduationCap className="h-4 w-4 text-gray-500"/>} />
        <StatCard title="Subscription Plan" value={school.plan?.name || 'Trial'} icon={<Package className="h-4 w-4 text-gray-500"/>} />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column for Details */}
        <div className="lg:col-span-1 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Enabled Modules</CardTitle>
            </CardHeader>
            <CardContent>
              {school.modules.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {school.modules.map(module => (
                    <Badge key={module.key} variant="secondary">{module.name}</Badge>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500">No modules enabled.</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column for User List */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Staff Members</CardTitle>
                  <CardDescription>A list of all staff at this school.</CardDescription>
                </div>
                <AddStaffDialog schoolId={school.id} />
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {school.users.map((user, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{user.name || 'N/A'}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell><Badge variant="outline">{user.role}</Badge></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}