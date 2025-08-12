import { PrismaClient } from '@prisma/client';
import { AddSchoolDialog } from '../_components/add-school-dialog';
import { SchoolCard } from './_components/school-card';

const prisma = new PrismaClient();

export default async function ManageSchoolsPage() {
  // Fetch both schools and active plans in parallel
  const [schools, plans] = await Promise.all([
    prisma.school.findMany({
      orderBy: { createdAt: 'desc' },
      // Include the plan details with each school for display purposes
      include: {
        plan: {
          select: {
            name: true,
          }
        }
      }
    }),
    prisma.subscriptionPlan.findMany({
      where: { status: 'ACTIVE' },
      orderBy: { name: 'asc' },
    }),
  ]);

  // Convert the Decimal 'price' to a string for each plan to avoid serialization errors
  const serializedPlans = plans.map(plan => ({
    ...plan,
    price: plan.price.toString(),
  }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">School Management</h1>
        <AddSchoolDialog />
      </div>

      {schools.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {schools.map((school) => (
            // Pass the list of available plans down to each card
            <SchoolCard key={school.id} school={school} plans={serializedPlans} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center h-64 border-2 border-dashed rounded-lg">
          <p className="text-lg text-gray-500">No schools found.</p>
          <p className="text-sm text-gray-400">Add a new school to get started.</p>
        </div>
      )}
    </div>
  );
}