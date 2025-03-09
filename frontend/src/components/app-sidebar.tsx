import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarHeader,
  } from "@/components/ui/sidebar"
import { PolaroidImage } from "./polaroid-image"
  
  export function AppSidebar() {
    return (
      <Sidebar>
        <SidebarHeader>
            <h2 className="text-xl font-semibold text-gray-900">History</h2>
        </SidebarHeader>
        <SidebarContent>
            <SidebarGroup >
                <PolaroidImage />
            </SidebarGroup>
            <SidebarGroup >
                <PolaroidImage />
            </SidebarGroup>
            <SidebarGroup >
                <PolaroidImage />
            </SidebarGroup>
        </SidebarContent>
        <SidebarFooter />
      </Sidebar>
    )
  }
  