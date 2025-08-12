import { Construction } from 'lucide-react';

export default function MaintenancePage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 text-center p-4">
      <Construction className="h-24 w-24 text-yellow-500 mb-6" />
      <h1 className="text-4xl font-bold text-gray-800 mb-2">
        Under Maintenance
      </h1>
      <p className="text-lg text-gray-600">
        Our site is currently undergoing scheduled maintenance. We should be back shortly.
      </p>
      <p className="text-lg text-gray-600">
        Thank you for your patience!
      </p>
    </div>
  );
}