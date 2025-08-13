'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Loader2 } from 'lucide-react';

export function MarkEntryForm({ exams, teacherAssignments }) {
    const [selectedExam, setSelectedExam] = useState('');
    const [selectedClass, setSelectedClass] = useState('');
    const [selectedSubject, setSelectedSubject] = useState('');

    const [availableSubjects, setAvailableSubjects] = useState([]);
    const [markSheet, setMarkSheet] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    // Update available subjects when a class is selected
    useEffect(() => {
        if (selectedClass) {
            const assignment = teacherAssignments.find(a => a.classId === selectedClass);
            setAvailableSubjects(assignment ? assignment.subjects : []);
            setSelectedSubject('');
        }
    }, [selectedClass, teacherAssignments]);

    const handleLoadStudents = async () => {
        if (!selectedExam || !selectedClass || !selectedSubject) {
            toast.error('Please select an exam, class, and subject.');
            return;
        }
        setIsLoading(true);
        try {
            const res = await fetch(`/api/grades/sheet?examId=${selectedExam}&classId=${selectedClass}&subjectId=${selectedSubject}`);
            if (!res.ok) throw new Error('Failed to load students.');
            const data = await res.json();
            setMarkSheet(data);
        } catch (error) {
            toast.error(error.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleMarkChange = (studentId, field, value) => {
        setMarkSheet(prev => prev.map(student => 
            student.studentId === studentId ? { ...student, [field]: value } : student
        ));
    };

    const handleSubmitGrades = async () => {
         // API call to POST /api/grades
    };

    return (
        <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {/* Selectors for Exam, Class, Subject */}
                <Button onClick={handleLoadStudents} className="md:self-end">Load Students</Button>
            </div>

            {isLoading && <div className="flex justify-center"><Loader2 className="animate-spin" /></div>}

            {markSheet.length > 0 && (
                <Table>
                    {/* Table Header */}
                    <TableBody>
                        {markSheet.map(student => (
                            <TableRow key={student.studentId}>
                                <TableCell>{student.name}</TableCell>
                                <TableCell><Input type="number" value={student.examMarks} onChange={e => handleMarkChange(student.studentId, 'examMarks', e.target.value)} /></TableCell>
                                <TableCell><Input type="number" value={student.maxExamMarks} onChange={e => handleMarkChange(student.studentId, 'maxExamMarks', e.target.value)} /></TableCell>
                                <TableCell><Input value={student.remarks} onChange={e => handleMarkChange(student.studentId, 'remarks', e.target.value)} /></TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            )}
        </div>
    );
}