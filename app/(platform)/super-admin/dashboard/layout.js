import { Toaster } from 'sonner';
import { Sidebar } from './_components/sidebar';

export default function DashboardLayout({ children }) {
    return (
        <div className="min-h-screen bg-gray-50">
            {/* The new sidebar component */}
            <Sidebar />

            {/* The main content area, with left padding to offset the sidebar's width */}
            <main className="pl-64">
                <div className="p-8">
                    {children}
                </div>
            </main>

            <Toaster richColors position="top-right" />
        </div>
    );
}