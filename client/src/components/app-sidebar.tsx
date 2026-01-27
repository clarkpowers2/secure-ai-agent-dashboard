import { useLocation, Link } from "wouter";
import {
  LayoutDashboard,
  Shield,
  Activity,
  BarChart3,
  Settings,
  Lock,
  CalendarDays,
  Bell,
  Zap,
  FileText,
  Database,
  HelpCircle,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { Badge } from "@/components/ui/badge";
import { AgentConnectionStatus } from "@/components/agent-connection-status";

const menuItems = [
  {
    title: "Dashboard",
    url: "/",
    icon: LayoutDashboard,
  },
  {
    title: "Appointments",
    url: "/appointments",
    icon: CalendarDays,
  },
  {
    title: "Activity Logs",
    url: "/activity",
    icon: Activity,
  },
  {
    title: "Pattern Insights",
    url: "/patterns",
    icon: BarChart3,
  },
  {
    title: "Alerts",
    url: "/alerts",
    icon: Bell,
  },
  {
    title: "Quick Actions",
    url: "/quick-actions",
    icon: Zap,
  },
  {
    title: "Audit Trail",
    url: "/audit",
    icon: FileText,
  },
  {
    title: "Backup & Export",
    url: "/backup",
    icon: Database,
  },
  {
    title: "Privacy Settings",
    url: "/privacy",
    icon: Shield,
  },
  {
    title: "Security",
    url: "/security",
    icon: Lock,
  },
  {
    title: "Settings",
    url: "/settings",
    icon: Settings,
  },
  {
    title: "Setup Guide",
    url: "/setup-guide",
    icon: HelpCircle,
  },
];

export function AppSidebar() {
  const [location] = useLocation();

  return (
    <Sidebar>
      <SidebarHeader className="border-b border-sidebar-border p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary">
            <Shield className="h-5 w-5 text-primary-foreground" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold">AI Agent</span>
            <span className="text-xs text-muted-foreground">Orchestrator</span>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs uppercase tracking-wide text-muted-foreground">
            Navigation
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={location === item.url}
                    data-testid={`nav-${item.title.toLowerCase().replace(/\s+/g, "-")}`}
                  >
                    <Link href={item.url}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="border-t border-sidebar-border p-4">
        <div className="flex flex-col gap-2">
          <AgentConnectionStatus />
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-status-online" />
            <span className="text-xs text-muted-foreground">Dashboard Active</span>
            <Badge variant="secondary" className="ml-auto text-xs">
              Encrypted
            </Badge>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
