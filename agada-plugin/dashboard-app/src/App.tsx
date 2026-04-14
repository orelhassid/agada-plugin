import { useState } from "react";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { AppSidebar } from "@/components/app-sidebar";
import { ProductsScreen } from "@/screens/products";
import { PackagesScreen } from "@/screens/packages";
import { SettingsScreen } from "@/screens/settings";
import { Sun, Moon } from "lucide-react";
import type { Screen } from "@/types";

const screenTitles: Record<Screen, string> = {
  products: "מוצרים",
  packages: "חבילות",
  settings: "הגדרות",
};

export default function App() {
  const [screen, setScreen] = useState<Screen>("products");
  const [theme, setTheme] = useState<"dark" | "light">("dark");

  return (
    <div className={theme} dir="rtl">
      <TooltipProvider>
        <SidebarProvider defaultOpen>
          <AppSidebar current={screen} onNavigate={setScreen} />
          <SidebarInset className="flex min-h-screen flex-col bg-background">
            {/* Top bar */}
            <header className="sticky top-0 z-20 flex h-14 shrink-0 items-center gap-2 border-b border-border bg-background/80 px-4 backdrop-blur-sm">
              <SidebarTrigger className="-mr-1 text-muted-foreground hover:text-foreground" />
              <Separator orientation="vertical" className="mx-2 h-4" />
              <span className="text-sm font-semibold tracking-tight text-foreground">
                {screenTitles[screen]}
              </span>
              <div className="flex-1" />
              <Button
                variant="ghost"
                size="icon"
                className="size-8 text-muted-foreground hover:text-foreground"
                onClick={() =>
                  setTheme(theme === "dark" ? "light" : "dark")
                }
                aria-label={theme === "dark" ? "עבור למצב בהיר" : "עבור למצב כהה"}
              >
                {theme === "dark" ? (
                  <Sun className="size-4" />
                ) : (
                  <Moon className="size-4" />
                )}
              </Button>
            </header>

            {/* Main content */}
            <main className="flex-1 overflow-auto">
              <div className="mx-auto w-full max-w-[1400px] px-4 py-6 sm:px-6 sm:py-8">
                {screen === "products" && <ProductsScreen />}
                {screen === "packages" && <PackagesScreen />}
                {screen === "settings" && <SettingsScreen />}
              </div>
            </main>
          </SidebarInset>
          <Toaster position="bottom-left" dir="rtl" />
        </SidebarProvider>
      </TooltipProvider>
    </div>
  );
}
