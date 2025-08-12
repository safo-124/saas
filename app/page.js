// app/page.jsx

import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="flex flex-col items-center gap-4">
        <h1 className="text-4xl font-bold">School Management System</h1>
        <p className="text-muted-foreground">The future of school administration.</p>
        <Button>Get Started</Button>
      </div>
    </main>
  );
}