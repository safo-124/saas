'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Input } from '@/components/ui/input';

export function SearchBar({ initialQuery }) {
  const router = useRouter();
  const pathname = usePathname();
  const [query, setQuery] = useState(initialQuery || '');

  // Use a debounce effect to avoid sending a request on every keystroke
  useEffect(() => {
    const handler = setTimeout(() => {
      if (query) {
        router.push(`${pathname}?q=${query}`);
      } else {
        router.push(pathname); // If query is cleared, go back to the base URL
      }
    }, 300); // 300ms delay

    return () => {
      clearTimeout(handler);
    };
  }, [query, pathname, router]);

  return (
    <Input
      placeholder="Search by user name or email..."
      value={query}
      onChange={(e) => setQuery(e.target.value)}
      className="max-w-sm"
    />
  );
}