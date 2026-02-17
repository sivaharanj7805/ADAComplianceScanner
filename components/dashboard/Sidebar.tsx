'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Globe,
  Search,
  FileText,
  Settings,
  Zap,
  ChevronLeft,
  X,
} from 'lucide-react';
import type { PlanType } from '@/lib/types/database';

interface SidebarProps {
  plan: PlanType;
  collapsed: boolean;
  mobileOpen: boolean;
  onToggleCollapse: () => void;
  onCloseMobile: () => void;
}

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/sites', label: 'Sites', icon: Globe },
  { href: '/scans', label: 'Scans', icon: Search },
  { href: '/reports', label: 'Reports', icon: FileText },
  { href: '/settings', label: 'Settings', icon: Settings },
];

const PLAN_LABELS: Record<PlanType, string> = {
  free: 'Free',
  agency_starter: 'Agency Starter',
  agency_growth: 'Agency Growth',
  agency_scale: 'Agency Scale',
  ecom_shield: 'eComm Shield',
  ecom_guard: 'eComm Guard',
  ecom_fortress: 'eComm Fortress',
  municipal_starter: 'Municipal Starter',
  municipal_pro: 'Municipal Pro',
};

export default function Sidebar({
  plan,
  collapsed,
  mobileOpen,
  onToggleCollapse,
  onCloseMobile,
}: SidebarProps) {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === '/dashboard') return pathname === '/dashboard';
    return pathname.startsWith(href);
  };

  return (
    <>
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={onCloseMobile}
        />
      )}

      <aside
        className={`
          fixed top-0 left-0 z-50 flex h-full flex-col border-r border-gray-200 bg-white
          transition-all duration-200 ease-in-out
          ${collapsed ? 'w-[68px]' : 'w-[260px]'}
          ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0 lg:static lg:z-auto
        `}
      >
        {/* Logo / brand */}
        <div className="flex h-16 items-center justify-between border-b border-gray-200 px-4">
          {!collapsed && (
            <Link href="/dashboard" className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-500 text-white font-bold text-sm">
                A
              </div>
              <span className="text-base font-semibold text-gray-900">
                AccessAudit
              </span>
            </Link>
          )}
          {collapsed && (
            <Link href="/dashboard" className="mx-auto">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-500 text-white font-bold text-sm">
                A
              </div>
            </Link>
          )}
          {/* Mobile close */}
          <button
            onClick={onCloseMobile}
            className="rounded-md p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 lg:hidden"
            aria-label="Close sidebar"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-4">
          <ul className="space-y-1">
            {NAV_ITEMS.map((item) => {
              const active = isActive(item.href);
              const Icon = item.icon;
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={onCloseMobile}
                    className={`
                      flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors
                      ${
                        active
                          ? 'bg-orange-50 text-orange-700'
                          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                      }
                      ${collapsed ? 'justify-center px-2' : ''}
                    `}
                    title={collapsed ? item.label : undefined}
                  >
                    <Icon
                      className={`h-5 w-5 shrink-0 ${
                        active ? 'text-orange-600' : 'text-gray-400'
                      }`}
                    />
                    {!collapsed && <span>{item.label}</span>}
                  </Link>
                </li>
              );
            })}

            {/* Upgrade CTA (only on free plan) */}
            {plan === 'free' && (
              <li>
                <Link
                  href="/dashboard/upgrade"
                  onClick={onCloseMobile}
                  className={`
                    flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors
                    bg-orange-500/10 text-orange-600 hover:bg-orange-500/20
                    ${collapsed ? 'justify-center px-2' : ''}
                  `}
                  title={collapsed ? 'Upgrade' : undefined}
                >
                  <Zap className="h-5 w-5 shrink-0 text-orange-500" />
                  {!collapsed && <span>Upgrade</span>}
                </Link>
              </li>
            )}
          </ul>
        </nav>

        {/* Plan badge + collapse toggle */}
        <div className="border-t border-gray-200 px-3 py-3">
          {!collapsed && (
            <div className="mb-2 flex items-center gap-2 rounded-lg bg-gray-50 px-3 py-2">
              <div
                className={`h-2 w-2 rounded-full ${
                  plan === 'free' ? 'bg-gray-400' : 'bg-green-500'
                }`}
              />
              <span className="text-xs font-medium text-gray-600">
                {PLAN_LABELS[plan]}
              </span>
            </div>
          )}
          <button
            onClick={onToggleCollapse}
            className="hidden w-full items-center justify-center rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600 lg:flex"
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            <ChevronLeft
              className={`h-4 w-4 transition-transform ${
                collapsed ? 'rotate-180' : ''
              }`}
            />
          </button>
        </div>
      </aside>
    </>
  );
}
