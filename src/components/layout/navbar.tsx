import Link from "next/link";
import { UserButton } from "@clerk/nextjs";
import { Bell, LayoutDashboard } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-[#E5E0D8] bg-white/95 backdrop-blur-sm">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#1A3A2A]">
              <span className="text-xs font-bold text-[#C8A96E]">PP</span>
            </div>
            <span className="text-lg font-semibold text-[#1A1F2E]">
              Planning<span className="text-[#1A3A2A]">Perm</span>
            </span>
          </Link>

          {/* Nav links */}
          <nav className="hidden md:flex items-center gap-6">
            <Link
              href="/dashboard"
              className="text-sm font-medium text-[#6B7280] hover:text-[#1A1F2E] transition-colors flex items-center gap-1.5"
            >
              <LayoutDashboard className="h-4 w-4" />
              Dashboard
            </Link>
          </nav>

          {/* Right actions */}
          <div className="flex items-center gap-3">
            <Link href="/dashboard/alerts">
              <Button variant="ghost" size="icon">
                <Bell className="h-4 w-4" />
                <span className="sr-only">Alerts</span>
              </Button>
            </Link>
            <UserButton />
          </div>
        </div>
      </div>
    </header>
  );
}
