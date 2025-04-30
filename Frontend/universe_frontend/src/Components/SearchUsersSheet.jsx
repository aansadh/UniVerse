"use client";

import { useState } from "react";
import axios from "@/lib/axios";
import { Sheet, SheetContent, SheetTrigger, SheetClose } from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useNavigate } from "react-router-dom";
import { Search } from "lucide-react";

export function SearchUsersSheet(props) {
  const { openSearch, setOpenSearch } = props;
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSearch = async () => {
    setLoading(true);
    setError("");
    setResults([]);

    try {
      const trimmed = query.trim().split(/\s+/);
      const params = {};

      if (trimmed.length === 1) {
        params.firstName = trimmed[0];
      } else if (trimmed.length >= 2) {
        params.firstName = trimmed[0];
        params.lastName = trimmed.slice(1).join(" ");
      }

      const response = await axios.get(`/users/search?firstName=${params.firstName || ''}&lastName=${params.lastName || ''}`);
      setResults(response.data.payload);
      console.log("The response to searchUserSheet: ", response)
    } catch (err) {
      setError(err?.response?.data?.message || "Search failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Sheet open={openSearch} onOpenChange={setOpenSearch}>

      <SheetContent side="right" className="w-[300px] p-4 pt-12">
        <div className="space-y-4">
          {/* Search Input */}
          <div className="relative">
            <Input
              placeholder="Search users..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              className="pr-10"
            />
            <Search
              className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground cursor-pointer"
              onClick={handleSearch}
            />
          </div>

          {error && <p className="text-red-500 text-sm">{error}</p>}

          {/* Results */}
          <ScrollArea className="h-64 border p-2 rounded space-y-2">
            {console.log("results from searchUsersSheet: ", results)}
            {!loading && Array.isArray(results) && results.length > 0 && results?.map((user) => (
                
              <div
                key={user._id}
                onClick={() => {
                  navigate(`/profile/${user?._id}`);
                  setOpenSearch(false);
                }}
                className="flex items-center gap-3 p-2 rounded cursor-pointer hover:bg-muted transition"
              >
                <img
                  src={user?.profilePic}
                  alt={`${user?.firstName} ${user?.lastName}`}
                  className="w-8 h-8 rounded-full object-cover"
                />
                <span className="text-sm">
                  {user?.firstName} {user?.lastName}
                </span>
              </div>
            ))}

            {!loading && results.length === 0 && (
              <p className="text-sm text-muted-foreground">No results yet.</p>
            )}
          </ScrollArea>
        </div>
      </SheetContent>
    </Sheet>
  );
}
