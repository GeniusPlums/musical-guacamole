"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSyncExternalStore } from "react";
import {
  Terminal,
  Package,
  ShoppingCart,
  ClipboardCheck,
  Search,
  ScrollText,
  Scale,
  FileSearch,
  ChefHat,
  Building2,
  Play,
  ChevronLeft,
  ChevronRight,
  ScanSearch,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/store/use-app-store";
import { useOpenInvestigations } from "@/hooks/use-simulation";
import { useSimulationStore } from "@/store/use-simulation-store";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const navItems = [
  { href: "/", label: "Command Center", icon: Terminal },
  { href: "/inventory", label: "Live Inventory", icon: Package },
  { href: "/service", label: "Run Service", icon: ShoppingCart },
  { href: "/stock-count", label: "Stock Count", icon: ClipboardCheck },
  { href: "/investigations", label: "Investigations", icon: Search, badge: true },
  { href: "/ledger", label: "Stock Ledger", icon: ScrollText },
  { href: "/variance", label: "Variance", icon: Scale },
  { href: "/audit", label: "Audit Center", icon: FileSearch },
  { href: "/kitchen", label: "Kitchen Wastage", icon: ChefHat },
  { href: "/outlets", label: "Multi-Outlet", icon: Building2 },
  { href: "/scenarios", label: "Demo Scenarios", icon: Play },
];

export function Sidebar() {
  const pathname = usePathname();
  const { sidebarCollapsed, toggleSidebar } = useAppStore();
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );
  const openCases = useOpenInvestigations().length;

  return (
    <aside
      className={cn(
        "flex h-screen flex-col border-r border-border bg-sidebar transition-all duration-200",
        sidebarCollapsed ? "w-16" : "w-60"
      )}
    >
      <div className="flex h-14 items-center gap-2 border-b border-border px-4">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary">
          <ScanSearch className="h-4 w-4 text-primary-foreground" />
        </div>
        {!sidebarCollapsed && (
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold tracking-tight">BarIQ</p>
            <p className="truncate text-[10px] text-muted-foreground">Interactive Demo</p>
          </div>
        )}
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto p-2">
        {navItems.map((item) => {
          const active =
            pathname === item.href ||
            (item.href !== "/" && pathname.startsWith(item.href));
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                active
                  ? "bg-accent text-accent-foreground"
                  : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
              )}
              title={sidebarCollapsed ? item.label : undefined}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {!sidebarCollapsed && (
                <>
                  <span className="flex-1">{item.label}</span>
                  {item.badge && mounted && openCases > 0 && (
                    <Badge variant="destructive" className="text-[10px] h-5 px-1.5">
                      {openCases}
                    </Badge>
                  )}
                </>
              )}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-border p-2 space-y-1">
        {!sidebarCollapsed && (
          <Button
            variant="outline"
            size="sm"
            className="w-full text-xs"
            onClick={() => useSimulationStore.getState().resetSimulation()}
          >
            Reset Demo
          </Button>
        )}
        <Button variant="ghost" size="sm" className="w-full justify-center" onClick={toggleSidebar}>
          {sidebarCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </div>
    </aside>
  );
}
