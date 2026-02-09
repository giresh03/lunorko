import { useState, useEffect } from "react";
import { CalendarDays, Clock, Check, ExternalLink } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { format, isToday, isTomorrow } from "date-fns";
import type { Mentor } from "@/pages/Mentors";

interface Slot {
  id: string;
  slot_date: string;
  start_time: string;
  end_time: string;
  is_booked: boolean;
}

interface BookingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mentor: Mentor;
}

const BookingDialog = ({ open, onOpenChange, mentor }: BookingDialogProps) => {
  const [slots, setSlots] = useState<Slot[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);
  const [notes, setNotes] = useState("");
  const [booking, setBooking] = useState(false);
  const [booked, setBooked] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (!open) return;
    setSelectedSlot(null);
    setNotes("");
    setBooked(false);

    const fetchSlots = async () => {
      setLoading(true);
      const { data } = await supabase
        .from("mentor_slots")
        .select("*")
        .eq("mentor_id", mentor.id)
        .eq("is_booked", false)
        .gte("slot_date", new Date().toISOString().split("T")[0])
        .order("slot_date")
        .order("start_time");
      setSlots((data as Slot[]) ?? []);
      setLoading(false);
    };
    fetchSlots();
  }, [open, mentor.id]);

  const handleBook = async () => {
    if (!user || !selectedSlot) {
      toast({ title: "Please sign in", description: "You need to sign in to book a slot.", variant: "destructive" });
      return;
    }

    setBooking(true);

    // Mark slot as booked
    const { error: slotError } = await supabase
      .from("mentor_slots")
      .update({ is_booked: true })
      .eq("id", selectedSlot.id);

    if (slotError) {
      toast({ title: "Booking failed", description: "This slot may already be taken. Please try another.", variant: "destructive" });
      setBooking(false);
      return;
    }

    // Create booking
    const { error: bookingError } = await supabase.from("bookings").insert({
      student_id: user.id,
      mentor_id: mentor.id,
      slot_id: selectedSlot.id,
      domain_id: mentor.domain_id,
      meeting_link: mentor.meeting_link,
      notes: notes.trim() || null,
    });

    if (bookingError) {
      // Revert slot
      await supabase.from("mentor_slots").update({ is_booked: false }).eq("id", selectedSlot.id);
      toast({ title: "Booking failed", description: bookingError.message, variant: "destructive" });
      setBooking(false);
      return;
    }

    setBooked(true);
    setBooking(false);
    toast({ title: "Booking confirmed!", description: `Your session with ${mentor.name} is booked.` });
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr + "T00:00:00");
    if (isToday(d)) return "Today";
    if (isTomorrow(d)) return "Tomorrow";
    return format(d, "EEE, MMM d");
  };

  const formatTime = (t: string) => {
    const [h, m] = t.split(":");
    const hour = parseInt(h);
    const ampm = hour >= 12 ? "PM" : "AM";
    return `${hour > 12 ? hour - 12 : hour}:${m} ${ampm}`;
  };

  // Group slots by date
  const grouped = slots.reduce<Record<string, Slot[]>>((acc, s) => {
    (acc[s.slot_date] ??= []).push(s);
    return acc;
  }, {});

  if (booked) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md">
          <div className="flex flex-col items-center py-6 text-center">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
              <Check className="h-7 w-7 text-primary" />
            </div>
            <h3 className="text-lg font-semibold text-foreground">Booking Confirmed!</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Your session with <span className="font-medium text-foreground">{mentor.name}</span> is scheduled for{" "}
              <span className="font-medium text-foreground">
                {selectedSlot && `${formatDate(selectedSlot.slot_date)} at ${formatTime(selectedSlot.start_time)}`}
              </span>
            </p>
            {mentor.meeting_link && (
              <Button className="mt-4" asChild>
                <a href={mentor.meeting_link} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Join Meeting
                </a>
              </Button>
            )}
            <Button variant="outline" className="mt-2" onClick={() => onOpenChange(false)}>
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Book a Session with {mentor.name}</DialogTitle>
          <DialogDescription>
            {mentor.role} at {mentor.company} · Select an available time slot
          </DialogDescription>
        </DialogHeader>

        {!user && (
          <div className="rounded-md border border-border bg-secondary/50 p-3 text-center text-sm text-muted-foreground">
            Please <a href="/auth" className="text-primary hover:underline">sign in</a> to book a session
          </div>
        )}

        {loading ? (
          <div className="py-8 text-center text-sm text-muted-foreground">Loading available slots…</div>
        ) : Object.keys(grouped).length === 0 ? (
          <div className="py-8 text-center text-sm text-muted-foreground">No available slots right now. Check back later!</div>
        ) : (
          <div className="space-y-4">
            {Object.entries(grouped).map(([date, dateSlots]) => (
              <div key={date}>
                <div className="mb-2 flex items-center gap-2">
                  <CalendarDays className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium text-foreground">{formatDate(date)}</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {dateSlots.map((slot) => (
                    <button
                      key={slot.id}
                      onClick={() => setSelectedSlot(slot)}
                      disabled={!user}
                      className={`flex items-center gap-1.5 rounded-md border px-3 py-2 text-xs font-medium transition-colors ${
                        selectedSlot?.id === slot.id
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border bg-card text-foreground hover:border-primary/30"
                      } disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                      <Clock className="h-3 w-3" />
                      {formatTime(slot.start_time)} – {formatTime(slot.end_time)}
                    </button>
                  ))}
                </div>
              </div>
            ))}

            {selectedSlot && (
              <div className="space-y-3 border-t border-border pt-4">
                <Textarea
                  placeholder="Add a note for the mentor (optional) — e.g., topics you'd like to discuss"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="min-h-[80px]"
                  maxLength={500}
                />
                <Button className="w-full" onClick={handleBook} disabled={booking}>
                  {booking ? "Booking…" : `Confirm Booking — ${formatDate(selectedSlot.slot_date)} at ${formatTime(selectedSlot.start_time)}`}
                </Button>
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default BookingDialog;
