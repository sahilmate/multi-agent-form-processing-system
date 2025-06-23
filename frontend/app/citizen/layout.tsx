"use client"

import { CitizenAuthProvider } from "@/hooks/use-citizen-auth"
import { Toaster } from "@/components/ui/toaster"

export default function CitizenLayout({ children }: { children: React.ReactNode }) {
  return (
    <CitizenAuthProvider>
      {children}
      <Toaster />
    </CitizenAuthProvider>
  )
}
