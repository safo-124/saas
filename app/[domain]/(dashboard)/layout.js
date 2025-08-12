import { notFound } from 'next/navigation';
import { PrismaClient } from '@prisma/client';
import { ImpersonationBanner } from '@/app/_components/impersonation-banner';
import { Sidebar } from './_components/sidebar';

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
        <div className="flex min-h-screen">
            <Sidebar schoolName={school.name} />
            <main className="flex-1 p-8 bg-gray-100 ml-64"> {/* Offset for fixed sidebar */}
                {children}
            </main>
            <ImpersonationBanner />
        </div>
    );
}