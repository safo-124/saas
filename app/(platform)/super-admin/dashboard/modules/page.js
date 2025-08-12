import { PrismaClient } from '@prisma/client';
import { CreateModuleDialog } from './_components/create-module-dialog';
import { ModuleCard } from './_components/module-card';

const prisma = new PrismaClient();

export default async function ManageModulesPage() {
  const modules = await prisma.module.findMany({
    orderBy: { name: 'asc' },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Available Modules</h1>
        <CreateModuleDialog />
      </div>

      <p className="text-gray-500">
        Create and manage the modules that can be enabled for schools.
      </p>

      {modules.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {modules.map((module) => (
            <ModuleCard key={module.id} module={module} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center h-64 border-2 border-dashed rounded-lg">
          <p className="text-lg text-gray-500">No modules found.</p>
          <p className="text-sm text-gray-400">Create a module to get started.</p>
        </div>
      )}
    </div>
  );
}