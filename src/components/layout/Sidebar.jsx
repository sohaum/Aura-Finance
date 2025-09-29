'use client';

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import {
  LayoutDashboard,
  PlusCircle,
  BarChart3,
  Wallet,
  LogOut,
  LogIn
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Image from "next/image";

const navigationItems = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: LayoutDashboard,
    color: "text-blue-600"
  },
  {
    title: "Add Expense",
    url: "/add-expense",
    icon: PlusCircle,
    color: "text-emerald-600"
  },
  {
    title: "Analytics",
    url: "/analytics",
    icon: BarChart3,
    color: "text-purple-600"
  }
];

export default function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const user = session?.user;

  return (
    <aside className="hidden md:flex flex-col w-64 h-screen sticky top-0 border-r border-white/20 bg-gradient-to-b from-slate-50 to-slate-100 shadow-lg">
      {/* Header */}
      <div className="flex-shrink-0 border-b border-white/20 p-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
            <Wallet className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="font-bold text-slate-900 text-lg gradient-text">AuraFinance</h2>
            <p className="text-xs text-slate-500">Smart financial insights</p>
          </div>
        </div>
      </div>

      {/* Navigation - Scrollable */}
      <nav className="flex-1 overflow-y-auto p-4 scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-transparent">
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider px-3 py-2">
          Navigation
        </p>
        <ul className="space-y-2">
          {navigationItems.map((item) => (
            <li key={item.title}>
              <Link href={item.url}>
                <div className={`flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/60 transition-all duration-300 group hover:transform hover:scale-[1.01] ${
                  pathname === item.url 
                    ? 'bg-white/80 shadow-lg transform scale-[1.02] border border-white/40' 
                    : ''
                }`}>
                  <item.icon className={`w-5 h-5 ${item.color} group-hover:scale-110 transition-transform`} />
                  <span className="font-medium text-slate-700">{item.title}</span>
                </div>
              </Link>
            </li>
          ))}
        </ul>

        {/* Additional space for future nav items */}
        
      </nav>

      {/* Footer - Always visible at bottom */}
      <div className="flex-shrink-0 border-t border-white/20 p-4 bg-white/30 backdrop-blur-sm">
        {user ? (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full flex items-center justify-center flex-shrink-0">
                {user.image ? (
                  <Image
                    height={32}
                    width={32}
                    src={user.image} 
                    alt={user.name || 'User'} 
                    className="w-8 h-8 rounded-full"
                  />
                ) : (
                  <span className="text-white font-semibold text-sm">
                    {user.name?.[0] || user.email?.[0] || 'U'}
                  </span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-slate-900 text-sm truncate">
                  {user.name || 'User'}
                </p>
                <p className="text-xs text-slate-500 truncate">
                  {user.email}
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => signOut({ callbackUrl: '/' })}
              className="hover:bg-red-50 hover:text-red-600 transition-colors duration-200 ml-2 flex-shrink-0"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        ) : (
          <Link href="/sign-in">
            <Button className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-lg">
              <LogIn className="w-4 h-4 mr-2" />
              Sign In
            </Button>
          </Link>
        )}
      </div>
    </aside>
  );
}