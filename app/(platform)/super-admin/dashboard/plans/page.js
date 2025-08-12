import { PrismaClient } from '@prisma/client';
import { PlanCard } from './_components/plan-card';
import { CreatePlanDialog } from './_components/create-plan-dialog';

const prisma = new PrismaClient();
    
export default async function ManagePlansPage() {
  const plansData = await prisma.subscriptionPlan.findMany({
    orderBy: { createdAt: 'asc' },
  });

  // Convert the Decimal 'price' to a string for each plan
  const plans = plansData.map(plan => ({
    ...plan,
    price: plan.price.toString(),
  }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Subscription Plans</h1>
        <CreatePlanDialog />
      </div>

      <p className="text-gray-500">
        Create and manage the subscription plans available for schools.
      </p>

      {plans.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Now we are passing the safe, serialized data to the client component */}
          {plans.map((plan) => (
            <PlanCard key={plan.id} plan={plan} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center h-64 border-2 border-dashed rounded-lg">
          <p className="text-lg text-gray-500">No subscription plans found.</p>
          <p className="text-sm text-gray-400">Create a plan to get started.</p>
        </div>
      )}
    </div>
  );
}