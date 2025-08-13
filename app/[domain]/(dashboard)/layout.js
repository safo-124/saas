import { notFound } from 'next/navigation';
import { PrismaClient } from '@prisma/client';
import { ImpersonationBanner } from '@/app/_components/impersonation-banner';
import { Navbar } from './_components/navbar'; // Import the new Navbar

const prisma = new PrismaClient();

async function getSchoolData(domain) {
    const school = await prisma.school.findUnique({
        where: { subdomain: domain },
        select: { name: true },
    });
    return school;
}

export default async function SchoolDashboardLayout({ children, params }) {
    const school = await getSchoolData(params.domain);

    if (!school) {
        notFound();
    }

    return (
        <div className="min-h-screen flex flex-col">
            {/* The new top navbar */}
            <Navbar schoolName={school.name} />

            {/* The main content area, with top padding to offset the navbar's height */}
            <main className="flex-1 p-8 bg-gray-100 pt-24">
                {children}
            </main>

            <ImpersonationBanner />
        </div>
    );
}