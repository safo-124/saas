import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export function StudentCard({ student }) {
  const initials = student.name?.split(' ').map(n => n[0]).join('') || '?';

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div className="flex items-center gap-4">
          <Avatar>
            <AvatarImage src={`https://api.dicebear.com/8.x/initials/svg?seed=${student.name}`} />
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
          <div>
            <CardTitle>{student.name}</CardTitle>
            <CardDescription>ID: {student.studentId}</CardDescription>
          </div>
        </div>
        {/* Actions menu will go here later */}
      </CardHeader>
    </Card>
  );
}