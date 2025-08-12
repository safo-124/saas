import { PrismaClient } from '@prisma/client';
import { notFound } from 'next/navigation';
import { SignInForm } from './_components/sign-in-form';

const prisma = new PrismaClient();

async function getSchoolData(domain) {
  const school = await prisma.school.findUnique({
    where: { subdomain: domain },
    select: { name: true, subdomain: true },
  });
  return school;
}

export default async function SchoolSignInPage({ params }) {
  const school = await getSchoolData(params.domain);

  if (!school) {
    notFound();
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-sm">
        <h1 className="text-center text-3xl font-bold mb-2">
          {school.name}
        </h1>
        <p className="text-center text-gray-500 mb-6">
          Sign in to your dashboard
        </p>
        <SignInForm subdomain={school.subdomain} />
      </div>
    </div>
  );
}