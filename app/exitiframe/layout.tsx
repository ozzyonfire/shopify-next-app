import { ExitProvider } from "@/providers/providers";

export default function ExitLayout({
  children
}: {
  children: React.ReactNode
}) {
  return (
    <ExitProvider>
      {children}
    </ExitProvider>
  )
}