import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import axios from "@/lib/axios";
import { useAuth } from "@/hooks/useAuth";
import PostCard from "@/components/PostCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FriendActionButton } from "@/Components/FriendActionButton";

export default function Profile() {
  let { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const isCurrentUser = user?._id === id || !id;

  if (!id) id = user._id;

  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loadingProfile, setLoadingProfile] = useState(true);

  // Pagination-specific state
  const [loadingPosts, setLoadingPosts] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [cursor, setCursor] = useState({
    lastId: null,
    lastUpdatedAt: null,
  });

  const [friends, setFriends] = useState([]);
  const [loadingFriends, setLoadingFriends] = useState(false);

  const limit = 4;
  const ref = useRef(null);

  // Fetch profile on mount
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await axios.get(`/users/profile/${id}`);
        setProfile(res.data.payload);
      } catch (err) {
        console.error("Error fetching profile:", err);
      } finally {
        setLoadingProfile(false);
      }
    };

    fetchProfile();
  }, [id]);

  // Fetch paginated posts
  const fetchPosts = async () => {
    if (loadingPosts || !hasMore) return;
    setLoadingPosts(true);
    try {
      console.log(
        "Making request: ",
        `/posts/search?uploader=${id}&limit=${limit}&lastUpdatedAt=${
          cursor.lastUpdatedAt || ""
        }&lastId=${cursor.lastId || ""}`
      );
      const res = await axios.get(
        `/posts/search?uploader=${id}&limit=${limit}&lastUpdatedAt=${
          cursor.lastUpdatedAt || ""
        }&lastId=${cursor.lastId || ""}`
      );

      console.log("These are the posts from profile: ", res);

      const newPosts = res.data.posts;
      setPosts((prev) => [...prev, ...newPosts]);
      setHasMore(res.data.pagination.hasMore);
      setCursor({
        lastUpdatedAt: res.data.pagination.nextCursor?.lastUpdatedAt,
        lastId: res.data.pagination.nextCursor?.lastId,
      });
    } catch (err) {
      console.error("Error fetching posts:", err);
    } finally {
      setLoadingPosts(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  useEffect(() => {
    if (!ref.current) return;
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && !loadingPosts && hasMore) {
        fetchPosts();
      }
    });

    if (ref.current) observer.observe(ref.current);
    return () => {
      if (ref.current) observer.unobserve(ref.current);
      observer.disconnect();
    };
  }, [cursor]);

  if (loadingProfile) {
    return (
      <Skeleton className="w-full max-w-5xl h-48 mx-auto my-10 rounded-xl" />
    );
  }

  const fetchFriends = async () => {
    setLoadingFriends(true);
    try {
      const res = await axios.get(`/friends/${id}`);
      setFriends(res.data.payload);
    } catch (err) {
      console.error("Error fetching friends:", err);
      setFriends([]);
    } finally {
      setLoadingFriends(false);
    }
  };

  return (
    <div className="w-full min-h-screen px-2 sm:px-4 md:px-6 py-8">
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

          {isCurrentUser ? (
            <Button
              variant="outline"
              className="mt-4 md:mt-0"
              onClick={() => navigate("/settings")}
            >
              Edit Profile
            </Button>
          ) : (
            <FriendActionButton otherUserId={profile._id} />
          )}
        </Card>

        {/* Posts Section */}
        <div className="space-y-4">
          <Tabs defaultValue="posts" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-4">
              <TabsTrigger value="posts">Posts</TabsTrigger>
              <TabsTrigger value="friends" onClick={fetchFriends}>
                Friends
              </TabsTrigger>
            </TabsList>

            <TabsContent value="posts">
              {/* Posts Section — Existing Code */}
              <div className="space-y-4">
                {posts.length > 0 ? (
                  posts.map((post) => (
                    <PostCard
                      key={post._id}
                      post={post}
                      onPostDeleted={(deletedId) =>
                        setPosts((prev) =>
                          prev.filter((p) => p._id !== deletedId)
                        )
                      }
                    />
                  ))
                ) : (
                  <p className="text-center text-muted-foreground text-sm">
                    {isCurrentUser
                      ? "You haven't posted anything yet."
                      : "No posts from this user yet."}
                  </p>
                )}
                <div ref={ref} className="text-center py-4">
                  {loadingPosts && (
                    <p className="text-muted-foreground text-sm">
                      Loading more posts...
                    </p>
                  )}
                  {!hasMore && posts.length > 0 && (
                    <p className="text-muted-foreground text-xs">
                      No more posts.
                    </p>
                  )}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="friends">
                  {console.log("These are the friends: ", friends)}              
              {loadingFriends ? (
                <p className="text-muted-foreground text-sm">
                  Loading friends...
                </p>
              ) : friends.length === 0 ? (
                <p className="text-center text-muted-foreground text-sm">
                  No friends found.
                </p>
              ) : (
                <div className="flex flex-col divide-y border-y">
                  {friends.map((f) => {
                    console.log("Traversing: ", f)
                    const otherUser =
                      f.requester._id === id ? f.recipient : f.requester;
                    return (
                      <div
                        key={otherUser._id}
                        className="flex items-center justify-between px-3 py-4 hover:bg-muted transition-colors"
                      >
                        <Link
                          to={`/profile/${otherUser._id}`}
                          className="flex items-center gap-4"
                        >
                          <Avatar className="w-10 h-10">
                            <AvatarImage src={otherUser.profilePic} />
                            <AvatarFallback>
                              {otherUser.firstName[0]}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium capitalize">
                              {otherUser.firstName}
                            </p>
                            <p className="text-muted-foreground text-sm">
                              {otherUser.bio || "No bio"}
                            </p>
                          </div>
                        </Link>

                        <FriendActionButton
                          otherUserId={otherUser._id}
                          pstatus={f.status}
                          pisRequester={f.requester._id === user._id}
                          onUnFriend={(otherUserId) => { setFriends(prev => prev.filter((f) => f.requester._id != otherUserId && f.recipient._id != otherUserId))}}
                        />
                      </div>
                    );
                  })}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
