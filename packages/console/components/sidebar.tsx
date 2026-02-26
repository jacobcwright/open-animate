'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { UserButton } from '@clerk/nextjs';
import {
  Home,
  BarChart3,
  Key,
  Settings,
  CreditCard,
  FileText,
  Github,
  PanelLeftClose,
  PanelLeft,
  ExternalLink,
  Film,
  Layers,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSidebar } from './sidebar-provider';

const navItems = [
  { label: 'Home', href: '/dashboard', icon: Home },
  { label: 'Templates', href: '/dashboard/templates', icon: Layers },
  { label: 'Renders', href: '/dashboard/renders', icon: Film },
  { label: 'Usage', href: '/dashboard/usage', icon: BarChart3 },
  { label: 'Billing', href: '/dashboard/billing', icon: CreditCard },
  { label: 'API Keys', href: '/dashboard/api-keys', icon: Key },
  { label: 'Settings', href: '/dashboard/settings', icon: Settings },
];

const externalLinks = [
  { label: 'Documentation', href: 'https://docs.oanim.dev', icon: FileText },
  { label: 'GitHub', href: 'https://github.com/jacobcwright/open-animate', icon: Github },
];

export function Sidebar() {
  const pathname = usePathname();
  const { isCollapsed, toggle } = useSidebar();

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 h-screen bg-surface border-r border-border-subtle flex flex-col transition-all duration-200',
        isCollapsed ? 'w-16' : 'w-60'
      )}
    >
      {/* Logo */}
      <div
        className={cn(
          'border-b border-border-subtle flex items-center',
          isCollapsed ? 'p-4 justify-center' : 'px-5 py-4'
        )}
      >
        <Link href="/dashboard" className="flex items-center">
          {isCollapsed ? (
            <span className="text-base font-serif font-semibold tracking-tight text-foreground">oa</span>
          ) : (
            <>
              <span className="text-base font-serif font-semibold tracking-tight text-foreground">open animate</span>
              <span className="ml-3 text-[10px] font-medium uppercase tracking-widest text-muted-foreground border border-border-strong px-1.5 py-0.5 leading-none">
                Beta
              </span>
            </>
          )}
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-2 flex flex-col">
        <ul className="space-y-1">
          {navItems.map((item) => {
            const isActive =
              item.href === '/dashboard'
                ? pathname === '/dashboard'
                : pathname.startsWith(item.href);

            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    'flex items-center text-sm transition-colors',
                    isCollapsed ? 'justify-center p-3' : 'gap-3 px-3 py-2',
                    isActive
                      ? 'bg-accent-primary/15 text-accent-primary'
                      : 'text-muted-foreground hover:text-foreground hover:bg-elevated'
                  )}
                  title={isCollapsed ? item.label : undefined}
                >
                  <item.icon className="w-5 h-5 flex-shrink-0" />
                  {!isCollapsed && item.label}
                </Link>
              </li>
            );
          })}
        </ul>

        {/* External Links */}
        <div className="mt-auto pt-4 border-t border-border-subtle">
          <ul className="space-y-1">
            {externalLinks.map((item) => (
              <li key={item.href}>
                <a
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cn(
                    'flex items-center text-sm transition-colors text-muted-foreground hover:text-foreground hover:bg-elevated',
                    isCollapsed ? 'justify-center p-3' : 'gap-3 px-3 py-2'
                  )}
                  title={isCollapsed ? item.label : undefined}
                >
                  <item.icon className="w-5 h-5 flex-shrink-0" />
                  {!isCollapsed && (
                    <>
                      <span className="flex-1">{item.label}</span>
                      <ExternalLink className="w-3 h-3 opacity-50" />
                    </>
                  )}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </nav>

      {/* Footer */}
      <div
        className={cn(
          'border-t border-border-subtle p-3 flex items-center',
          isCollapsed ? 'flex-col gap-3' : 'justify-between'
        )}
      >
        <UserButton
          afterSignOutUrl="/"
          appearance={{ elements: { avatarBox: 'w-8 h-8' } }}
        />
        <button
          onClick={toggle}
          className="p-2 text-muted-foreground transition-colors hover:text-foreground hover:bg-elevated"
          title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {isCollapsed ? (
            <PanelLeft className="w-5 h-5" />
          ) : (
            <PanelLeftClose className="w-5 h-5" />
          )}
        </button>
      </div>
    </aside>
  );
}
