"use client"

import * as React from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuList,
} from "@/components/ui/navigation-menu"

export function NavigationMenuDemo() {
  return (
    <div className="w-full h-15" style={{ backgroundColor: "#9adb75"}}>
        <NavigationMenu>
        <NavigationMenuList>
            <NavigationMenuItem className="ml-4 mt-2 mb-2 mr-2">
            <Avatar className="w-10 h-10">
                <AvatarImage src="/tree.jpg" />
                <AvatarFallback>ME</AvatarFallback>
            </Avatar>
            </NavigationMenuItem>
            <NavigationMenuItem>
                Name
            </NavigationMenuItem>
        </NavigationMenuList>
        </NavigationMenu>
    </div>
  )
}
