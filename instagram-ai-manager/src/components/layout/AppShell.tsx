"use client";

import { useCallback, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Images,
  LayoutDashboard,
  Menu,
  Settings,
  Sparkles,
  TrendingUp,
  X,
} from "lucide-react";
import { InstagramIcon } from "@/components/ui/InstagramIcon";

const NAV = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/gerar", label: "Gerar com IA", icon: Sparkles },
  { href: "/calendario", label: "Calendário", icon: CalendarDays },
  { href: "/posts", label: "Posts", icon: Images },
  { href: "/crescimento", label: "Crescimento", icon: TrendingUp },
  { href: "/configuracoes", label: "Configurações", icon: Settings },
];

const MOBILE_NAV = NAV.slice(0, 5);

function isActive(pathname: string, href: string) {
  return href === "/" ? pathname === "/" : pathname.startsWith(href);
}

const COLLAPSED_KEY = "sidebar-collapsed";
const COLLAPSED_EVENT = "sidebar-collapsed-change";

/** Estado da sidebar persistido em localStorage, seguro para SSR/hidratação. */
function useCollapsed() {
  const subscribe = useCallback((cb: () => void) => {
    window.addEventListener(COLLAPSED_EVENT, cb);
    return () => window.removeEventListener(COLLAPSED_EVENT, cb);
  }, []);
  const collapsed = useSyncExternalStore(
    subscribe,
    () => localStorage.getItem(COLLAPSED_KEY) === "1",
    () => false
  );
  const setCollapsed = useCallback((v: boolean) => {
    localStorage.setItem(COLLAPSED_KEY, v ? "1" : "0");
    window.dispatchEvent(new Event(COLLAPSED_EVENT));
  }, []);
  return [collapsed, setCollapsed] as const;
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useCollapsed();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const sidebarWidth = collapsed ? "md:w-[76px]" : "md:w-64";
  const contentPad = collapsed ? "md:pl-[76px]" : "md:pl-64";

  return (
    <div className="min-h-dvh">
      {/* ===== Sidebar desktop ===== */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 hidden md:flex flex-col border-r border-edge bg-surface transition-[width] duration-300 ${sidebarWidth}`}
      >
        <div className="flex items-center gap-3 px-4 h-16 shrink-0">
          <span className="insta-gradient grid place-items-center size-9 rounded-xl shrink-0 shadow-lg shadow-insta-pink/20">
            <InstagramIcon className="size-5 text-white" />
          </span>
          {!collapsed && (
            <span className="font-bold text-[15px] leading-tight insta-gradient-text whitespace-nowrap">
              Instagram
              <br />
              AI Manager
            </span>
          )}
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {NAV.map(({ href, label, icon: Icon }) => {
            const active = isActive(pathname, href);
            return (
              <Link
                key={href}
                href={href}
                title={collapsed ? label : undefined}
                className={`group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                  active
                    ? "insta-gradient text-white shadow-lg shadow-insta-pink/25"
                    : "text-ink-dim hover:text-ink hover:bg-surface-2"
                } ${collapsed ? "justify-center px-0" : ""}`}
              >
                <Icon className="size-5 shrink-0" />
                {!collapsed && <span>{label}</span>}
                {collapsed && (
                  <span className="pointer-events-none absolute left-full ml-3 whitespace-nowrap rounded-lg bg-surface-2 border border-edge px-2.5 py-1.5 text-xs text-ink opacity-0 shadow-xl transition-opacity group-hover:opacity-100 z-50">
                    {label}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        <button
          onClick={() => setCollapsed(!collapsed)}
          className="m-3 flex items-center justify-center gap-2 rounded-xl border border-edge bg-surface-2 py-2.5 text-xs text-ink-dim hover:text-ink transition-colors"
          aria-label={collapsed ? "Expandir menu" : "Recolher menu"}
        >
          {collapsed ? <ChevronRight className="size-4" /> : (
            <>
              <ChevronLeft className="size-4" /> Recolher
            </>
          )}
        </button>
      </aside>

      {/* ===== Topbar mobile ===== */}
      <header className="md:hidden sticky top-0 z-40 flex items-center gap-3 h-14 px-4 border-b border-edge bg-surface/90 backdrop-blur">
        <button
          onClick={() => setDrawerOpen(true)}
          className="grid place-items-center size-11 -ml-2 rounded-xl text-ink-dim hover:text-ink"
          aria-label="Abrir menu"
        >
          <Menu className="size-6" />
        </button>
        <span className="insta-gradient grid place-items-center size-8 rounded-lg">
          <InstagramIcon className="size-4 text-white" />
        </span>
        <span className="font-bold text-sm insta-gradient-text">
          Instagram AI Manager
        </span>
      </header>

      {/* ===== Drawer mobile ===== */}
      {drawerOpen && (
        <div className="md:hidden fixed inset-0 z-50">
          <div
            className="absolute inset-0 bg-black/60"
            onClick={() => setDrawerOpen(false)}
          />
          <aside className="absolute inset-y-0 left-0 w-72 max-w-[85vw] bg-surface border-r border-edge flex flex-col fade-up">
            <div className="flex items-center justify-between px-4 h-14 border-b border-edge">
              <span className="font-bold text-sm insta-gradient-text">Menu</span>
              <button
                onClick={() => setDrawerOpen(false)}
                className="grid place-items-center size-11 rounded-xl text-ink-dim hover:text-ink"
                aria-label="Fechar menu"
              >
                <X className="size-5" />
              </button>
            </div>
            <nav className="flex-1 px-3 py-4 space-y-1">
              {NAV.map(({ href, label, icon: Icon }) => {
                const active = isActive(pathname, href);
                return (
                  <Link
                    key={href}
                    href={href}
                    onClick={() => setDrawerOpen(false)}
                    className={`flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium ${
                      active
                        ? "insta-gradient text-white"
                        : "text-ink-dim hover:text-ink hover:bg-surface-2"
                    }`}
                  >
                    <Icon className="size-5" />
                    {label}
                  </Link>
                );
              })}
            </nav>
          </aside>
        </div>
      )}

      {/* ===== Conteúdo ===== */}
      <main
        className={`transition-[padding] duration-300 ${contentPad} pb-24 md:pb-8`}
      >
        <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 py-6">{children}</div>
      </main>

      {/* ===== Barra inferior mobile ===== */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 z-40 grid grid-cols-5 border-t border-edge bg-surface/95 backdrop-blur pb-[env(safe-area-inset-bottom)]">
        {MOBILE_NAV.map(({ href, label, icon: Icon }) => {
          const active = isActive(pathname, href);
          return (
            <Link
              key={href}
              href={href}
              aria-label={label}
              className="flex flex-col items-center justify-center gap-1 h-16"
            >
              <span
                className={`grid place-items-center size-9 rounded-xl transition-colors ${
                  active ? "insta-gradient text-white" : "text-ink-dim"
                }`}
              >
                <Icon className="size-5" />
              </span>
              <span
                className={`text-[10px] leading-none ${
                  active ? "text-ink font-semibold" : "text-ink-dim"
                }`}
              >
                {label.split(" ")[0]}
              </span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
