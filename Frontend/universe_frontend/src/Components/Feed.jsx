import { useEffect, useState } from "react"
import PostCard from "@/components/PostCard"
import axios from "@/lib/axios"

export default function Feed(props) {
  const { posts, setPosts } = props
  const [ loading, setLoading ] = useState(false)

  // useEffect(() => {
  //   console.log("Updated posts in Feed:", posts)
  // }, [posts])  

  const fetchPosts = async () => {
    setLoading(true)
    try {
      const res = await axios.get("/posts")
      console.log("The resposne from fetchPosts: ", res)
      setPosts(res.data.posts || []) 
    } catch (err) {
      console.error("Failed to fetch posts", err)
    } finally {
      setLoading(false)
      console.log("All posts from finally: ", posts)
    }
  }

  useEffect(() => {
    fetchPosts()
  }, [])

  if (loading) 
    return <div>Loading feed...</div>

  return (
    <div className="space-y-4">
      {posts.map((post) => (
        <PostCard key={post._id} post={post} onPostDeleted={(deletedId) => 
          setPosts(prev => prev.filter((p) => p._id !== deletedId))} />
      ))}
    </div>
  )
}