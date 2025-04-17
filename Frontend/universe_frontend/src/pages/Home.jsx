import Feed from "@/components/Feed"
// import EventsBox from "@/components/EventsBox"
import CreatePostBox from '@/components/CreatePostBox'
import { useState } from "react"

export default function Home() {
  let [posts, setPosts ] = useState([])

  const onPostCreated = async (newPost) => {
    setPosts([...posts, newPost])
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-12 gap-4 p-4">
      <div className="md:col-span-8">
        <CreatePostBox onPostCreated={onPostCreated} />
        <Feed posts={posts} setPosts={setPosts}/>
      </div>
      {/* <div className="md:col-span-4 hidden md:block">
        <EventsBox />
      </div> */}
    </div>
  )
}