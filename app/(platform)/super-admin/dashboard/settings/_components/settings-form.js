'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';

export function SettingsForm({ currentSettings }) {
  const [maintenanceMode, setMaintenanceMode] = useState(currentSettings.maintenanceMode === 'true');
  const [allowSignups, setAllowSignups] = useState(currentSettings.allowNewSignups === 'true');
  const [isLoading, setIsLoading] = useState(false);

  const handleSaveChanges = async () => {
    setIsLoading(true);
    const promise = fetch('/api/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        maintenanceMode: String(maintenanceMode),
        allowNewSignups: String(allowSignups),
      }),
    }).then(res => {
      if (!res.ok) throw new Error('Failed to save settings.');
      return res.json();
    });

    toast.promise(promise, {
      loading: 'Saving settings...',
      success: 'Settings saved successfully!',
      error: (err) => err.message,
    });

    setIsLoading(false);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>General Settings</CardTitle>
        <CardDescription>Manage global application settings.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between p-4 border rounded-lg">
          <div>
            <Label htmlFor="maintenance-mode" className="font-semibold">Maintenance Mode</Label>
            <p className="text-sm text-gray-500">Redirect all non-admin traffic to a maintenance page.</p>
          </div>
          <Switch
            id="maintenance-mode"
            checked={maintenanceMode}
            onCheckedChange={setMaintenanceMode}
          />
        </div>
        <div className="flex items-center justify-between p-4 border rounded-lg">
          <div>
            <Label htmlFor="allow-signups" className="font-semibold">Allow New Sign-ups</Label>
            <p className="text-sm text-gray-500">Enable or disable the ability for new schools to sign up.</p>
          </div>
          <Switch
            id="allow-signups"
            checked={allowSignups}
            onCheckedChange={setAllowSignups}
          />
        </div>
        <Button onClick={handleSaveChanges} disabled={isLoading}>
          {isLoading ? 'Saving...' : 'Save Changes'}
        </Button>
      </CardContent>
    </Card>
  );
}