// app/_components/impersonation-banner.js
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { jwtDecode } from 'jwt-decode';
import Cookies from 'js-cookie'; // Using js-cookie for easier client-side cookie access
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';

export function ImpersonationBanner() {
  const router = useRouter();
  const [isImpersonating, setIsImpersonating] = useState(false);

  useEffect(() => {
    // Install js-cookie: npm install js-cookie
    const token = Cookies.get('auth_token');
    if (token) {
      try {
        const decoded = jwtDecode(token);
        // Check for the special claim we added
        if (decoded.impersonatedBy) {
          setIsImpersonating(true);
        }
      } catch (error) {
        console.error("Invalid token:", error);
      }
    }
  }, []);

  const handleStopImpersonating = async () => {
    const promise = fetch('/api/auth/stop-impersonating', {
      method: 'POST',
    }).then(async (response) => {
      if (!response.ok) throw new Error('Failed to stop impersonating.');
      return response.json();
    });

    toast.promise(promise, {
      loading: 'Ending session...',
      success: (data) => {
        // Redirect on the client side
        window.location.href = data.redirectUrl;
        return 'Returned to your admin session.';
      },
      error: (err) => err.message,
    });
  };

  if (!isImpersonating) {
    return null; // Don't render anything if not impersonating
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-yellow-400 text-black p-4 flex items-center justify-center gap-4">
      <AlertTriangle className="h-6 w-6" />
      <div className="text-center font-semibold">
        You are currently impersonating another user.
      </div>
      <Button
        variant="secondary"
        size="sm"
        onClick={handleStopImpersonating}
      >
        Return to Admin
      </Button>
    </div>
  );
}