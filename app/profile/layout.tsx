
import "../../app/globals.css"

export const metadata = {
  title: 'Lenscape 2024 profile',
  description: 'Profile page for Lenscape 2024',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
