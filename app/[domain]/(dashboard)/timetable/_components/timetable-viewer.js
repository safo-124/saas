'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

// This is the reusable grid component
function TimetableGrid({ entries, timeSlots, viewMode }) {
  const days = ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY"];
  const periods = Array.from({ length: Math.max(0, ...timeSlots.map(ts => ts.periodNumber)) }, (_, i) => i + 1);

  return (
    <Card>
      <CardContent className="p-2">
        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse">
            <thead>
              <tr className="bg-gray-100">
                <th className="p-2 border text-xs sm:text-sm font-semibold text-gray-600">Period</th>
                {days.map(day => (
                  <th key={day} className="p-2 border text-xs sm:text-sm font-semibold text-gray-600 capitalize">{day.toLowerCase()}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {periods.map(period => (
                <tr key={period}>
                  <td className="p-2 border font-medium text-center bg-gray-50">
                    <div className="text-xs sm:text-sm">{period}</div>
                    <div className="text-xs text-gray-500">{timeSlots.find(ts => ts.periodNumber === period)?.startTime}</div>
                  </td>
                  {days.map(day => {
                    const entry = entries.find(e => e.timeSlot.dayOfWeek === day && e.timeSlot.periodNumber === period);
                    return (
                      <td key={day} className="p-2 border text-center h-20">
                        {entry ? (
                          <div className="bg-blue-100 text-blue-800 rounded-lg p-1 text-xs sm:text-sm">
                            <div className="font-bold">{entry.subject.name}</div>
                            <div>{viewMode === 'class' ? entry.teacher.name : entry.class.name}</div>
                          </div>
                        ) : null}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}

// This is the main component for this file
export function TimetableViewer({ classes, teachers, timeSlots, allEntries }) {
  const [selectedClass, setSelectedClass] = useState(classes[0]?.id || '');
  const [selectedTeacher, setSelectedTeacher] = useState(teachers[0]?.id || '');

  const classEntries = allEntries.filter(e => e.classId === selectedClass);
  const teacherEntries = allEntries.filter(e => e.teacherId === selectedTeacher);

  return (
    <Tabs defaultValue="class">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="class">View by Class</TabsTrigger>
        <TabsTrigger value="teacher">View by Teacher</TabsTrigger>
      </TabsList>

      <TabsContent value="class" className="space-y-4">
        <Select value={selectedClass} onValueChange={setSelectedClass}>
          <SelectTrigger className="w-full sm:w-[280px]">
            <SelectValue placeholder="Select a class to view its timetable" />
          </SelectTrigger>
          <SelectContent>
            {classes.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
          </SelectContent>
        </Select>
        <TimetableGrid entries={classEntries} timeSlots={timeSlots} viewMode="class" />
      </TabsContent>

      <TabsContent value="teacher" className="space-y-4">
        <Select value={selectedTeacher} onValueChange={setSelectedTeacher}>
          <SelectTrigger className="w-full sm:w-[280px]">
            <SelectValue placeholder="Select a teacher to view their timetable" />
          </SelectTrigger>
          <SelectContent>
            {teachers.map(t => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}
          </SelectContent>
        </Select>
        <TimetableGrid entries={teacherEntries} timeSlots={timeSlots} viewMode="teacher" />
      </TabsContent>
    </Tabs>
  );
}