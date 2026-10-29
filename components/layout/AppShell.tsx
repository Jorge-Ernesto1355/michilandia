"use client";

import { AppProviders, FavoritesProvider, SearchProvider } from "@/context/AppProviders";
import Header from "@/components/layout/Header";
import BottomNavigation from "@/components/layout/BottomNavigation";
import { Toaster } from "sileo";

export default function AppShell({ children }: { children: React.ReactNode }) {
  return <AppProviders><FavoritesProvider><SearchProvider><Toaster position="top-right" theme="light"/><div className="min-h-screen bg-[var(--background)]"><div className="mx-auto min-h-screen max-w-[1120px] bg-[linear-gradient(180deg,#fffdfd_0%,#fff7f8_100%)] shadow-[0_0_70px_rgba(112,38,63,0.07)]"><Header /><main id="main-content" className="pb-24 lg:pb-10">{children}</main><BottomNavigation /></div></div></SearchProvider></FavoritesProvider></AppProviders>;
}
