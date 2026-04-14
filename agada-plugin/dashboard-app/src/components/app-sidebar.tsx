import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";
import { Package, Settings, ShoppingBasket, Sparkles } from "lucide-react";
import type { Screen } from "@/types";

const items: { id: Screen; label: string; icon: React.ElementType }[] = [
  { id: "products", label: "מוצרים", icon: ShoppingBasket },
  { id: "packages", label: "חבילות", icon: Package },
  { id: "settings", label: "הגדרות", icon: Settings },
];

interface AppSidebarProps {
  current: Screen;
  onNavigate: (s: Screen) => void;
}

export function AppSidebar({ current, onNavigate }: AppSidebarProps) {
  return (
    <Sidebar side="right" collapsible="icon">
      {/* Brand header */}
      <SidebarHeader className="border-b border-sidebar-border">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              className="cursor-default hover:bg-transparent active:bg-transparent data-[state=open]:bg-transparent"
              tooltip="אגדה — מערכת ניהול"
            >
              <div className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground shrink-0">
                <Sparkles className="size-4" />
              </div>
              <div className="flex flex-col gap-0 text-right leading-none">
                <span className="text-sm font-bold tracking-tight">אגדה</span>
                <span className="text-[11px] text-sidebar-foreground/50 font-normal">
                  מערכת ניהול
                </span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      {/* Navigation */}
      <SidebarContent className="gap-0">
        <SidebarGroup className="py-3">
          <SidebarGroupLabel className="px-3 text-[10px] font-semibold uppercase tracking-widest text-sidebar-foreground/40">
            ניהול
          </SidebarGroupLabel>
          <SidebarMenu className="gap-0.5">
            {items.map((item) => (
              <SidebarMenuItem key={item.id}>
                <SidebarMenuButton
                  isActive={current === item.id}
                  onClick={() => onNavigate(item.id)}
                  tooltip={item.label}
                  className="gap-3 rounded-md px-3 py-2 transition-all"
                >
                  <item.icon className="size-4 shrink-0" />
                  <span className="font-medium">{item.label}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>

      {/* User footer */}
      <SidebarFooter className="border-t border-sidebar-border">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              className="cursor-default hover:bg-sidebar-accent/50"
              tooltip="מנהל"
            >
              <div className="flex size-8 items-center justify-center rounded-full bg-primary/15 text-primary text-xs font-bold shrink-0 ring-1 ring-primary/20">
                א
              </div>
              <div className="flex flex-col gap-0 text-right leading-none">
                <span className="text-sm font-semibold">מנהל</span>
                <span className="text-[11px] text-sidebar-foreground/50 font-normal">
                  Administrator
                </span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}
