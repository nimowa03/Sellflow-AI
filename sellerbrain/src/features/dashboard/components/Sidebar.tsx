'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Bot,
  LayoutDashboard,
  Search,
  FileText,
  Image,
  Upload,
  MessageSquare,
  Settings,
  ChevronLeft,
  Shield,
  Sparkles,
  HelpCircle,
  LogOut
} from 'lucide-react';

interface NavItem {
  href: string;
  label: string;
  icon: React.ElementType;
  badge?: string;
}

const mainNavItems: NavItem[] = [
  { href: '/dashboard', label: '대시보드', icon: LayoutDashboard },
  { href: '/dashboard/chat', label: 'AI 챗봇', icon: MessageSquare, badge: 'NEW' },
  { href: '/dashboard/sourcing', label: '상품 소싱', icon: Search },
  { href: '/dashboard/content', label: '콘텐츠 생성', icon: FileText },
  { href: '/dashboard/images', label: '이미지 생성', icon: Image },
  { href: '/dashboard/legal', label: '법적 검사', icon: Shield },
  { href: '/dashboard/upload', label: '업로드', icon: Upload },
];

const bottomNavItems: NavItem[] = [
  { href: '/dashboard/settings', label: '설정', icon: Settings },
  { href: '/dashboard/help', label: '도움말', icon: HelpCircle },
];

export function Sidebar() {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 z-40 h-screen border-r bg-card transition-all duration-300',
        isCollapsed ? 'w-16' : 'w-64'
      )}
    >
      <div className="flex h-full flex-col">
        {/* Logo */}
        <div className="flex h-16 items-center justify-between border-b px-4">
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <Bot className="h-5 w-5 text-primary-foreground" />
            </div>
            {!isCollapsed && (
              <span className="font-semibold">SellerBrain</span>
            )}
          </Link>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => setIsCollapsed(!isCollapsed)}
          >
            <ChevronLeft
              className={cn(
                'h-4 w-4 transition-transform',
                isCollapsed && 'rotate-180'
              )}
            />
          </Button>
        </div>

        {/* Main Navigation */}
        <nav className="flex-1 space-y-1 px-2 py-4">
          {mainNavItems.map((item) => (
            <NavLink
              key={item.href}
              item={item}
              isActive={pathname === item.href}
              isCollapsed={isCollapsed}
            />
          ))}
        </nav>

        {/* Bottom Navigation */}
        <div className="border-t px-2 py-4 space-y-1">
          {bottomNavItems.map((item) => (
            <NavLink
              key={item.href}
              item={item}
              isActive={pathname === item.href}
              isCollapsed={isCollapsed}
            />
          ))}
          
          {/* Logout */}
          <button
            className={cn(
              'flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground',
              isCollapsed && 'justify-center px-2'
            )}
          >
            <LogOut className="h-4 w-4" />
            {!isCollapsed && <span>로그아웃</span>}
          </button>
        </div>

        {/* Upgrade Banner */}
        {!isCollapsed && (
          <div className="m-3 rounded-lg bg-gradient-to-br from-primary/10 to-purple-500/10 p-4 border border-primary/20">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="h-4 w-4 text-primary" />
              <span className="font-medium text-sm">Pro 업그레이드</span>
            </div>
            <p className="text-xs text-muted-foreground mb-3">
              무제한 상품 등록, 우선 지원
            </p>
            <Button size="sm" className="w-full">
              업그레이드
            </Button>
          </div>
        )}
      </div>
    </aside>
  );
}

function NavLink({
  item,
  isActive,
  isCollapsed,
}: {
  item: NavItem;
  isActive: boolean;
  isCollapsed: boolean;
}) {
  const Icon = item.icon;

  return (
    <Link
      href={item.href}
      className={cn(
        'flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors',
        isActive
          ? 'bg-primary/10 text-primary font-medium'
          : 'text-muted-foreground hover:bg-muted hover:text-foreground',
        isCollapsed && 'justify-center px-2'
      )}
    >
      <Icon className="h-4 w-4 flex-shrink-0" />
      {!isCollapsed && (
        <>
          <span className="flex-1">{item.label}</span>
          {item.badge && (
            <span className="rounded bg-primary px-1.5 py-0.5 text-[10px] font-medium text-primary-foreground">
              {item.badge}
            </span>
          )}
        </>
      )}
    </Link>
  );
}


