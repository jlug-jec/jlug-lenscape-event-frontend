import { Footer } from "@/components/footer"

export const metadata = {
  title: 'Lenscape 2024 countdown',
  description: 'Countdown timer for Lenscape 2024 launch',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}
      <Footer/>
      </body>
    </html>
  )
}
