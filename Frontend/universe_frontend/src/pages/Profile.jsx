import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "@/lib/axios";
import { useAuth } from "@/hooks/useAuth";
import PostCard from "@/components/PostCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Feed from "@/Components/Feed";

export default function Profile() {
  let { id } = useParams();
  const { user } = useAuth();

  if (!id) id = user._id;

  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const isCurrentUser = user?._id === id;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [userRes] = await Promise.all([
          axios.get(`/users/profile/${id}`),
          // axios.get(`/posts/search?uploader=${id}`),
        ]);
        setProfile(userRes.data.payload);
        // setPosts(postsRes.data.payload);
      } catch (err) {
        console.error("Error fetching profile or posts", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  if (loading) {
    return (
      <Skeleton className="w-full max-w-5xl h-48 mx-auto my-10 rounded-xl" />
    );
  }

  return (
    <div className="w-full  min-h-screen px-2 sm:px-4 md:px-6 py-8">
      <div className="space-y-6 px-2 sm:px-4">
        <Card className="flex flex-col md:flex-row items-center md:items-between md:justify-items-stretch gap-6 p-6 rounded-2xl shadow-sm border bg-background transition-all">
          <Avatar className="w-24 h-24">
            <AvatarImage src={profile.profilePic} />
            <AvatarFallback>
              {profile.firstName?.[0]?.toUpperCase()}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 space-y-2 text-center md:text-left">
            <h1 className="text-2xl font-bold capitalize">
              {profile.firstName}
            </h1>
            <p className="text-muted-foreground">
              {profile.bio || "No bio yet"}
            </p>
            <p className="text-xs text-muted-foreground">
              Joined on{" "}
              {new Date(profile.createdAt).toLocaleDateString("en-IN", {
                year: "numeric",
                month: "short",
                day: "numeric",
              })}
            </p>
          </div>

          {/* path is to be set here */}

          {isCurrentUser && (
            <Button
              variant="outline"
              className="mt-4 md:mt-0"
              onClick={() => navigate("/settings")}
            >
              Edit Profile
            </Button>
          )}
        </Card>

        {/* User's Posts */}
        {/* {console.log("These are the posts: ", posts)} */}
        <div className="space-y-4">
          {/* {posts?.length > 0 ? (
            posts.map((post) => <PostCard key={post._id} post={post} onPostDeleted={(deletedId) => 
              setPosts(prev => prev.filter((p) => p._id !== deletedId))} />)
          ) : (
            <p className="text-center text-muted-foreground text-sm">
              {isCurrentUser
                ? "You haven't posted anything yet."
                : "No posts from this user yet."}
            </p>
          )} */}
          <Feed uploader={id} posts={posts} setPosts={setPosts} />
        </div>
      </div>
    </div>
  );
}
