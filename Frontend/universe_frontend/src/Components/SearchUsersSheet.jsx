"use client";

import { useState } from "react";
import axios from "@/lib/axios";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

export function SearchUsersSheet(props) {
  const { openSearch, setopenSearch } = props;
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

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

      const response = await axios.get("/users/search", {
        params,
      });

      setResults(response.data.payload);
    } catch (err) {
      setError(err?.response?.data?.message || "Search failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Sheet openSearch={openSearch} onopenSearchChange={setopenSearch} modal={true}>
      <SheetTrigger asChild>
        <Button variant="outline">Search</Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[300px]">
        <div className="space-y-4 mt-4">
          <h2 className="text-lg font-semibold">Search Users</h2>
          <Input
            placeholder="Enter name..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          />
          <Button onClick={handleSearch} disabled={loading}>
            {loading ? "Searching..." : "Search"}
          </Button>

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <ScrollArea className="h-64 border p-2 rounded">
            {results.map((user) => (
              <div
                key={user._id}
                className="flex items-center gap-2 p-2 hover:bg-muted rounded"
              >
                <img
                  src={user.profilePic}
                  alt={`${user.firstName} ${user.lastName}`}
                  className="w-8 h-8 rounded-full object-cover"
                />
                <span>
                  {user.firstName} {user.lastName}
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
