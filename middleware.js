import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// --- Simple In-Memory Cache for Settings ---
const settingsCache = {
  maintenanceMode: null,
  timestamp: null,
};
const CACHE_DURATION_MS = 10000; // Cache for 10 seconds

async function getMaintenanceMode() {
  const now = Date.now();
  // If cache is valid, return the cached value
  if (settingsCache.timestamp && (now - settingsCache.timestamp) < CACHE_DURATION_MS) {
    return settingsCache.maintenanceMode;
  }

  // Otherwise, fetch from DB
  try {
    const setting = await prisma.setting.findUnique({ where: { key: 'maintenanceMode' } });
    const maintenanceMode = setting?.value === 'true';

    // Update cache
    settingsCache.maintenanceMode = maintenanceMode;
    settingsCache.timestamp = now;
    
    return maintenanceMode;
  } catch (error) {
    console.error("Could not fetch maintenance mode setting, defaulting to 'off'.", error);
    return false; // Default to off if DB check fails
  }
}
// -----------------------------------------

export async function middleware(request) {
  const { pathname } = request.nextUrl;

  // --- Maintenance Mode Check ---
  // Allow access to the maintenance page itself and all Super Admin routes
  if (!pathname.startsWith('/super-admin') && pathname !== '/maintenance') {
    const isInMaintenance = await getMaintenanceMode();
    if (isInMaintenance) {
      return NextResponse.redirect(new URL('/maintenance', request.url));
    }
  }
  // -----------------------------


  // --- Subdomain & Super Admin Logic (from previous steps) ---
  const hostname = request.headers.get('host');
  const subdomain = hostname.match(/^(?:(?!www\.)([^.]+))\..*$/)?.[1];
  
  if (pathname.startsWith('/super-admin')) {
    // Super admin auth logic remains here...
    return NextResponse.next();
  }
  
  if (subdomain) {
    request.nextUrl.pathname = `/${subdomain}${pathname}`;
    return NextResponse.rewrite(request.nextUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};