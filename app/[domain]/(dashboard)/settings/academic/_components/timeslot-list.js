'use client';

import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

// This is the individual item component
function TimeSlotItem({ slot }) {
    const router = useRouter();

    const handleDelete = () => {
        if (!confirm('Are you sure you want to delete this time slot?')) return;

        const promise = fetch(`/api/timeslots/${slot.id}`, {
            method: 'DELETE',
        }).then(res => {
            if (!res.ok) throw new Error('Failed to delete time slot.');
            return res.json();
        });

        toast.promise(promise, {
            loading: 'Deleting...',
            success: () => {
                router.refresh();
                return 'Time slot deleted successfully.';
            },
            error: (err) => err.message,
        });
    };

    return (
        <div className="flex justify-between items-center p-2 border-b last:border-b-0">
            <div>
                <span className="font-medium">Period {slot.periodNumber}</span>
                <span className="text-sm text-gray-500 ml-2">({slot.startTime} - {slot.endTime})</span>
                {slot.isBreak && <span className="text-xs text-blue-500 ml-2">(Break)</span>}
            </div>
            <Button variant="ghost" size="icon" onClick={handleDelete}>
                <Trash2 className="h-4 w-4 text-red-500" />
            </Button>
        </div>
    );
}

// This is the main component for this file
export function TimeSlotList({ timeSlots }) {
    // Group slots by day for display
    const slotsByDay = timeSlots.reduce((acc, slot) => {
        (acc[slot.dayOfWeek] = acc[slot.dayOfWeek] || []).push(slot);
        return acc;
    }, {});

    const daysInOrder = ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY", "SUNDAY"];
    const sortedDays = Object.keys(slotsByDay).sort((a, b) => daysInOrder.indexOf(a) - daysInOrder.indexOf(b));

    return (
        sortedDays.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {sortedDays.map((day) => (
                    <div key={day} className="border rounded-lg">
                        <h3 className="font-semibold p-4 bg-gray-50 border-b">{day.charAt(0).toUpperCase() + day.slice(1).toLowerCase()}</h3>
                        <div className="p-2">
                            {slotsByDay[day].map(slot => <TimeSlotItem key={slot.id} slot={slot} />)}
                        </div>
                    </div>
                ))}
            </div>
        ) : (
            <div className="text-center text-gray-500 py-12">No time slots defined yet.</div>
        )
    );
}