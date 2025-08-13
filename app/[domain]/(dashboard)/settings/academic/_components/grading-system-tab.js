'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Trash2, PlusCircle } from 'lucide-react';

export function GradingSystemTab({ school }) {
  const [weights, setWeights] = useState({ exam: 70, assignment: 20, classwork: 10 });
  const [grades, setGrades] = useState([{ grade: 'A', min: 90, remarks: 'Excellent' }]);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (school?.gradingSystem) {
      setWeights(school.gradingSystem.weights);
      setGrades(school.gradingSystem.grades);
    }
  }, [school]);

  const handleWeightChange = (e) => {
    const { name, value } = e.target;
    setWeights(prev => ({ ...prev, [name]: parseInt(value, 10) || 0 }));
  };
  
  const handleGradeChange = (index, field, value) => {
    const newGrades = [...grades];
    newGrades[index][field] = field === 'min' ? parseInt(value, 10) || 0 : value;
    setGrades(newGrades);
  };

  const addGradeRow = () => {
    setGrades([...grades, { grade: '', min: 0, remarks: '' }]);
  };

  const removeGradeRow = (index) => {
    setGrades(grades.filter((_, i) => i !== index));
  };

  const totalWeight = Object.values(weights).reduce((acc, val) => acc + val, 0);

  const handleSaveChanges = async () => {
    if (totalWeight !== 100) {
      toast.error('Total assessment weight must add up to 100%.');
      return;
    }
    setIsLoading(true);
    const promise = fetch('/api/settings/grading', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ weights, grades }),
    }).then(res => {
      if (!res.ok) throw new Error('Failed to save settings.');
      return res.json();
    });

    toast.promise(promise, {
      loading: 'Saving grading system...',
      success: () => { router.refresh(); return 'Grading system saved successfully!'; },
      error: (err) => err.message,
    });
    setIsLoading(false);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Assessment Weighting</CardTitle>
          <CardDescription>Define the percentage contribution of each assessment type. Total must be 100%.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div className="grid gap-2"><Label>Exams (%)</Label><Input type="number" name="exam" value={weights.exam} onChange={handleWeightChange} /></div>
            <div className="grid gap-2"><Label>Assignments (%)</Label><Input type="number" name="assignment" value={weights.assignment} onChange={handleWeightChange} /></div>
            <div className="grid gap-2"><Label>Classwork (%)</Label><Input type="number" name="classwork" value={weights.classwork} onChange={handleWeightChange} /></div>
          </div>
          <div className={`font-bold ${totalWeight === 100 ? 'text-green-600' : 'text-red-600'}`}>
            Total: {totalWeight}%
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Grade Boundaries</CardTitle>
          <CardDescription>Define the letter grades and their minimum percentage.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          {grades.map((g, index) => (
            <div key={index} className="flex items-center gap-2">
              <Input placeholder="Grade" value={g.grade} onChange={(e) => handleGradeChange(index, 'grade', e.target.value)} />
              <Input type="number" placeholder="Min %" value={g.min} onChange={(e) => handleGradeChange(index, 'min', e.target.value)} />
              <Input placeholder="Remarks" value={g.remarks} onChange={(e) => handleGradeChange(index, 'remarks', e.target.value)} />
              <Button variant="ghost" size="icon" onClick={() => removeGradeRow(index)}><Trash2 className="h-4 w-4" /></Button>
            </div>
          ))}
          <Button variant="outline" size="sm" onClick={addGradeRow}><PlusCircle className="mr-2 h-4 w-4" />Add Grade</Button>
        </CardContent>
      </Card>
      
      <Button onClick={handleSaveChanges} disabled={isLoading}>{isLoading ? 'Saving...' : 'Save Grading System'}</Button>
    </div>
  );
}