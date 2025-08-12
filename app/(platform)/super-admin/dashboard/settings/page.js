import { PrismaClient } from '@prisma/client';
import { SettingsForm } from './_components/settings-form';

const prisma = new PrismaClient();

export default async function SettingsPage() {
  const settings = await prisma.setting.findMany();

  // Convert the array of settings into a more usable object
  const settingsMap = settings.reduce((acc, setting) => {
    acc[setting.key] = setting.value;
    return acc;
  }, {});

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">System Settings</h1>
      <SettingsForm currentSettings={settingsMap} />
    </div>
  );
}