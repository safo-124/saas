'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Users, Book, Banknote, Megaphone, Library, Package, BookOpen, Settings, CalendarDays, ClipboardCheck, FileText, GraduationCap } from 'lucide-react';

// These items correspond to the modules a school can have
const navItems = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Attendance', href: '/attendance-reports', icon: ClipboardCheck },
  { name: 'Timetable', href: '/timetable', icon: CalendarDays },
  { name: 'Staff', href: '/staff', icon: Users },
  { name: 'Students', href: '/students', icon: Users },
  { name: 'Classes', href: '/classes', icon: Book },
    { name: 'Subjects', href: '/subjects', icon: BookOpen },
     { name: 'Exams', href: '/exams', icon: FileText },
      { name: 'Mark Entry', href: '/grading', icon: GraduationCap },
  { name: 'Fees', href: '/fees', icon: Banknote },
  { name: 'Library', href: '/library', icon: Library },
  { name: 'Stores', href: '/stores', icon: Package },
  { name: 'Announcements', href: '/announcements', icon: Megaphone },
  { name: 'Settings', href: '/settings/academic', icon: Settings }, 
];

export function Sidebar({ schoolName }) {
  const pathname = usePathname();

  return (
    <aside className="w-64 h-screen flex flex-col bg-gray-800 text-white fixed left-0 top-0">
      <div className="p-6 text-2xl font-bold border-b border-gray-700">
        {schoolName}
      </div>
      <nav className="flex-1 p-4 space-y-2">
        {navItems.map((item) => (
          <Link
            key={item.name}
            href={item.href}
            className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-colors ${
              pathname.startsWith(item.href) && item.href !== '/dashboard' || pathname === item.href
                ? 'bg-blue-600 text-white'
                : 'text-gray-300 hover:bg-gray-700 hover:text-white'
            }`}
          >
            <item.icon className="h-5 w-5" />
            <span>{item.name}</span>
          </Link>
        ))}
      </nav>
      <div className="p-4 border-t border-gray-700">
        {/* We can add logged-in user info here later */}
      </div>
    </aside>
  );
}