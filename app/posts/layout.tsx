import 'react-toastify/dist/ReactToastify.css'
import "../../app/globals.css"

export const metadata = {
  title: 'Lenscape Voting',
  description: 'Voting has started for lenscape',
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
