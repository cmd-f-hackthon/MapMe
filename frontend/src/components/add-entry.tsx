"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { DatePickerDemo } from "./date-picker";
import { Input } from "./ui/input";
import { MoodPicker } from "./mood-picker";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

export function AddEntry() {
  const [date, setDate] = useState<Date | undefined>();
  const [location, setLocation] = useState<string>("");
  const [file, setFile] = useState<File | null>(null);
  const [mood, setMood] = useState<string | null>(null);
  const [notes, setNotes] = useState<string>("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Create a FormData object to send the data
    const formData = new FormData();
    if (date) formData.append("date", date.toISOString());
    formData.append("location", location);
    if (file) formData.append("file", file);
    if (mood) formData.append("mood", mood);
    formData.append("notes", notes);

    try {
      // Send the data to the backend
      const response = await fetch("/api/add-memory", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to submit memory");
      }

      const result = await response.json();
      console.log("Memory added successfully:", result);

      // Reset the form
      setDate(undefined);
      setLocation("");
      setFile(null);
      setMood(null);
      setNotes("");
    } catch (error) {
      console.error("Error submitting memory:", error);
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button style={{ backgroundColor: "#9adb75" }} variant="outline">
          Add Memory
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add Memory</DialogTitle>
          <DialogDescription>
            Track today's memory here. Click save when you're done.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">Date</Label>
              <DatePickerDemo date={date} onDateChange={setDate} />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="location-input" className="text-right">
                Location
              </Label>
              <Input
                id="location-input"
                type="text"
                className="col-span-3"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="file-upload" className="text-left">
                Upload Photo
              </Label>
              <Input
                id="file-upload"
                type="file"
                className="col-span-3"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">Mood</Label>
              <MoodPicker
                className="col-span-3"
                selectedMood={mood}
                onMoodChange={setMood}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="notes-box" className="text-right">
                Notes
              </Label>
              <Textarea
                id="notes-box"
                defaultValue="Write about your day here!"
                className="col-span-3"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" className="border">
              Save Memory
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}