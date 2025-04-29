import { isUsingTemplateCredentials } from "@/integrations/supabase/client";

/**
 * A warning banner that is displayed when template Supabase credentials are being used.
 * This component is only shown in development mode.
 */
export function TemplateCredentialsWarning() {
  // Don't show in production or if using real credentials
  if (import.meta.env.MODE === "production" || !isUsingTemplateCredentials) {
    return null;
  }

  return (
    <div className="bg-red-500 text-white p-2 text-center">
      ⚠️ Using template Supabase credentials. Replace with real credentials in
      src/config.json for full functionality.
    </div>
  );
}
