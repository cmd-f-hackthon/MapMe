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
        <SidebarHeader style={{ backgroundColor: "#D3F2C1"}}>
            <h2 className="ml-2 text-xl font-semibold text-gray-900">History</h2>
        </SidebarHeader>
        <SidebarContent style={{ backgroundColor: "#D3F2C1" }}>
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
  