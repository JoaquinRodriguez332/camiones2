"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { Home, ClipboardList, History, Settings, Truck } from "lucide-react";
import { cn } from "@/lib/utils-cn";

interface InspectorLayoutProps {
  children: React.ReactNode;
}

export default function InspectorLayout({ children }: InspectorLayoutProps) {
  const pathname = usePathname();

  const navItems = [
    {
      href: "/inspector",
      icon: Home,
      label: "Inicio",
      active: pathname === "/inspector",
    },
    {
      href: "/inspector/monitoreo",
      icon: ClipboardList,
      label: "Monitoreo",
      active: pathname === "/inspector/monitoreo",
    },
    {
      href: "/inspector/historial",
      icon: History,
      label: "Historial",
      active: pathname === "/inspector/historial",
    },
    {
      href: "/inspector/ajustes",
      icon: Settings,
      label: "Ajustes",
      active: pathname === "/inspector/ajustes",
    },
  ];

  return (
    <div className="min-h-screen bg-white pb-20">
      {/* Main Content */}
      <main className="min-h-screen">
        {children}
      </main>

      {/* Bottom Navigation - Mobile */}
      <nav className="fixed bottom-0 left-0 right-0 bg-neutral-900 border-t border-neutral-800 px-2 py-2 z-50 md:hidden">
        <div className="flex items-center justify-around">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center py-2 px-4 rounded-xl transition-all",
                item.active
                  ? "text-red-500"
                  : "text-neutral-400 hover:text-white"
              )}
            >
              <item.icon
                className={cn(
                  "h-6 w-6 mb-1",
                  item.active && "stroke-[2.5px]"
                )}
              />
              <span className={cn(
                "text-xs font-medium",
                item.active && "font-semibold"
              )}>
                {item.label}
              </span>
            </Link>
          ))}
        </div>
      </nav>
    </div>
  );
}
