import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { AddEntry } from "@/components/add-entry"
import { NavigationMenuDemo } from "@/components/header"

export default function Dashboard({ children }: { children: React.ReactNode }) {
  return (
    <div>
        <header className="z-10">
            <NavigationMenuDemo />
        </header>
        <SidebarProvider>
        <AppSidebar />
        <main>
            <SidebarTrigger />
            {children}
            <AddEntry />
        </main>
        </SidebarProvider>
    </div>
  )
}
