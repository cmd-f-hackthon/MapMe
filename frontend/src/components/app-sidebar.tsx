import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarHeader,
  } from "@/components/ui/sidebar"
import { PolaroidImage } from "./polaroid-image"
  
interface AppSideBarProps {
    titles: string[];
}

export function AppSidebar({ titles }: AppSideBarProps) {
    return (
        <Sidebar>
        <SidebarHeader style={{ backgroundColor: "#D3F2C1"}}>
            <h2 className="ml-2 text-xl font-semibold text-gray-900">History</h2>
        </SidebarHeader>
        <SidebarContent style={{ backgroundColor: "#D3F2C1" }}>
            {titles.map((title, index) => (
            <SidebarGroup key={index}>
                <PolaroidImage title={title} />
            </SidebarGroup>
            ))}
        </SidebarContent>
        <SidebarFooter />
        </Sidebar>
    )
}
  