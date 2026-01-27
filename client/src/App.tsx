import { useState } from "react";
import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme-provider";
import { ThemeToggle } from "@/components/theme-toggle";
import { NotificationsBell } from "@/components/notifications-bell";
import { AgentStatusIndicator } from "@/components/agent-status-indicator";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import PinAuth from "@/pages/pin-auth";
import Dashboard from "@/pages/dashboard";
import Appointments from "@/pages/appointments";
import Activity from "@/pages/activity";
import Patterns from "@/pages/patterns";
import Privacy from "@/pages/privacy";
import Security from "@/pages/security";
import Settings from "@/pages/settings";
import Alerts from "@/pages/alerts";
import QuickActions from "@/pages/quick-actions";
import Audit from "@/pages/audit";
import Backup from "@/pages/backup";
import SetupGuide from "@/pages/setup-guide";
import NotFound from "@/pages/not-found";
import { InstallPrompt } from "@/components/install-prompt";
import { useKeyboardShortcuts } from "@/hooks/use-pwa";
import { useLocation } from "wouter";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/appointments" component={Appointments} />
      <Route path="/activity" component={Activity} />
      <Route path="/patterns" component={Patterns} />
      <Route path="/alerts" component={Alerts} />
      <Route path="/quick-actions" component={QuickActions} />
      <Route path="/audit" component={Audit} />
      <Route path="/backup" component={Backup} />
      <Route path="/privacy" component={Privacy} />
      <Route path="/security" component={Security} />
      <Route path="/settings" component={Settings} />
      <Route path="/setup-guide" component={SetupGuide} />
      <Route component={NotFound} />
    </Switch>
  );
}

function AuthenticatedApp() {
  const style = {
    "--sidebar-width": "16rem",
    "--sidebar-width-icon": "3rem",
  };
  const [, navigate] = useLocation();

  useKeyboardShortcuts({
    "alt+h": () => navigate("/"),
    "alt+a": () => navigate("/appointments"),
    "alt+l": () => navigate("/activity"),
    "alt+p": () => navigate("/patterns"),
    "alt+n": () => navigate("/alerts"),
    "alt+q": () => navigate("/quick-actions"),
    "alt+u": () => navigate("/audit"),
    "alt+b": () => navigate("/backup"),
    "alt+s": () => navigate("/settings"),
  });

  return (
    <SidebarProvider style={style as React.CSSProperties}>
      <div className="flex h-screen w-full">
        <AppSidebar />
        <div className="flex flex-1 flex-col overflow-hidden">
          <header className="flex h-14 items-center justify-between gap-4 border-b border-border px-4">
            <div className="flex items-center gap-3">
              <SidebarTrigger data-testid="button-sidebar-toggle" />
              <AgentStatusIndicator />
            </div>
            <div className="flex items-center gap-2">
              <NotificationsBell />
              <ThemeToggle />
            </div>
          </header>
          <main className="flex-1 overflow-auto">
            <Router />
          </main>
        </div>
      </div>
      <InstallPrompt />
    </SidebarProvider>
  );
}

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  return (
    <ThemeProvider defaultTheme="light" storageKey="agent-ui-theme">
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          {isAuthenticated ? (
            <AuthenticatedApp />
          ) : (
            <PinAuth onAuthenticated={() => setIsAuthenticated(true)} />
          )}
          <Toaster />
        </TooltipProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default App;
