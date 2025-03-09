import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { AddEntry } from "@/components/add-entry"
import { NavigationMenuDemo } from "@/components/header"

export default function Dashboard({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <main>
        <NavigationMenuDemo />
        <SidebarTrigger />
        {children}
        <AddEntry />
      </main>
    </SidebarProvider>
  )
}
