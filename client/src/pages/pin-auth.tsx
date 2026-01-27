import { useState } from "react";
import { Shield, Lock, Eye, EyeOff, Fingerprint } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

interface PinAuthProps {
  onAuthenticated: () => void;
}

export default function PinAuth({ onAuthenticated }: PinAuthProps) {
  const [pin, setPin] = useState("");
  const [showPin, setShowPin] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (pin.length < 4) {
      toast({
        title: "Invalid PIN",
        description: "PIN must be at least 4 characters.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/verify-pin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pin }),
      });

      if (response.ok) {
        toast({
          title: "Authentication Successful",
          description: "Welcome to the AI Agent Dashboard.",
        });
        onAuthenticated();
      } else {
        toast({
          title: "Authentication Failed",
          description: "Invalid PIN. Please try again.",
          variant: "destructive",
        });
        setPin("");
      }
    } catch {
      toast({
        title: "Connection Error",
        description: "Unable to verify PIN. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary">
            <Shield className="h-8 w-8 text-primary-foreground" />
          </div>
          <CardTitle className="text-2xl font-semibold">Secure AI Agent</CardTitle>
          <CardDescription>
            Enter your PIN to access the dashboard
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type={showPin ? "text" : "password"}
                placeholder="Enter PIN"
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                className="pl-10 pr-10 text-center text-lg tracking-widest"
                maxLength={8}
                autoFocus
                data-testid="input-pin"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-1 top-1/2 -translate-y-1/2"
                onClick={() => setShowPin(!showPin)}
                data-testid="button-toggle-pin-visibility"
              >
                {showPin ? (
                  <EyeOff className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <Eye className="h-4 w-4 text-muted-foreground" />
                )}
              </Button>
            </div>
            <Button
              type="submit"
              className="w-full"
              disabled={isLoading || pin.length < 4}
              data-testid="button-submit-pin"
            >
              {isLoading ? "Verifying..." : "Unlock Dashboard"}
            </Button>
          </form>
          <div className="mt-6 flex items-center justify-center gap-2 text-xs text-muted-foreground">
            <Fingerprint className="h-4 w-4" />
            <span>End-to-end encrypted</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
