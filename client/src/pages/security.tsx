import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Shield, Key, Lock, AlertTriangle, CheckCircle, RefreshCw, Info } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";

export default function Security() {
  const { toast } = useToast();
  const [currentPin, setCurrentPin] = useState("");
  const [newPin, setNewPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [isChangingPin, setIsChangingPin] = useState(false);
  const [isRotatingKey, setIsRotatingKey] = useState(false);

  const { data: pinStatus } = useQuery<{ isDefault: boolean }>({
    queryKey: ["/api/auth/pin-status"],
  });

  const isFirstTimeSetup = pinStatus?.isDefault ?? true;
  const hasCustomPin = !isFirstTimeSetup;

  const handleChangePin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newPin !== confirmPin) {
      toast({
        title: "PIN Mismatch",
        description: "New PIN and confirmation do not match.",
        variant: "destructive",
      });
      return;
    }

    if (newPin.length < 4) {
      toast({
        title: "Invalid PIN",
        description: "PIN must be at least 4 characters.",
        variant: "destructive",
      });
      return;
    }

    setIsChangingPin(true);
    try {
      await apiRequest("POST", "/api/auth/change-pin", {
        currentPin,
        newPin,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/auth/pin-status"] });
      toast({
        title: isFirstTimeSetup ? "PIN Created" : "PIN Updated",
        description: isFirstTimeSetup 
          ? "Your custom PIN has been saved. Use it to log in next time."
          : "Your PIN has been changed successfully.",
      });
      setCurrentPin("");
      setNewPin("");
      setConfirmPin("");
    } catch {
      toast({
        title: "Update Failed",
        description: isFirstTimeSetup 
          ? "Failed to create PIN. Make sure the default PIN (1234) is correct."
          : "Failed to change PIN. Please verify your current PIN.",
        variant: "destructive",
      });
    } finally {
      setIsChangingPin(false);
    }
  };

  const handleRotateKey = async () => {
    setIsRotatingKey(true);
    try {
      await apiRequest("POST", "/api/security/rotate-key", {});
      toast({
        title: "Key Rotated",
        description: "Encryption key has been rotated successfully.",
      });
    } catch {
      toast({
        title: "Rotation Failed",
        description: "Failed to rotate encryption key.",
        variant: "destructive",
      });
    } finally {
      setIsRotatingKey(false);
    }
  };

  return (
    <div className="space-y-6 p-6" data-testid="page-security">
      <div>
        <h1 className="text-2xl font-semibold">Security</h1>
        <p className="text-sm text-muted-foreground">
          Manage your authentication and encryption settings
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card data-testid="card-change-pin">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base font-medium">
              <Key className="h-4 w-4" />
              {isFirstTimeSetup ? "Create Your PIN" : "Change PIN"}
            </CardTitle>
            <CardDescription>
              {isFirstTimeSetup 
                ? "Set up a custom PIN to replace the default" 
                : "Update your authentication PIN"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isFirstTimeSetup && (
              <Alert className="mb-4">
                <Info className="h-4 w-4" />
                <AlertDescription>
                  The default PIN is <strong>1234</strong>. Enter it below to create your own custom PIN.
                </AlertDescription>
              </Alert>
            )}
            <form onSubmit={handleChangePin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="current-pin">
                  {isFirstTimeSetup ? "Default PIN" : "Current PIN"}
                </Label>
                <Input
                  id="current-pin"
                  type="password"
                  value={currentPin}
                  onChange={(e) => setCurrentPin(e.target.value)}
                  placeholder={isFirstTimeSetup ? "Enter 1234" : "Enter current PIN"}
                  data-testid="input-current-pin"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-pin">
                  {isFirstTimeSetup ? "Your New PIN" : "New PIN"}
                </Label>
                <Input
                  id="new-pin"
                  type="password"
                  value={newPin}
                  onChange={(e) => setNewPin(e.target.value)}
                  placeholder="Enter new PIN (min 4 characters)"
                  data-testid="input-new-pin"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm-pin">Confirm New PIN</Label>
                <Input
                  id="confirm-pin"
                  type="password"
                  value={confirmPin}
                  onChange={(e) => setConfirmPin(e.target.value)}
                  placeholder="Confirm new PIN"
                  data-testid="input-confirm-pin"
                />
              </div>
              <Button
                type="submit"
                className="w-full"
                disabled={isChangingPin || !currentPin || !newPin || !confirmPin}
                data-testid="button-change-pin"
              >
                {isChangingPin 
                  ? (isFirstTimeSetup ? "Creating..." : "Updating...") 
                  : (isFirstTimeSetup ? "Create My PIN" : "Update PIN")}
              </Button>
            </form>
            {hasCustomPin && (
              <p className="mt-3 text-center text-xs text-muted-foreground">
                <CheckCircle className="mr-1 inline h-3 w-3 text-chart-3" />
                Custom PIN is set
              </p>
            )}
          </CardContent>
        </Card>

        <Card data-testid="card-encryption">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base font-medium">
              <Lock className="h-4 w-4" />
              Encryption
            </CardTitle>
            <CardDescription>
              Manage encryption settings and key rotation
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Encryption Status</p>
                <p className="text-xs text-muted-foreground">Fernet symmetric encryption</p>
              </div>
              <Badge variant="secondary" className="flex items-center gap-1">
                <CheckCircle className="h-3 w-3 text-chart-3" />
                Active
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Key Rotation</p>
                <p className="text-xs text-muted-foreground">Rotate encryption keys periodically</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleRotateKey}
                disabled={isRotatingKey}
                data-testid="button-rotate-key"
              >
                {isRotatingKey ? (
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <RefreshCw className="mr-2 h-4 w-4" />
                )}
                Rotate Key
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card data-testid="card-security-status">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base font-medium">
            <Shield className="h-4 w-4" />
            Security Status
          </CardTitle>
          <CardDescription>
            Overview of your security configuration
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center gap-3 rounded-md bg-muted/50 p-3">
              <CheckCircle className="h-5 w-5 text-chart-3" />
              <div>
                <p className="text-sm font-medium">PIN Authentication</p>
                <p className="text-xs text-muted-foreground">Argon2 password hashing enabled</p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-md bg-muted/50 p-3">
              <CheckCircle className="h-5 w-5 text-chart-3" />
              <div>
                <p className="text-sm font-medium">Data Encryption</p>
                <p className="text-xs text-muted-foreground">All patterns encrypted at rest</p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-md bg-muted/50 p-3">
              <CheckCircle className="h-5 w-5 text-chart-3" />
              <div>
                <p className="text-sm font-medium">PII Redaction</p>
                <p className="text-xs text-muted-foreground">Automatic redaction in all logs</p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-md bg-muted/50 p-3">
              <AlertTriangle className="h-5 w-5 text-chart-4" />
              <div>
                <p className="text-sm font-medium">Session Timeout</p>
                <p className="text-xs text-muted-foreground">Consider enabling automatic logout</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
