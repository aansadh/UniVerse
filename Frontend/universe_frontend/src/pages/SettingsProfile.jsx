import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { useAuth } from "@/hooks/useAuth"
import { toast } from "sonner"
import { Upload } from "lucide-react"
import { Textarea } from "@/components/ui/textarea"
import axios from '@/lib/axios'

export default function SettingsProfilePage() {
  const { user } = useAuth()
  const [formData, setFormData] = useState({
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    email: user?.email || "",
    bio: user?.bio || "",
    profilePic: null,
  })

  const [previewPic, setPreviewPic] = useState(user?.profilePic || "")
  const [loading, setLoading] = useState(false)

  console.log("preview pic: ", previewPic)

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handlePicChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setFormData((prev) => ({ ...prev, profilePic: file }))
      setPreviewPic(URL.createObjectURL(file))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      setLoading(true)
      const data = new FormData()
      data.append("firstName", formData.firstName)
      data.append("lastName", formData.lastName)
      data.append("email", formData.email)
      data.append("bio", formData.bio)
      if (formData.profilePic) data.append("profilePic", formData.profilePic)

      const res = await axios.patch('/users/update', data)
      console.log("Woohoo! Successfully uploaded with response: ", res)
      toast.success("Profile updated successfully")
    } catch (err) {
      console.error("Update failed", err)
      toast.error("Failed to update profile")
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateStr) => new Date(dateStr).toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  })

  return (
    <div className="max-w-3xl mx-auto space-y-6 p-4">
      <Card className="p-4">
        <CardContent className="flex flex-col items-center gap-4">
          <div className="w-32 h-32 rounded-full overflow-hidden border">
            <img src={previewPic} alt="Profile" className="w-full h-full object-cover" />
          </div>
          <div className="relative">
            <Input type="file" accept="image/*" onChange={handlePicChange} className="opacity-0 absolute inset-0 z-10 cursor-pointer" />
            <Button variant="outline" type="button" className="flex items-center gap-2 py-4 relative z-0">
              <Upload size={16} />
              Upload New Photo
            </Button>
          </div>
        </CardContent>
      </Card>

      <form onSubmit={handleSubmit}>
        <Card className="p-4 space-y-4">
          <CardHeader>
            <CardTitle className='text-center text-bold text-xl'>Edit Profile Info</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" value={formData.email} onChange={handleChange} />
            </div>
            <div className="space-y-3">
              <Label htmlFor="firstName">First Name</Label>
              <Input id="firstName" name="firstName" value={formData.firstName} onChange={handleChange} />
            </div>
            <div className="space-y-3">
              <Label htmlFor="lastName">Last Name</Label>
              <Input id="lastName" name="lastName" value={formData.lastName} onChange={handleChange} />
            </div>
            <div className="space-y-3">
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                    id="bio"
                    name="bio"
                    value={formData.bio}
                    onChange={handleChange}
                    rows={4} 
                    className='max-h-40 overflow-y-auto'
                    placeholder="Tell us a bit about yourself..."
                />
            </div>
            <div className="flex justify-center py-4">
              <Button type="submit" disabled={loading}>
                {loading ? "Updating..." : "Update Profile"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>

      <div className="text-sm text-muted-foreground text-center">
        <p>Joined: {formatDate(user?.createdAt)}</p>
        <p>Last Updated: {formatDate(user?.updatedAt)}</p>
      </div>
    </div>
  )
}
