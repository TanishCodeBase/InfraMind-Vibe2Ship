"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Layers, Plus, Map, List, LogOut, LogIn, Award } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/providers/AuthProvider";
import { APP_NAME } from "@/lib/constants";
import { cn } from "@/lib/utils";

export function Navbar(): JSX.Element {
  const { isAuthenticated, signIn, logout, authUser, isInitializing } = useAuth();
  const pathname = usePathname();

  const navLinks = [
    { href: "/feed", label: "Live Feed", icon: List },
    { href: "/map", label: "Incident Map", icon: Map },
    { href: "/report", label: "Report Issue", icon: Plus },
  ];

  return (
    <nav className="fixed top-0 inset-x-0 z-50 transition-all duration-300 border-b border-slate-800 bg-slate-950/80 backdrop-blur-md shadow-sm">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Branding */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="relative flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 shadow-lg shadow-blue-500/30 group-hover:shadow-blue-500/50 transition-shadow duration-300">
              <Layers className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-lg tracking-tight text-white">
              Infra<span className="text-blue-400">Mind</span>
            </span>
          </Link>

          {/* Navigation links (Desktop) */}
          <div className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "flex items-center gap-1.5 text-sm font-medium transition-colors duration-200 py-1.5 px-3 rounded-lg",
                    isActive
                      ? "text-blue-400 bg-blue-500/10 border border-blue-500/20"
                      : "text-slate-400 hover:text-white hover:bg-slate-900"
                  )}
                >
                  <Icon className="w-4 h-4" />
                  {link.label}
                </Link>
              );
            })}
          </div>

          {/* Actions / Profile */}
          <div className="flex items-center gap-3">
            {false ? (
              <div className="h-9 w-24 rounded-md bg-slate-900 animate-pulse" />
            ) : isAuthenticated ? (
              <div className="flex items-center gap-3">
                {/* Authority Portal Link (only shown if they have a role) */}
                <Link
                  href="/authority"
                  className={cn(
                    "hidden sm:flex items-center gap-1 text-xs font-semibold py-1 px-2.5 rounded-full border bg-slate-900 transition-colors",
                    pathname === "/authority"
                      ? "text-purple-400 border-purple-500/30 bg-purple-500/10"
                      : "text-slate-400 border-slate-800 hover:text-slate-300"
                  )}
                >
                  <Award className="w-3.5 h-3.5" />
                  <span>Authority Portal</span>
                </Link>

                {/* Profile Badge */}
                <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 p-1 pr-3 rounded-full">
                  <div className="w-7 h-7 rounded-full bg-blue-500/20 text-blue-300 font-semibold flex items-center justify-center text-xs">
                    {authUser?.displayName ? authUser.displayName[0].toUpperCase() : "U"}
                  </div>
                  <span className="text-xs font-medium text-slate-300 hidden sm:inline max-w-[100px] truncate">
                    {authUser?.displayName}
                  </span>
                </div>

                {/* Sign Out */}
                <Button
                  id="nav-logout"
                  variant="ghost"
                  size="sm"
                  onClick={() => void logout()}
                  className="text-slate-400 hover:text-white hover:bg-slate-900"
                >
                  <LogOut className="w-4 h-4 mr-1.5" />
                  <span className="hidden sm:inline">Sign Out</span>
                </Button>
              </div>
            ) : (
              <Button
                id="nav-sign-in"
                variant="gradient"
                size="sm"
                onClick={() => void signIn()}
              >
                <LogIn className="w-4 h-4 mr-1.5" />
                Sign In
              </Button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
