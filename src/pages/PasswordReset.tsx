
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Navigation } from "@/components/Navigation";
import { toast } from "@/components/ui/use-toast";
import { useLanguage } from "@/context/LanguageContext";
import { requestPasswordReset } from "@/utils/authStorage";

const PasswordReset = () => {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const { t } = useLanguage();

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // In a real app, we would call an API here
      const success = requestPasswordReset(email);

      setIsSent(true);
      toast({
        title: t("resetEmailSent"),
        description: t("checkYourEmail"),
      });
    } catch (error: any) {
      toast({
        title: t("resetError"),
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navigation />
      
      <main className="flex-1 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle>{t("resetPassword")}</CardTitle>
            <CardDescription>
              {t("resetPasswordDescription")}
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            {!isSent ? (
              <form onSubmit={handleResetPassword} className="space-y-4">
                <div className="space-y-2">
                  <Input
                    id="email"
                    type="email"
                    placeholder={t("email")}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? t("sendingResetLink") : t("sendResetLink")}
                </Button>
              </form>
            ) : (
              <div className="text-center py-4">
                <p className="mb-4">{t("resetLinkSent")}</p>
                <Button
                  variant="outline"
                  onClick={() => setIsSent(false)}
                >
                  {t("sendAnotherLink")}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default PasswordReset;
