"use client";

import { ThemeProvider } from "@/components/ui/theme-provider";
import { AuthProvider } from "@/providers/AuthContext";
import { ProjectProvider } from "@/providers/ProjectContext";
import ClientTopLoader from "@/providers/ClientTopLoader";
import { Toaster } from "@/components/ui/sonner";
import { TableProvider } from "./TableContext";
import SessionWatcher from "./SessionWatcher";

export default function Provider({ children }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <AuthProvider>
        <ProjectProvider>
           <TableProvider>
             <ClientTopLoader />
          <Toaster
            expand={false}
            position="top-center"
            richColors
            closeButton
          />
           <SessionWatcher />
          {children}
          </TableProvider>
        </ProjectProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
