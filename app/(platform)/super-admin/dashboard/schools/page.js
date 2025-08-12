import { PrismaClient } from '@prisma/client';
import { AddSchoolDialog } from '../_components/add-school-dialog';
import { SchoolCard } from './_components/school-card';

const prisma = new PrismaClient();

export default async function ManageSchoolsPage() {
  // Fetch all data in parallel for performance
  const [schools, plans, allModules] = await Promise.all([
    prisma.school.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        plan: { select: { name: true } },
        modules: { select: { id: true } }, 
      },
    }),
    prisma.subscriptionPlan.findMany({
      where: { status: 'ACTIVE' },
      orderBy: { name: 'asc' },
    }),
    prisma.module.findMany({ orderBy: { name: 'asc' } }),
  ]);

  // Serialize plan prices to avoid client component errors
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
            <SchoolCard 
              key={school.id} 
              school={school} 
              plans={serializedPlans} 
              allModules={allModules}
            />
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