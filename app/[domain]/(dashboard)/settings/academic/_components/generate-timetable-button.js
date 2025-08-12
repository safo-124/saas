'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Wand2 } from 'lucide-react';

export function GenerateTimetableButton() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleGenerate = async () => {
    setIsLoading(true);
    const promise = fetch('/api/timetable/generate', {
      method: 'POST',
    }).then(res => {
      if (!res.ok) throw new Error('Failed to generate timetable.');
      return res.json();
    });

    toast.promise(promise, {
      loading: 'Generating timetable... This may take a minute.',
      success: () => {
        router.refresh(); // Refresh data on other pages
        return 'Timetable generated successfully!';
      },
      error: (err) => err.message,
    });

    setIsLoading(false);
  };

  return (
    <Button onClick={handleGenerate} disabled={isLoading}>
      <Wand2 className="mr-2 h-4 w-4" />
      {isLoading ? 'Generating...' : 'Generate Timetable'}
    </Button>
  );
}