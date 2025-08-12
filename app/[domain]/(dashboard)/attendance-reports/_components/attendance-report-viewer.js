'use client';

import { useState, useEffect } from 'react';
import { format } from "date-fns";
import { Calendar as CalendarIcon, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export function AttendanceReportViewer({ classes }) {
    const [selectedClass, setSelectedClass] = useState(classes[0]?.id || '');
    const [date, setDate] = useState(new Date());
    const [report, setReport] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    const fetchReport = async () => {
        if (!selectedClass || !date) return;
        setIsLoading(true);
        const formattedDate = format(date, "yyyy-MM-dd");
        try {
            const response = await fetch(`/api/attendance-reports?classId=${selectedClass}&date=${formattedDate}`);
            const data = await response.json();
            setReport(data);
        } catch (error) {
            console.error("Failed to fetch report", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchReport();
    }, [selectedClass, date]);

    const getStatusVariant = (status) => {
        if (status === 'PRESENT') return 'success';
        if (status === 'ABSENT') return 'destructive';
        return 'secondary';
    };

    return (
        <div className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-4">
                <Select value={selectedClass} onValueChange={setSelectedClass}>
                    <SelectTrigger className="w-full sm:w-[280px]"><SelectValue placeholder="Select a class" /></SelectTrigger>
                    <SelectContent>{classes.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
                </Select>
                <Popover>
                    <PopoverTrigger asChild>
                        <Button variant={"outline"} className="w-full sm:w-[280px] justify-start text-left font-normal">
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {date ? format(date, "PPP") : <span>Pick a date</span>}
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0"><Calendar mode="single" selected={date} onSelect={setDate} initialFocus /></PopoverContent>
                </Popover>
            </div>

            <Card>
                <CardHeader><CardTitle>Attendance Report</CardTitle></CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="flex justify-center items-center h-64"><Loader2 className="h-8 w-8 animate-spin"/></div>
                    ) : (
                        <Table>
                            <TableHeader><TableRow><TableHead>Student Name</TableHead><TableHead>Student ID</TableHead><TableHead>Status</TableHead></TableRow></TableHeader>
                            <TableBody>
                                {report.map(student => (
                                    <TableRow key={student.id}>
                                        <TableCell className="font-medium">{student.name}</TableCell>
                                        <TableCell>{student.studentId}</TableCell>
                                        <TableCell><Badge variant={getStatusVariant(student.status)}>{student.status}</Badge></TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}