import type { Metadata } from "next";
import "./globals.css";
import AppShell from "@/components/layout/AppShell";

export const metadata: Metadata = { title: "Michilandia | Accesorios tiernos para tu gatito", description: "Accesorios artesanales kawaii para gatos consentidos en Michilandia.", icons: { icon: "/favicon.ico" } };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) { return <html lang="es"><body><AppShell>{children}</AppShell></body></html>; }
