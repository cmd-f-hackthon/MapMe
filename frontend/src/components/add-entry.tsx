import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { DatePickerDemo } from "./date-picker"
import { Input } from "./ui/input"
import { MoodPicker } from "./mood-picker"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"

export function AddEntry() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">Add Memory</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add Memory</DialogTitle>
          <DialogDescription>
            Track today's memory here. Click save when you're done.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right">
              Date
            </Label>
            <DatePickerDemo/>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="location-input" className="text-right">
              Location
            </Label>
            <Input
              id="location-input"
              type="text"
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="notes-box" className="text-left">
              Upload Photo
            </Label>
            <Input
              id="file-upload"
              type="file"
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right">
              Mood
            </Label>
            <MoodPicker
              className="col-span-3"
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
            />
          </div>
        </div>
        <DialogFooter>
          <Button type="submit" className="border">
            Save Memory
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
