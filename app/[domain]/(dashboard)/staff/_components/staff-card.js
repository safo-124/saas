import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { StaffActions } from './staff-actions';

export function StaffCard({ staffMember }) {
  // Get initials for the avatar fallback
  const initials = staffMember.name?.split(' ').map(n => n[0]).join('') || '?';

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div className="flex items-center gap-4">
          <Avatar>
            <AvatarImage src={`https://api.dicebear.com/8.x/initials/svg?seed=${staffMember.name}`} />
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
          <div>
            <CardTitle>{staffMember.name || 'N/A'}</CardTitle>
            <CardDescription>{staffMember.email}</CardDescription>
          </div>
        </div>
        <StaffActions staffMember={staffMember} />
      </CardHeader>
      <CardContent>
        <Badge variant="secondary">{staffMember.role}</Badge>
      </CardContent>
    </Card>
  );
}