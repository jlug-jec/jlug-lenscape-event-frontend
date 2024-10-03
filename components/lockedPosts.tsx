import { Lock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useRouter } from "next/navigation"

export default function LockedPosts() {
  const router=useRouter()
  return (
    <Card className="bg-gray-800 border-gray-700 text-neutral-400">
      <CardHeader>
        <CardTitle className="text-xl font-semibold flex items-center">
          <Lock className="w-5 h-5 mr-2" />
          Your Posts
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative">
          <div className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center rounded-sm">
            <div className="text-center">
              <div className="mb-4">
                <Lock className="w-16 h-16 mx-auto text-gray-400" />
              </div>
              <p className="text-lg mb-4 text-gray-400">Participate in competition to see your analytics</p>
              <Button variant="outline" className="bg-gray-600 hover:bg-gray-700 text-white"
              onClick={() => {
                router.push("/onboarding")
              }}
              >
                Unlock
              </Button>
            </div>
          </div>
          <div className="h-48 bg-gray-700 rounded-md"></div>
        </div>
      </CardContent>
    </Card>
  )
}