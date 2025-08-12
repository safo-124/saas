import { PrismaClient } from '@prisma/client';
import { AddStaffDialog } from './_components/add-staff-dialog';
import { StaffCard } from './_components/staff-card';
import { StaffDataTable } from './_components/staff-data-table';
import { columns } from './_components/columns';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { List, LayoutGrid } from 'lucide-react';

const prisma = new PrismaClient();
    
export default async function StaffManagementPage({ params, searchParams }) {
  // Read the view from URL search params, default to 'grid'
  const view = searchParams.view || 'grid';

  const school = await prisma.school.findUnique({
    where: { subdomain: params.domain },
    select: { id: true },
  });

  if (!school) {
    return <div>School not found.</div>;
  }

  const staff = await prisma.user.findMany({
    where: { schoolId: school.id },
    orderBy: { name: 'asc' },
  });
    
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Staff Management</h1>
        <div className="flex items-center gap-2">
          {/* View Toggle */}
          <Link href="?view=grid" scroll={false}>
            <Button variant={view === 'grid' ? 'default' : 'outline'} size="icon">
              <LayoutGrid className="h-4 w-4" />
            </Button>
          </Link>
          <Link href="?view=list" scroll={false}>
            <Button variant={view === 'list' ? 'default' : 'outline'} size="icon">
              <List className="h-4 w-4" />
            </Button>
          </Link>
          <AddStaffDialog />
        </div>
      </div>

      {view === 'grid' ? (
        // Render the Card Grid
        staff.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {staff.map((staffMember) => (
              <StaffCard key={staffMember.id} staffMember={staffMember} />
            ))}
          </div>
        ) : (
          <div className="text-center text-gray-500 py-12">No staff members found.</div>
        )
      ) : (
        // Render the Data Table
        <StaffDataTable columns={columns} data={staff} />
      )}
    </div>
  );
}