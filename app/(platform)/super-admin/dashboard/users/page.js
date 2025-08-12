import { PrismaClient } from '@prisma/client';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { SearchBar } from './_components/search-bar';
import { UserActions } from './_components/user-actions';

const prisma = new PrismaClient();

// This page accepts search params from the URL, e.g., /users?q=test@example.com
export default async function GlobalUsersPage({ searchParams }) {
  const query = searchParams.q || '';

  const users = await prisma.user.findMany({
    where: {
      OR: [
        { email: { contains: query, mode: 'insensitive' } },
        { name: { contains: query, mode: 'insensitive' } },
      ],
    },
    include: {
      // We must include the school data to display the school's name
      school: {
        select: {
          name: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Global User Management</h1>
      </div>
      
      {/* The SearchBar component handles the client-side logic for updating the URL query */}
      <SearchBar initialQuery={query} />

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead className="hidden sm:table-cell">School</TableHead>
              <TableHead>Role</TableHead>
              <TableHead className="hidden md:table-cell">Joined At</TableHead>
              <TableHead>
                <span className="sr-only">Actions</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.length === 0 ? (
              <TableRow>
                <TableCell colSpan="5" className="h-24 text-center">
                  No users found for your query.
                </TableCell>
              </TableRow>
            ) : (
              users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">
                    <div>{user.name || 'No Name Provided'}</div>
                    <div className="text-sm text-gray-500">{user.email}</div>
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">{user.school.name}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">{user.role}</Badge>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <UserActions user={user} />
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}