'use client';

import Link from 'next/link';
import { UserButton, Show, useUser } from '@clerk/nextjs';
import { Button } from '@/components/ui/button';
import { Scale } from 'lucide-react';

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  const { user } = useUser();
  const firstName = user?.firstName || user?.username || null;

  return (
    <div className="min-h-screen bg-[#0A0A0F]">
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 md:px-10 h-16 border-b border-white/5 bg-[#0A0A0F]/80 backdrop-blur-md">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-violet-600 rounded-lg flex items-center justify-center">
            <Scale size={16} className="text-white" />
          </div>
          <span className="font-bold text-lg text-white" style={{ fontFamily: 'Syne, sans-serif' }}>
            LexLens
          </span>
        </Link>

        <div className="hidden md:flex items-center gap-6 text-sm text-[#94A3B8]">
          <Link href="/#how-it-works" className="hover:text-white transition-colors">How it works</Link>
          <Link href="/#features" className="hover:text-white transition-colors">Features</Link>
          <Link href="/demo" className="hover:text-white transition-colors text-violet-400">Live Demo</Link>
        </div>

        <div className="flex items-center gap-3">
          <Show when="signed-out">
            <Link href="/sign-in">
              <Button variant="ghost" size="sm">Sign in</Button>
            </Link>
            <Link href="/sign-up">
              <Button size="sm">Get Started Free</Button>
            </Link>
          </Show>
          <Show when="signed-in">
            {firstName && (
              <span className="hidden sm:block text-sm text-[#94A3B8]">
                Hi, <span className="text-violet-400 font-semibold">{firstName}</span>
              </span>
            )}
            <Link href="/dashboard">
              <Button size="sm" variant="secondary">Dashboard</Button>
            </Link>
            <UserButton />
          </Show>
        </div>
      </nav>

      <main id="main-content" className="pt-16">{children}</main>
    </div>
  );
}
