'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from '@/components/ui/button';
import { 
  LogOut, Settings, Users, Book, CalendarDays, FileText, 
  GraduationCap, LayoutDashboard, ClipboardCheck, Library, 
  Package, Banknote, Megaphone 
} from 'lucide-react';

// A reusable component for items within the navigation dropdowns
const ListItem = (({ className, title, icon: Icon, children, ...props }) => {
  return (
    <li>
      <NavigationMenuLink asChild>
        <a
          className="flex select-none space-x-4 items-center rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
          {...props}
        >
          <Icon className="h-5 w-5 text-muted-foreground" />
          <div className="space-y-1">
            <div className="text-sm font-medium leading-none">{title}</div>
            <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
              {children}
            </p>
          </div>
        </a>
      </NavigationMenuLink>
    </li>
  );
});

export function Navbar({ schoolName }) {
  const router = useRouter();

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/sign-in');
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-40 bg-white border-b shadow-sm no-print">
      <div className="container mx-auto flex h-16 items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/dashboard" className="text-lg font-bold">
            {schoolName}
          </Link>
          <NavigationMenu>
            <NavigationMenuList>
              {/* Dashboard Link */}
              <NavigationMenuItem>
                <Link href="/dashboard" legacyBehavior passHref>
                  <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                    Dashboard
                  </NavigationMenuLink>
                </Link>
              </NavigationMenuItem>
              
              {/* Academics Dropdown */}
              <NavigationMenuItem>
                <NavigationMenuTrigger>Academics</NavigationMenuTrigger>
                <NavigationMenuContent>
                  <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2">
                    <ListItem href="/classes" title="Classes & Subjects" icon={Book}>Manage classes, sections, and subject assignments.</ListItem>
                    <ListItem href="/timetable" title="Timetable" icon={CalendarDays}>View class and teacher timetables.</ListItem>
                    <ListItem href="/exams" title="Exams" icon={FileText}>Create examination sessions.</ListItem>
                    <ListItem href="/grading" title="Mark Entry" icon={GraduationCap}>Enter student marks for exams.</ListItem>
                  </ul>
                </NavigationMenuContent>
              </NavigationMenuItem>

              {/* People Dropdown */}
              <NavigationMenuItem>
                <NavigationMenuTrigger>People</NavigationMenuTrigger>
                <NavigationMenuContent>
                  <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2">
                    <ListItem href="/students" title="Students" icon={GraduationCap}>Manage all student profiles.</ListItem>
                    <ListItem href="/staff" title="Staff" icon={Users}>Manage all staff and teacher profiles.</ListItem>
                  </ul>
                </NavigationMenuContent>
              </NavigationMenuItem>

               {/* Operations Dropdown */}
               <NavigationMenuItem>
                <NavigationMenuTrigger>Operations</NavigationMenuTrigger>
                <NavigationMenuContent>
                  <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2">
                    <ListItem href="/attendance-reports" title="Attendance" icon={ClipboardCheck}>Track and view student attendance.</ListItem>
                    <ListItem href="/announcements" title="Announcements" icon={Megaphone}>Post school-wide notices.</ListItem>
                    <ListItem href="/library" title="Library" icon={Library}>Manage library books and lending.</ListItem>
                    <ListItem href="/stores" title="Stores" icon={Package}>Manage school inventory.</ListItem>
                  </ul>
                </NavigationMenuContent>
              </NavigationMenuItem>

              {/* Financials Link */}
              <NavigationMenuItem>
                <Link href="/fees" legacyBehavior passHref>
                  <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                    Financials
                  </NavigationMenuLink>
                </Link>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>
        </div>
        
        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-8 w-8 rounded-full">
              <Avatar className="h-8 w-8">
                <AvatarFallback>U</AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">Admin User</p>
                <p className="text-xs leading-none text-muted-foreground">admin@example.com</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/settings/academic"><Settings className="mr-2 h-4 w-4" /><span>Settings</span></Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}