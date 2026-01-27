import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Monitor, 
  Laptop, 
  Smartphone, 
  Download, 
  Terminal, 
  Globe,
  CheckCircle2,
  Copy,
  ExternalLink,
  Wifi,
  Shield,
  Zap
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

export default function SetupGuide() {
  const { toast } = useToast();
  const [copiedItem, setCopiedItem] = useState<string | null>(null);
  
  const dashboardUrl = typeof window !== 'undefined' ? window.location.origin : 'https://your-app.replit.app';

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedItem(label);
    toast({
      title: "Copied!",
      description: `${label} copied to clipboard`,
    });
    setTimeout(() => setCopiedItem(null), 2000);
  };

  const pythonSetupCode = `# Install required packages
pip install requests psutil

# In your Python agent, add:
from agent_bridge import integrate_with_agent

bridge = integrate_with_agent(
    troubleshoot_func=your_troubleshoot_function,
    organize_func=your_organize_function
)
bridge.start()`;

  const envSetupCode = `import os
os.environ['DASHBOARD_URL'] = '${dashboardUrl}'`;

  return (
    <div className="space-y-6 p-6" data-testid="page-setup-guide">
      <div>
        <h1 className="text-2xl font-semibold">Setup Guide</h1>
        <p className="text-sm text-muted-foreground">
          Connect your AI agent from any device
        </p>
      </div>

      <Card data-testid="card-quick-start">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-primary" />
            Quick Start
          </CardTitle>
          <CardDescription>
            Your dashboard is live and ready to receive connections
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3 rounded-md bg-muted p-4">
            <Globe className="h-5 w-5 text-muted-foreground shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-xs text-muted-foreground">Dashboard URL</p>
              <p className="font-mono text-sm truncate" data-testid="text-dashboard-url">{dashboardUrl}</p>
            </div>
            <Button
              size="icon"
              variant="ghost"
              onClick={() => copyToClipboard(dashboardUrl, "Dashboard URL")}
              data-testid="button-copy-url"
            >
              {copiedItem === "Dashboard URL" ? (
                <CheckCircle2 className="h-4 w-4 text-green-500" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="flex items-center gap-2 text-sm">
              <CheckCircle2 className="h-4 w-4 text-green-500" />
              <span>Works on any device</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Shield className="h-4 w-4 text-green-500" />
              <span>PIN protected</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Wifi className="h-4 w-4 text-green-500" />
              <span>Real-time sync</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="desktop" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="desktop" className="gap-2" data-testid="tab-desktop">
            <Monitor className="h-4 w-4" />
            <span className="hidden sm:inline">Desktop PC</span>
            <span className="sm:hidden">PC</span>
          </TabsTrigger>
          <TabsTrigger value="laptop" className="gap-2" data-testid="tab-laptop">
            <Laptop className="h-4 w-4" />
            <span className="hidden sm:inline">Laptop</span>
            <span className="sm:hidden">Laptop</span>
          </TabsTrigger>
          <TabsTrigger value="mobile" className="gap-2" data-testid="tab-mobile">
            <Smartphone className="h-4 w-4" />
            <span className="hidden sm:inline">Mobile</span>
            <span className="sm:hidden">Mobile</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="desktop" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Monitor className="h-5 w-5" />
                Desktop PC Setup
              </CardTitle>
              <CardDescription>
                Connect your Python AI agent from your main desktop computer
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Badge variant="outline" className="mt-0.5 shrink-0">1</Badge>
                  <div className="space-y-2">
                    <p className="font-medium">Install Python Dependencies</p>
                    <p className="text-sm text-muted-foreground">
                      Open your terminal or command prompt and run:
                    </p>
                    <div className="relative">
                      <pre className="rounded-md bg-muted p-3 text-sm font-mono overflow-x-auto">
                        pip install requests psutil
                      </pre>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="absolute right-2 top-2"
                        onClick={() => copyToClipboard("pip install requests psutil", "Install command")}
                        data-testid="button-copy-pip"
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Badge variant="outline" className="mt-0.5 shrink-0">2</Badge>
                  <div className="space-y-2">
                    <p className="font-medium">Download the Bridge File</p>
                    <p className="text-sm text-muted-foreground">
                      Copy <code className="bg-muted px-1 rounded">agent_bridge.py</code> to your Python agent folder
                    </p>
                    <Button variant="outline" size="sm" className="gap-2" data-testid="button-download-bridge">
                      <Download className="h-4 w-4" />
                      Download agent_bridge.py
                    </Button>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Badge variant="outline" className="mt-0.5 shrink-0">3</Badge>
                  <div className="space-y-2">
                    <p className="font-medium">Set Dashboard URL</p>
                    <p className="text-sm text-muted-foreground">
                      Add this to your Python agent code:
                    </p>
                    <div className="relative">
                      <pre className="rounded-md bg-muted p-3 text-sm font-mono overflow-x-auto whitespace-pre-wrap">
{envSetupCode}
                      </pre>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="absolute right-2 top-2"
                        onClick={() => copyToClipboard(envSetupCode, "Environment setup")}
                        data-testid="button-copy-env"
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Badge variant="outline" className="mt-0.5 shrink-0">4</Badge>
                  <div className="space-y-2">
                    <p className="font-medium">Integrate with Your Agent</p>
                    <p className="text-sm text-muted-foreground">
                      Add the bridge to your main agent script:
                    </p>
                    <div className="relative">
                      <pre className="rounded-md bg-muted p-3 text-sm font-mono overflow-x-auto whitespace-pre-wrap">
{pythonSetupCode}
                      </pre>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="absolute right-2 top-2"
                        onClick={() => copyToClipboard(pythonSetupCode, "Python setup")}
                        data-testid="button-copy-python"
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Badge variant="outline" className="mt-0.5 shrink-0">5</Badge>
                  <div className="space-y-2">
                    <p className="font-medium">Run Your Agent</p>
                    <p className="text-sm text-muted-foreground">
                      Start your Python agent. You should see "Agent Connected" in the dashboard sidebar within 5 seconds.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="laptop" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Laptop className="h-5 w-5" />
                Laptop Setup
              </CardTitle>
              <CardDescription>
                Monitor your agent on-the-go or run the agent from your laptop
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="rounded-md border p-4 space-y-3">
                <p className="font-medium flex items-center gap-2">
                  <Globe className="h-4 w-4 text-primary" />
                  Option A: Monitor Only (Recommended)
                </p>
                <p className="text-sm text-muted-foreground">
                  Simply open this dashboard in any web browser on your laptop:
                </p>
                <div className="flex items-center gap-2">
                  <code className="flex-1 bg-muted px-3 py-2 rounded text-sm truncate">{dashboardUrl}</code>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => copyToClipboard(dashboardUrl, "Dashboard URL")}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Log in with your PIN to view and control your agent remotely.
                </p>
              </div>

              <div className="rounded-md border p-4 space-y-3">
                <p className="font-medium flex items-center gap-2">
                  <Terminal className="h-4 w-4 text-primary" />
                  Option B: Run Agent on Laptop
                </p>
                <p className="text-sm text-muted-foreground">
                  If you want to run the Python agent on your laptop instead of your desktop:
                </p>
                <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
                  <li>Follow the same Desktop PC setup steps above</li>
                  <li>Make sure Python 3.8+ is installed</li>
                  <li>Copy your agent files to your laptop</li>
                  <li>Run the agent from your laptop terminal</li>
                </ol>
                <p className="text-xs text-muted-foreground">
                  Note: Only one agent instance should connect at a time.
                </p>
              </div>

              <div className="rounded-md bg-muted/50 p-4">
                <p className="text-sm font-medium">Tips for Laptop Users</p>
                <ul className="mt-2 text-sm text-muted-foreground space-y-1">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-3 w-3 text-green-500" />
                    Bookmark this dashboard for quick access
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-3 w-3 text-green-500" />
                    Add to Home Screen on Chrome for app-like experience
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-3 w-3 text-green-500" />
                    Works offline-capable with PWA support
                  </li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="mobile" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Smartphone className="h-5 w-5" />
                Mobile Setup
              </CardTitle>
              <CardDescription>
                Monitor and control your AI agent from your phone or tablet
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Badge variant="outline" className="mt-0.5 shrink-0">1</Badge>
                  <div className="space-y-2">
                    <p className="font-medium">Open in Browser</p>
                    <p className="text-sm text-muted-foreground">
                      On your phone, open Safari (iPhone) or Chrome (Android) and go to:
                    </p>
                    <div className="flex items-center gap-2">
                      <code className="flex-1 bg-muted px-3 py-2 rounded text-xs truncate">{dashboardUrl}</code>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => copyToClipboard(dashboardUrl, "Dashboard URL")}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Badge variant="outline" className="mt-0.5 shrink-0">2</Badge>
                  <div className="space-y-2">
                    <p className="font-medium">Add to Home Screen (Recommended)</p>
                    <p className="text-sm text-muted-foreground">
                      For the best experience, add this dashboard as an app:
                    </p>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div className="rounded-md border p-3 space-y-2">
                        <p className="text-sm font-medium">iPhone / iPad</p>
                        <ol className="text-xs text-muted-foreground space-y-1 list-decimal list-inside">
                          <li>Tap the Share button</li>
                          <li>Scroll and tap "Add to Home Screen"</li>
                          <li>Tap "Add"</li>
                        </ol>
                      </div>
                      <div className="rounded-md border p-3 space-y-2">
                        <p className="text-sm font-medium">Android</p>
                        <ol className="text-xs text-muted-foreground space-y-1 list-decimal list-inside">
                          <li>Tap the menu (three dots)</li>
                          <li>Tap "Add to Home screen"</li>
                          <li>Tap "Add"</li>
                        </ol>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Badge variant="outline" className="mt-0.5 shrink-0">3</Badge>
                  <div className="space-y-2">
                    <p className="font-medium">Log In</p>
                    <p className="text-sm text-muted-foreground">
                      Enter your PIN (default: 1234) to access the dashboard. You can change your PIN in Security settings.
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-md bg-muted/50 p-4">
                <p className="text-sm font-medium">What You Can Do on Mobile</p>
                <ul className="mt-2 text-sm text-muted-foreground space-y-1">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-3 w-3 text-green-500" />
                    View real-time system health
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-3 w-3 text-green-500" />
                    Pause or resume your agent
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-3 w-3 text-green-500" />
                    View activity logs and alerts
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-3 w-3 text-green-500" />
                    Run quick actions and diagnostics
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-3 w-3 text-green-500" />
                    Manage appointments
                  </li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Card data-testid="card-troubleshooting">
        <CardHeader>
          <CardTitle>Troubleshooting</CardTitle>
          <CardDescription>Common issues and solutions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <p className="font-medium text-sm">Agent shows "Disconnected"</p>
              <p className="text-sm text-muted-foreground">
                Make sure your Python agent is running and can reach the internet. The agent sends a heartbeat every 5 seconds - if no heartbeat is received for 15 seconds, it shows as disconnected.
              </p>
            </div>
            <div className="space-y-2">
              <p className="font-medium text-sm">Commands not working</p>
              <p className="text-sm text-muted-foreground">
                Commands are queued and picked up by the agent on its next heartbeat. If the agent is paused or stopped, commands will wait until it reconnects.
              </p>
            </div>
            <div className="space-y-2">
              <p className="font-medium text-sm">Can't access from mobile</p>
              <p className="text-sm text-muted-foreground">
                Make sure you're using the full URL including https://. The dashboard works on any modern browser (Chrome, Safari, Firefox, Edge).
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
