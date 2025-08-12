'use client';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AssignSubjectDialog } from './assign-subject-dialog';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

export function SubjectAssignmentTab({ classId, assignments, allSubjects, allTeachers }) {
    const router = useRouter();

    const handleUnassign = (assignmentId) => {
        if (!confirm('Are you sure you want to unassign this subject?')) return;
        // API call to DELETE /api/class-subject-assignments/[assignmentId]
        toast.promise(fetch(`/api/class-subject-assignments/${assignmentId}`, { method: 'DELETE' }), {
            loading: 'Unassigning...',
            success: () => {
                router.refresh();
                return 'Subject unassigned.';
            },
            error: 'Failed to unassign.',
        });
    };

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Subject Assignments</CardTitle>
                <AssignSubjectDialog classId={classId} subjects={allSubjects} teachers={allTeachers} />
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader><TableRow><TableHead>Subject</TableHead><TableHead>Teacher</TableHead><TableHead>Actions</TableHead></TableRow></TableHeader>
                    <TableBody>
                        {assignments.map(a => (
                            <TableRow key={a.id}>
                                <TableCell>{a.subject.name}</TableCell>
                                <TableCell>{a.teacher.name}</TableCell>
                                <TableCell>
                                    <Button variant="ghost" size="icon" onClick={() => handleUnassign(a.id)}>
                                        <Trash2 className="h-4 w-4 text-red-500" />
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}