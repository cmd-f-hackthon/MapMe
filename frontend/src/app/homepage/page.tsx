"use client";

import { useEffect, useState } from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { AddEntry } from "@/components/add-entry";
import { NavigationMenuDemo } from "@/components/header";
import { PolaroidImage } from "@/components/polaroid-image"; // Import the PolaroidImage component

export default function Dashboard({ children }: { children: React.ReactNode }) {
  const [titles, setTitles] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchJournalEntries = async () => {
      try {
        const response = await fetch("/api/journal-entries"); // Replace with your backend endpoint
        if (!response.ok) {
          throw new Error("Failed to fetch journal entries");
        }
        const data = await response.json();
        const titles = data.map((entry: any) => entry.title); // Extract titles
        setTitles(titles);
      } catch (error) {
        // setError("Error fetching journal entries");
      } finally {
        setLoading(false);
      }
    };

    fetchJournalEntries();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div className="h-screen overflow-hidden">
      <header className="z-10">
        <NavigationMenuDemo />
      </header>
      <SidebarProvider>
        <AppSidebar titles={titles} />
        <main>
          <SidebarTrigger />
          {children}
          {/* Conditionally render polaroid images only if there are titles */}
          {titles.length > 0 ? (
            <div className="p-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {titles.map((title, index) => (
                <PolaroidImage key={index} title={title} />
              ))}
            </div>
          ) : (
            <div className="p-4 text-center text-gray-500">
              No journal entries found. Start by adding one!
            </div>
          )}
          <div className="fixed bottom-0 left-70 p-4"> {/* Fixed positioning */}
            <AddEntry />
          </div>
        </main>
      </SidebarProvider>
    </div>
  );
}