
'use client'; // This layout uses hooks, so it must be a client component

import type { ReactNode } from 'react';
import { SidebarProvider } from '@/components/ui/sidebar';
import AppHeader from '@/components/app-header';
import AppSidebar from '@/components/app-sidebar';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import GlobalChatbot from '@/components/global-chatbot'; // Import GlobalChatbot

export default function MainAppLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <ProtectedRoute>
      <SidebarProvider>
        <div className="flex min-h-screen flex-col">
          <AppHeader />
          <div className="flex flex-1">
            <AppSidebar />
            <main className="flex-1 bg-secondary/50 p-4 md:p-6 lg:p-8">
              {children}
            </main>
          </div>
        </div>
        <GlobalChatbot /> {/* Add GlobalChatbot here */}
      </SidebarProvider>
    </ProtectedRoute>
  );
}
