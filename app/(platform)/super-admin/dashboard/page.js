// app/(platform)/super-admin/dashboard/page.js
import { PrismaClient } from '@prisma/client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatCard } from './_components/stat-card';
import { OverviewChart } from './_components/overview-chart';

const prisma = new PrismaClient();

export default async function SuperAdminOverviewPage() {
  const [totalSchools, totalUsers, activeSchools, trialSchools] = await Promise.all([
    prisma.school.count(),
    prisma.user.count(),
    prisma.school.count({ where: { subscriptionStatus: 'ACTIVE' } }),
    prisma.school.count({ where: { subscriptionStatus: 'TRIAL' } }),
  ]);

  const chartData = [
      { name: "Jan", total: Math.floor(Math.random() * 5) + 2 },
      { name: "Feb", total: Math.floor(Math.random() * 5) + 3 },
      { name: "Mar", total: Math.floor(Math.random() * 5) + 4 },
      { name: "Apr", total: Math.floor(Math.random() * 5) + 4 },
      { name: "May", total: Math.floor(Math.random() * 5) + 6 },
      { name: "Jun", total: Math.floor(Math.random() * 5) + 7 },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Overview</h1>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total Schools" value={totalSchools} icon={'🏫'} />
        <StatCard title="Total Users" value={totalUsers} icon={'👥'} />
        <StatCard title="Active Subscriptions" value={activeSchools} icon={'✅'} />
        <StatCard title="Trialing Schools" value={trialSchools} icon={'⏳'} />
      </div>
      <Card>
        <CardHeader>
          <CardTitle>New Schools Overview</CardTitle>
        </CardHeader>
        <CardContent className="pl-2">
          <OverviewChart data={chartData} />
        </CardContent>
      </Card>
    </div>
  );
}