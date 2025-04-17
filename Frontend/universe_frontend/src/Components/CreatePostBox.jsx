import { useRef, useState } from "react"
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import axios from "@/lib/axios"
import { useAuth } from "@/hooks/useAuth"
import { ImageIcon, Loader2 } from "lucide-react"

export default function CreatePostBox({ onPostCreated }) {
  const { user } = useAuth()
  const [description, setDescription] = useState("")
  const [media, setMedia] = useState(null)
  const [preview, setPreview] = useState(null)
  const [loading, setLoading] = useState(false)
  const fileRef = useRef(null)

  const handleMediaChange = (event) => {
    const file = event.target.files[0]
    console.log("file from handleMediachange: ", file)
    if (!file) return

    setMedia(file)
    setPreview(URL.createObjectURL(file))
  }

  const handleSubmit = async () => {
    if (!description && !media) {
      toast.warning("Please add a description or select a media file.")
      return
    }

    console.log("This is the media!", media)

    const formData = new FormData()
    if (description) formData.append("description", description)
    if (media) {console.log("appending media: ", media); formData.append("media", media)}

    console.log("Final form data before submitting: ", formData)
    for (let pair of formData.entries()) {
        console.log(`${pair[0]}:`, pair[1])
      }
      

    setLoading(true)
    try {
      console.log("Trying to submit this data: ", formData)
      const res = await axios.post("/posts", formData)
      console.log("Got this responsne: ", res)
      toast.success("Post created successfully!")
      setDescription("")
      setMedia(null)
      setPreview(null)
      onPostCreated?.(res.data.payload)
    } catch (err) {
      toast.error("Failed to create post.")
      console.error("Create post error:", err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-2xl min-w-[clamp(20rem,50vw,40rem)] mx-auto mb-6 shadow-sm rounded-xl border">
      <CardHeader className="flex items-center gap-4 pb-2">
        <Avatar>
          <AvatarImage src={user.profilePic}  />
          <AvatarFallback>{user.firstName?.[0]?.toUpperCase()}</AvatarFallback>
        </Avatar>
        <p className="font-semibold text-sm text-muted-foreground">
          What's on your mind, {user.firstName.toUpperCase()}?
        </p>
      </CardHeader>

      <CardContent className="space-y-3 pt-0">
        <Textarea
          placeholder="Write something..."
          value={description}
          onChange={(e) => {console.log("desc changed!"); setDescription(e.target.value)}}
          className="resize-none"
        />

        {preview && (
          <>
            {media.type.startsWith("video") ? (
              <video src={preview} controls className="w-full max-h-96 rounded-lg" />
            ) : (
              <img src={preview} alt="Preview" className="w-full max-h-96 rounded-lg object-cover" />
            )}
          </>
        )}

        <div className="flex items-center justify-between">
          <Button variant="ghost" size="sm" onClick={() => fileRef.current.click()}>
            <ImageIcon className="w-4 h-4 mr-2" />
            Media
          </Button>
          <Input
            type="file"
            accept="image/*"
            ref={fileRef}
            onChange={handleMediaChange}
            className="hidden"
          />

          <Button onClick={handleSubmit} disabled={loading}>
            {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Post
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
