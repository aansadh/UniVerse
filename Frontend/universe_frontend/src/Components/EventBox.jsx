import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import axios from "axios";

export default function EventsPage() {
  const [events, setEvents] = useState([]);

  async function fetchEvents() {
    try {
      const response = await axios.get("http://localhost:5000/events", {
        withCredentials: true,
      });
      setEvents(response.data.payload);
      console.log(response);
    } catch (err) {
      console.error(err);
    }
  }

  useEffect(() => {
    fetchEvents();
  }, []);

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <section className="text-center py-20 px-6 bg-gradient-to-r from-blue-100 via-white to-purple-100 rounded-xl shadow-sm">
        <h1 className="text-4xl sm:text-5xl font-bold mb-4 text-gray-800">
          Discover and Join Exciting Campus Events
        </h1>
        <p className="text-lg text-gray-600 mb-6 max-w-2xl mx-auto">
          From hackathons to tech talks—explore what's happening around you and
          be part of something awesome.
        </p>
        <Link to="/events/create">
          <Button className="w-auto sm:w-auto">+ Create Event</Button>
        </Link>
      </section>

      <div className="grid sm:grid-cols-2 gap-4">
        {events.map((event) => (
          <Card
            key={event.id}
            className="hover:shadow-lg transition flex flex-col overflow-hidden"
          >
            {event.media && (
              <img
                src={event.media}
                alt={event.title}
                className="h-48 w-full object-cover"
              />
            )}

            <div className="flex flex-col flex-grow">
              <CardHeader>
                <CardTitle>{event.title}</CardTitle>
                <p className="text-sm text-muted-foreground">
                  By {event.hostedBy} • {event.mode.toUpperCase()}
                </p>
              </CardHeader>

              <CardContent className="flex-grow">
                <p className="mb-2">{event.description}</p>
                <p className="text-sm text-muted-foreground mb-1">
                  Time: {event.time}
                </p>
                {event.location?.city && (
                  <p className="text-sm text-muted-foreground">
                    Location: {event.location.city}, {event.location.state} -{" "}
                    {event.location.pincode}
                  </p>
                )}
              </CardContent>

              <CardFooter>
                <div className="mt-2 flex justify-between items-center w-full">
                  <div className="flex gap-1 flex-wrap text-xs text-blue-600 font-medium">
                    {Array.isArray(event?.tags) &&
                      event.tags.map((tag, id) =>
                        tag ? (
                          <span
                            key={id}
                            className="bg-blue-100 px-2 py-0.5 rounded"
                          >
                            #{tag}
                          </span>
                        ) : null
                      )}
                  </div>
                  <a
                    href={event.redirectLink}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Button size="sm">Register</Button>
                  </a>
                </div>
              </CardFooter>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
