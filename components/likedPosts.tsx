import Image from "next/legacy/image"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface LikedPost {
  id: string;
  title: string;
  imageUrl: string;
}

// const likedPosts: LikedPost[] = [
//   { id: "1", title: "Sunset at the beach", imageUrl: "/placeholder.svg?height=100&width=100" },
//   { id: "2", title: "Mountain landscape", imageUrl: "/placeholder.svg?height=100&width=100" },
//   { id: "3", title: "City skyline", imageUrl: "/placeholder.svg?height=100&width=100" },
// ]

export default function LikedPosts() {
  return (
    <Card className="bg-gray-800 border-gray-700">
      <CardHeader>
        <CardTitle className="text-xl font-semibold text-neutral-400">Liked Posts</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-white">
            <p className="text-white">Liked posts will be available after voting has started</p>
          {/* {likedPosts.map((post) => (
            <div key={post.id} className="bg-gray-700 rounded-md overflow-hidden">
              <Image
                src={post.imageUrl}
                alt={post.title}
                width={100}
                height={100}
                layout="responsive"
                className="object-cover"
              />
              <div className="p-2">
                <h3 className="text-sm font-medium truncate">{post.title}</h3>
              </div>
            </div>
          ))} */}
        </div>
      </CardContent>
    </Card>
  )
}