import FootprintTracker from "@/components/footprint-tracker";

export default function Home() {
  const router = useRouter()

  useEffect(() => {
    router.push('/auth')
  }, [])

  return (
    <main>
      <FootprintTracker />
    </main>
  );
}
