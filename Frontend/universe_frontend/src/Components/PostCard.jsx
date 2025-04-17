import { useState } from "react"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { AlertDialog, AlertDialogTrigger, AlertDialogContent, AlertDialogHeader, AlertDialogFooter, AlertDialogTitle, AlertDialogDescription, AlertDialogCancel, AlertDialogAction } from "@/components/ui/alert-dialog"
import { MessageCircle, Heart, Trash } from "lucide-react"
import { cn } from "@/lib/utils"
import axios from "@/lib/axios"
import { toast } from "sonner"
import { useAuth } from "@/hooks/useAuth"
import { Link } from 'react-router-dom'

export default function PostCard({ post, onPostDeleted }) {
  const { _id, uploader, description, media, createdAt } = post
  const { user } = useAuth()

  const [liked, setLiked] = useState(post.liked)
  const [likesCount, setLikesCount] = useState(post.likesCount)
  const [loading, setLoading] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)

  const formattedDate = new Date(createdAt).toLocaleString('en-IN', {
    dateStyle: 'medium',
    timeStyle: 'short',
  })

  const toggleLike = async () => {
    if (loading) return
    setLoading(true)
    try {
      const res = await axios.post(`/posts/like-unlike/${_id}`)
      setLikesCount(res.data.likesCount)
      setLiked(prev => !prev)
    } catch (err) {
      console.error("Failed to like/unlike post:", err)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    try {
      await axios.delete(`/posts/${_id}`)
      toast.success("Post deleted.")
      onPostDeleted?.(_id)
    } catch (err) {
      console.error("Failed to delete post:", err)
      toast.error("Failed to delete post.")
    }
  }

  return (
    <Card className="w-full max-w-2xl min-w-[clamp(20rem,50vw,40rem)] mx-auto mb-6 shadow-sm rounded-xl border relative">
      {user?._id === uploader._id && (
        <div className="absolute top-3 right-3">
          <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
            <AlertDialogTrigger asChild>
              <button className="text-muted-foreground hover:text-destructive transition-colors">
                <Trash size={18} />
              </button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete} className="bg-destructive text-white hover:bg-destructive/90">Delete</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      )}

      <CardHeader className="flex items-center gap-4 pb-2">
        <Avatar>
          {console.log("uploader.profilePic from postCard:Avatar:: ", uploader.profilePic )}
          <AvatarImage src={uploader.profilePic} />
          <AvatarFallback>{uploader.firstName?.[0]?.toUpperCase()}</AvatarFallback>
        </Avatar>
        <div>
          <CardTitle className="text-base font-semibold capitalize">
            <Link to={`/profile/${uploader._id}`}>
              {uploader.firstName}
            </Link>
          </CardTitle>
          <p className="text-sm text-muted-foreground">{formattedDate}</p>
        </div>
      </CardHeader>

      <CardContent className="space-y-3 pt-0">
        {media && (
          <>
            {media.endsWith(".mp4") ? (
              <video autoPlay playsInline loop muted className="bg-black h-64 w-full rounded-lg">
                <source src={`http://localhost:5000/posts/media/${media}`} type="video/mp4" />
              </video>
            ) : (
              <img
                src={`http://localhost:5000/posts/media/${media}`}
                alt="Post media"
                className="w-full max-h-96 rounded-lg object-cover"
              />
            )}
          </>
        )}
        <p className="text-sm break-words">{description}</p>
      </CardContent>

      <CardFooter className="flex items-center justify-between text-muted-foreground text-sm pt-2">
        <div className="flex gap-4">
          <button onClick={toggleLike} className="flex items-center gap-1">
            <Heart
              size={16}
              className={cn(
                "cursor-pointer transition-colors duration-200",
                liked && "text-red-500 fill-red-500"
              )}
            />
            {likesCount}
          </button>
          <span className="flex items-center gap-1">
            <MessageCircle size={16} /> 0
          </span>
        </div>
      </CardFooter>
    </Card>
  )
}
