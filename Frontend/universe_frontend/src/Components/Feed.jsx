import { useEffect, useState, useRef } from "react";
import PostCard from "@/components/PostCard";
import axios from "@/lib/axios";

export default function Feed(props) {
  const { posts, setPosts } = props;
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [cursor, setCursor] = useState({
    lastUpdatedAt: null,
    lastId: null,
  });
  const ref = useRef(null);
  const limit = 5;

  const fetchPosts = async () => {
    if (loading || !hasMore) return;
    setLoading(true);
    try {
      const res = await axios.get(
        `/posts?limit=${limit}&lastUpdatedAt=${
          cursor.lastUpdatedAt ? cursor.lastUpdatedAt : ""
        }&lastId=${cursor.lastId ? cursor.lastId : ""}`
      );
      setPosts((prev) => [...prev, ...res.data.posts]);
      setHasMore(res.data.pagination.hasMore);
      setCursor({
        lastUpdatedAt: res.data.pagination.nextCursor.lastUpdatedAt,
        lastId: res.data.pagination.nextCursor.lastId,
      });
    } catch (err) {
      console.error("Failed to fetch posts", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!ref.current) return;
    const observer = new IntersectionObserver((entries) => {
      const observedEntry = entries[0];
      if (observedEntry.isIntersecting && !loading && hasMore) {
        fetchPosts();
      }
    });

    if (ref.current) observer.observe(ref.current);

    return () => {
      if (ref.current) observer.unobserve(ref.current);
      observer.disconnect();
    };
  }, [cursor]);
  // You might think that using ref.current is a good way! But, no! It is not reactive state
  // unlike useState and react doesn't keep track of it hence not executed when it changes.

  return (
    <div className="space-y-4">
      {console.log("allPosts: ", posts)}
      {Array.isArray(posts) && posts?.map((post) => (
        <PostCard
          key={post._id}
          post={post}
          onPostDeleted={(deletedId) =>
            setPosts((prev) => prev.filter((p) => p._id !== deletedId))
          }
        />
      ))}
      {/* This initialises observer.current with this div */}
      <div ref={ref} className="text-center py-4">
            {loading && (
              <p className="text-muted-foreground text-sm">
                Loading more posts...
              </p>
            )}
            {!hasMore && posts.length > 0 && (
              <p className="text-muted-foreground text-xs">No more posts.</p>
            )}
          </div>
    </div>
  );
}
