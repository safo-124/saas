// app/[domain]/page.js
import { PrismaClient } from '@prisma/client';
import { notFound } from 'next/navigation';

const prisma = new PrismaClient();

async function getSchoolData(domain) {
  const school = await prisma.school.findUnique({
    where: { subdomain: domain },
  });
  return school;
}

export default async function SchoolHomePage({ params }) {
  // The `params` object will contain the dynamic segment from the URL
  // In our case, it's { domain: 'the-subdomain' }
  const school = await getSchoolData(params.domain);

  // If the subdomain doesn't correspond to a real school, show a 404 page
  if (!school) {
    notFound();
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-4xl font-bold">Welcome to the Dashboard for</h1>
      <p className="text-6xl text-blue-600 mt-4">{school.name}</p>
      <p className="mt-2 text-gray-500">(Subdomain: {school.subdomain})</p>
    </div>
  );
}