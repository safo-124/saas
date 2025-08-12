import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { SchoolActions } from "../../_components/school-actions";

// Helper function to determine the visual style of the status badge
const getStatusBadgeVariant = (status) => {
  switch (status) {
    case 'ACTIVE': return 'default';
    case 'TRIAL': return 'secondary';
    case 'INACTIVE': return 'outline';
    case 'DEACTIVATED': return 'destructive';
    default: return 'default';
  }
};

export function SchoolCard({ school, plans }) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-xl">{school.name}</CardTitle>
            <CardDescription>subdomain: {school.subdomain}</CardDescription>
          </div>
          {/* The actions dropdown menu, now with plans passed to it */}
          <SchoolActions school={school} plans={plans} />
        </div>
      </CardHeader>
      <CardContent className="space-x-2">
        <Badge variant={getStatusBadgeVariant(school.subscriptionStatus)}>
          {school.subscriptionStatus}
        </Badge>
        {/* Display the assigned plan name if it exists */}
        {school.plan ? (
            <Badge variant="outline">{school.plan.name}</Badge>
        ) : (
            <Badge variant="outline">Trial</Badge>
        )}
      </CardContent>
      <CardFooter>
        <p className="text-sm text-gray-500">
          Created on: {new Date(school.createdAt).toLocaleDateString()}
        </p>
      </CardFooter>
    </Card>
  );
}