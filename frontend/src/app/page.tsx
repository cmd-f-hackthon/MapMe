"use client";

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { NavigationMenuDemo } from "@/components/header";

export default function Home() {
  const router = useRouter()

  useEffect(() => {
    router.push('/auth')
  }, [])

  return (
    <NavigationMenuDemo />
  );
}
