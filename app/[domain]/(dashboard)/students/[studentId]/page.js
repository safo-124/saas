import { PrismaClient } from '@prisma/client';
import { notFound } from 'next/navigation';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { format } from 'date-fns';

const prisma = new PrismaClient();

// Helper component for the Profile Tab
function ProfileInfo({ student }) {
    const guardian = student.guardianInfo || {};
    return (
        <Card>
            <CardHeader><CardTitle>Personal Information</CardTitle></CardHeader>
            <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <div><p className="font-semibold">Student ID</p><p>{student.studentId}</p></div>
                    <div><p className="font-semibold">Date of Birth</p><p>{student.dateOfBirth ? format(new Date(student.dateOfBirth), 'PPP') : 'N/A'}</p></div>
                    <div><p className="font-semibold">Guardian Name</p><p>{guardian.name || 'N/A'}</p></div>
                    <div><p className="font-semibold">Guardian Phone</p><p>{guardian.phone || 'N/A'}</p></div>
                </div>
            </CardContent>
        </Card>
    );
}

// Helper component for the Attendance Tab
function AttendanceHistory({ records }) {
    return (
        <Card>
            <CardHeader><CardTitle>Attendance History</CardTitle></CardHeader>
            <CardContent>
                {records.length > 0 ? (
                    <ul className="space-y-2">
                       {records.map(record => (
                           <li key={record.id} className="flex justify-between items-center p-2 border-b">
                               <span>{format(new Date(record.date), 'PPP')}</span>
                               <Badge variant={record.status === 'ABSENT' ? 'destructive' : 'secondary'}>{record.status}</Badge>
                           </li>
                       ))}
                    </ul>
                ) : (
                   <p className="text-center text-gray-500">No attendance records found.</p> 
                )}
            </CardContent>
        </Card>
    );
}

export default async function StudentProfilePage({ params }) {
  const student = await prisma.student.findUnique({
    where: { id: params.studentId, school: { subdomain: params.domain } },
    include: {
      class: { select: { name: true } },
      attendanceRecords: { orderBy: { date: 'desc' } },
    },
  });

  if (!student) {
    notFound();
  }

  const initials = student.name?.split(' ').map(n => n[0]).join('') || '?';

  return (
    <div className="space-y-6">
      {/* Profile Header */}
      <div className="flex items-center gap-6 p-4 bg-white rounded-lg shadow">
         <Avatar className="h-24 w-24">
            <AvatarImage src={`https://api.dicebear.com/8.x/initials/svg?seed=${student.name}`} />
            <AvatarFallback className="text-3xl">{initials}</AvatarFallback>
        </Avatar>
        <div>
            <h1 className="text-3xl font-bold">{student.name}</h1>
            <p className="text-gray-500">Class: {student.class?.name || 'Not Assigned'}</p>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="profile">
        <TabsList>
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="attendance">Attendance</TabsTrigger>
          <TabsTrigger value="grades" disabled>Grades</TabsTrigger>
        </TabsList>
        <TabsContent value="profile" className="mt-4">
          <ProfileInfo student={student} />
        </TabsContent>
        <TabsContent value="attendance" className="mt-4">
          <AttendanceHistory records={student.attendanceRecords} />
        </TabsContent>
      </Tabs>
    </div>
  );
}