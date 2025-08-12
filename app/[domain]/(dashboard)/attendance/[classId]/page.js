'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

export default function AttendancePage({ params }) {
    const [classData, setClassData] = useState(null);
    const [attendance, setAttendance] = useState({});
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const router = useRouter();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch(`/api/classes/${params.classId}/attendance-data`);
                if (!response.ok) throw new Error('Failed to fetch class data.');
                const data = await response.json();
                setClassData(data);
                // Initialize attendance state from fetched data
                const initialAttendance = data.students.reduce((acc, student) => {
                    acc[student.id] = student.status;
                    return acc;
                }, {});
                setAttendance(initialAttendance);
            } catch (error) {
                toast.error(error.message);
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, [params.classId]);

    const handleStatusChange = (studentId, status) => {
        setAttendance(prev => ({ ...prev, [studentId]: status }));
    };

    const handleSubmit = async () => {
        setIsSubmitting(true);
        const attendanceData = Object.entries(attendance).map(([studentId, status]) => ({ studentId, status }));
        
        const promise = fetch('/api/attendance', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ classId: params.classId, attendanceData }),
        }).then(res => {
            if (!res.ok) throw new Error('Failed to submit attendance.');
            return res.json();
        });

        toast.promise(promise, {
            loading: 'Submitting attendance...',
            success: () => {
                router.push('/dashboard');
                return 'Attendance submitted successfully!';
            },
            error: (err) => err.message,
        });
        setIsSubmitting(false);
    };

    if (isLoading) {
        return <div className="flex justify-center items-center h-64"><Loader2 className="h-8 w-8 animate-spin" /></div>;
    }

    if (!classData) {
        return <div className="text-center text-red-500">Could not load class data.</div>;
    }

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold">Attendance for {classData.className}</h1>
            <Card>
                <CardHeader>
                    <CardTitle>Date: {new Date().toLocaleDateString()}</CardTitle>
                    <CardDescription>Mark the attendance for each student below.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {classData.students.map(student => {
                        const initials = student.name?.split(' ').map(n => n[0]).join('') || '?';
                        return (
                            <div key={student.id} className="flex items-center justify-between p-4 border rounded-lg">
                                <div className="flex items-center gap-4">
                                    <Avatar>
                                        <AvatarImage src={`https://api.dicebear.com/8.x/initials/svg?seed=${student.name}`} />
                                        <AvatarFallback>{initials}</AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <div className="font-medium">{student.name}</div>
                                        <div className="text-sm text-gray-500">ID: {student.studentId}</div>
                                    </div>
                                </div>
                                <RadioGroup
                                    defaultValue={attendance[student.id]}
                                    onValueChange={(status) => handleStatusChange(student.id, status)}
                                    className="flex items-center gap-4"
                                >
                                    <div className="flex items-center space-x-2"><RadioGroupItem value="PRESENT" id={`${student.id}-present`} /><Label htmlFor={`${student.id}-present`}>Present</Label></div>
                                    <div className="flex items-center space-x-2"><RadioGroupItem value="ABSENT" id={`${student.id}-absent`} /><Label htmlFor={`${student.id}-absent`}>Absent</Label></div>
                                    <div className="flex items-center space-x-2"><RadioGroupItem value="LATE" id={`${student.id}-late`} /><Label htmlFor={`${student.id}-late`}>Late</Label></div>
                                </RadioGroup>
                            </div>
                        );
                    })}
                    <Button onClick={handleSubmit} disabled={isSubmitting} className="w-full mt-6">
                        {isSubmitting ? 'Submitting...' : 'Submit Attendance'}
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}