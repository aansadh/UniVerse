import { useState } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { format } from "date-fns";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { CalendarIcon } from "lucide-react";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { toast } from "sonner";
import axios from "@/lib/axios";

const states = [
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chhattisgarh",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
  "Delhi",
  "Jammu and Kashmir",
  "Ladakh",
  "Puducherry",
  "Chandigarh",
  "Andaman and Nicobar Islands",
  "Dadra and Nagar Haveli and Daman and Diu",
  "Lakshadweep",
];

export default function CreateEventForm() {
  const [form, setForm] = useState({
    title: null,
    description: null,
    hostedBy: null,
    redirectLink: null,
    time: null,
    mode: "offline",
    media: null,
    location: {
      houseNumber: null,
      street: null,
      locality: null,
      landmark: null,
      city: null,
      district: null,
      state: null,
      pincode: null,
    },
    maxParticipants: null,
    tags: null,
  });
  const [date, setDate] = useState(new Date());
  const [media, setMedia] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name in form.location) {
      setForm((prev) => ({
        ...prev,
        location: {
          ...prev.location,
          [name]: value,
        },
      }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // upload media
    const formData = new FormData();
    formData.append("time", date);
    Object.keys(form).forEach((item) => {
      if (form[item]) {
        if (item.startsWith("location")) {
          formData.append(item, JSON.stringify(form[item]));
        } else {
          formData.append(item, form[item]);
        }
      }
    });
    if (media) {
      formData.append("media", media);
    } else {
      toast.error("Banner must be provided!");
      return null;
    }
    console.log(media);
    console.log("Final form data before submitting: ", formData);
    for (let pair of formData.entries()) {
      console.log(`${pair[0]}:`, pair[1]);
    }

    try {
      await axios.post("/events", formData);
      toast.success("Event created successfully!");
    } catch (err) {
      console.error(err);
      toast.error("Failed to create event.");
    }
  };

  function handleMediaChange(event) {
    const file = event.target.files[0];
    console.log("file from handleMediachange: ", file);
    if (!file) return null;
    setMedia(file);
  }

  return (
    <Card className="w-full max-w-4xl mx-auto mt-10 p-8 rounded-2xl shadow-xl border space-y-6">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-center">
          Create New Event
        </CardTitle>
      </CardHeader>

      <form onSubmit={handleSubmit} className="space-y-6">
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label>Title</Label>
            <Input
              name="title"
              value={form.title}
              onChange={handleChange}
              required
            />
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label>Description</Label>
            <Textarea
              name="description"
              value={form.description}
              onChange={handleChange}
            />
          </div>

          <div className="space-y-2">
            <Label>Hosted By</Label>
            <Input
              name="hostedBy"
              value={form.hostedBy}
              onChange={handleChange}
              required
            />
          </div>

          <div className="space-y-2">
            <Label>Redirect Link</Label>
            <Input
              name="redirectLink"
              type="url"
              value={form.redirectLink}
              onChange={handleChange}
              required
            />
          </div>

          <div className="space-y-2">
            <Label>Event Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start text-left font-normal"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, "PPP") : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-2">
            <div className="grid w-full max-w-sm items-center gap-1.5">
              <label htmlFor="media" className="text-sm font-medium">
                Banner Image
              </label>
              <Input
                id="media"
                type="file"
                accept="image/*"
                onChange={handleMediaChange}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Mode</Label>
            <Select
              value={form.mode}
              onValueChange={(value) =>
                setForm((prev) => ({ ...prev, mode: value }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select mode" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="offline">Offline</SelectItem>
                <SelectItem value="online">Online</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {form.mode === "offline" && (
            <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                ["House No.", "houseNumber"],
                ["Street", "street"],
                ["Locality", "locality"],
                ["Landmark", "landmark"],
                ["City", "city"],
                ["District", "district"],
                ["Pincode", "pincode"],
              ].map(([label, name], index) => (
                <div className="space-y-2" key={index}>
                  <Label>{label}</Label>
                  <Input
                    name={name}
                    value={form.location[name]}
                    onChange={handleChange}
                    required={
                      name === "city" ||
                      name === "locality" ||
                      name === "pincode"
                    }
                  />
                </div>
              ))}
              <div className="space-y-2 sm:col-span-2">
                <Label>State</Label>
                <Select
                  value={form.location.state}
                  onValueChange={(val) =>
                    setForm((prev) => ({
                      ...prev,
                      location: { ...prev.location, state: val },
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select state" />
                  </SelectTrigger>
                  <SelectContent>
                    {states.map((state) => (
                      <SelectItem key={state} value={state}>
                        {state}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label>Max Participants</Label>
            <Input
              name="maxParticipants"
              type="number"
              value={form.maxParticipants}
              onChange={handleChange}
              required
            />
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label>Tags (comma-separated)</Label>
            <Input name="tags" value={form.tags} onChange={handleChange} />
          </div>
        </CardContent>

        <CardFooter>
          <Button type="submit" className="w-full text-lg">
            Create Event
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
