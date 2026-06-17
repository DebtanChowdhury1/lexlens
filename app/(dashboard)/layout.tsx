'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { UserButton, useUser } from '@clerk/nextjs';
import { Scale, LayoutDashboard, Upload, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useEffect, useState } from 'react';

const AVATAR_KEY = 'lexlens_avatar';

const AVATAR_BG: Record<string, string> = {
  'violet-scale': 'linear-gradient(135deg, #5B21B6, #7C3AED)',
  'blue-shield':  'linear-gradient(135deg, #1D4ED8, #3B82F6)',
  'emerald-star': 'linear-gradient(135deg, #065F46, #10B981)',
  'orange-bolt':  'linear-gradient(135deg, #92400E, #F59E0B)',
  'rose-crown':   'linear-gradient(135deg, #9F1239, #F43F5E)',
  'cyan-atom':    'linear-gradient(135deg, #164E63, #06B6D4)',
};

function SidebarAvatar() {
  const { user } = useUser();
  const [avatarId, setAvatarId] = useState('violet-scale');

  useEffect(() => {
    const saved = localStorage.getItem(AVATAR_KEY);
    if (saved) setAvatarId(saved);
  }, []);

  const initial = (user?.firstName?.[0] ?? user?.username?.[0] ?? 'U').toUpperCase();
  const bg = AVATAR_BG[avatarId] ?? AVATAR_BG['violet-scale'];

  return (
    <div
      className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
      style={{ background: bg }}
    >
      {initial}
    </div>
  );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user } = useUser();

  const navItems = [
    { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { href: '/analyze',   icon: Upload,          label: 'Analyze Contract' },
    { href: '/settings',  icon: Settings,         label: 'Settings' },
  ];

  return (
    <div className="min-h-screen bg-[#0A0A0F] flex">
      {/* Sidebar */}
      <aside className="hidden md:flex flex-col w-60 border-r border-white/10 bg-[#0D0D15] fixed h-full z-40">
        <div className="p-5 border-b border-white/10">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-violet-600 rounded-lg flex items-center justify-center">
              <Scale size={15} className="text-white" />
            </div>
            <span className="font-bold text-[#F8FAFC]" style={{ fontFamily: 'Syne, sans-serif' }}>
              LexLens
            </span>
          </Link>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {navItems.map(({ href, icon: Icon, label }) => {
            const active = pathname === href || (href !== '/dashboard' && pathname.startsWith(href));
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all ${
                  active
                    ? 'bg-violet-600/20 text-violet-300 font-medium'
                    : 'text-[#94A3B8] hover:text-[#F8FAFC] hover:bg-white/5'
                }`}
              >
                <Icon size={16} />
                {label}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-white/10">
          <div className="flex items-center gap-3">
            <SidebarAvatar />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-[#F8FAFC] truncate">
                {user?.firstName ?? user?.username ?? 'Account'}
              </p>
              <p className="text-xs text-[#475569] truncate">
                {user?.primaryEmailAddress?.emailAddress}
              </p>
            </div>
            <UserButton  />
          </div>
        </div>
      </aside>

      {/* Mobile header */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 h-14 border-b border-white/10 bg-[#0D0D15]/90 backdrop-blur-md">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-7 h-7 bg-violet-600 rounded-lg flex items-center justify-center">
            <Scale size={13} className="text-white" />
          </div>
          <span className="font-bold text-[#F8FAFC] text-sm">LexLens</span>
        </Link>
        <div className="flex items-center gap-3">
          <Link href="/analyze">
            <Button size="sm" className="gap-1 text-xs px-3">
              <Upload size={12} />
              Analyze
            </Button>
          </Link>
          <Link href="/settings">
            <Button variant="ghost" size="sm" className="px-2">
              <Settings size={16} className="text-[#94A3B8]" />
            </Button>
          </Link>
          <UserButton  />
        </div>
      </div>

      {/* Main content */}
      <main id="main-content" className="flex-1 md:ml-60 mt-14 md:mt-0">{children}</main>
    </div>
  );
}
