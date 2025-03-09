// import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
// import { AppSidebar } from "@/components/app-sidebar"
// import { AddEntry } from "@/components/add-entry"
// import { NavigationMenuDemo } from "@/components/header"

// export default function Dashboard({ children }: { children: React.ReactNode }) {
//   return (
//     <div className="h-screen overflow-hidden">
//         <header className="z-10">
//             <NavigationMenuDemo />
//         </header>
//         <SidebarProvider>
//         <AppSidebar />
//         <main>
//             <SidebarTrigger />
//             {children}
//             <div className="fixed bottom-0 left-70 p-4"> {/* Fixed positioning */}
//                 <AddEntry />
//             </div>
//         </main>
//         </SidebarProvider>
//     </div>
//   )
// }


import FootprintTracker from "@/components/footprint-tracker";

export default function Homepage() {
  return (
    <main>
      <FootprintTracker />
    </main>
  );
}
