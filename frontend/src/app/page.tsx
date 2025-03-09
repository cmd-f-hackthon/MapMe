"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import FootprintTracker from "@/components/footprint-tracker";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/auth');
  }, [router]);

  return (
    <main>
      <FootprintTracker />
    </main>
  );
}
