'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { LayoutGrid, Building, Users, CreditCard, Settings2, LogOut } from 'lucide-react';

const navItems = [
  { name: 'Overview', href: '/super-admin/dashboard', icon: LayoutGrid },
  { name: 'Schools', href: '/super-admin/dashboard/schools', icon: Building },
  { name: 'Users', href: '/super-admin/dashboard/users', icon: Users },
  { name: 'Plans', href: '/super-admin/dashboard/plans', icon: CreditCard },
  { name: 'Settings', href: '/super-admin/dashboard/settings', icon: Settings2 },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/super-admin/sign-in');
  };

  return (
    <aside className="w-64 h-screen flex flex-col fixed left-0 top-0 bg-gray-900 text-white">
      <div className="p-6 text-2xl font-bold border-b border-gray-700">
        SaaS Admin
      </div>
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => (
          <Link
            key={item.name}
            href={item.href}
            className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-colors text-sm ${
              pathname === item.href
                ? 'bg-blue-600 text-white'
                : 'text-gray-400 hover:bg-gray-800 hover:text-white'
            }`}
          >
            <item.icon className="h-4 w-4" />
            <span>{item.name}</span>
          </Link>
        ))}
      </nav>
      <div className="p-4 border-t border-gray-700">
        <Button
          variant="ghost"
          className="w-full justify-start text-gray-400 hover:bg-gray-800 hover:text-white"
          onClick={handleLogout}
        >
          <LogOut className="h-4 w-4 mr-3" />
          Logout
        </Button>
      </div>
    </aside>
  );
}