import { ImpersonationBanner } from "@/app/_components/impersonation-banner";
import { Toaster } from "sonner";

export default function SchoolAppLayout({ children }) {
  return (
    <>
      {/* This is the main layout for the school-specific application.
        We will build out the proper sidebar and header here later.
        For now, it just renders the page content.
      */}
      <div>
        {children}
      </div>

      {/* The Toaster and ImpersonationBanner are included here so they are
        available on every page of the school's application.
      */}
      <Toaster richColors />
      <ImpersonationBanner />
    </>
  );
}