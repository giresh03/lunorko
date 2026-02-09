import { useState } from "react";
import { Briefcase, Clock, ExternalLink, CalendarDays, User2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { domains } from "@/lib/domains";
import BookingDialog from "./BookingDialog";
import type { Mentor } from "@/pages/Mentors";

const MentorCard = ({ mentor }: { mentor: Mentor }) => {
  const [showBooking, setShowBooking] = useState(false);
  const domain = domains.find((d) => d.id === mentor.domain_id);

  return (
    <>
      <div className="flex flex-col rounded-lg border border-border bg-card p-5 transition-colors hover:border-primary/30">
        <div className="flex items-start gap-3 mb-3">
          <div
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-lg font-bold"
            style={{
              backgroundColor: domain ? `hsl(${domain.color} / 0.15)` : undefined,
              color: domain ? `hsl(${domain.color})` : undefined,
            }}
          >
            {mentor.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
          </div>
          <div className="min-w-0">
            <h3 className="font-semibold text-foreground truncate">{mentor.name}</h3>
            <p className="text-xs text-muted-foreground truncate">{mentor.role}</p>
          </div>
        </div>

        <div className="space-y-2 mb-4 flex-1">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Briefcase className="h-3.5 w-3.5 shrink-0" />
            <span>{mentor.company}</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Clock className="h-3.5 w-3.5 shrink-0" />
            <span>{mentor.years_experience} years experience</span>
          </div>
          {domain && (
            <div className="flex items-center gap-2 text-xs">
              <User2 className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
              <span
                className="rounded-sm px-1.5 py-0.5 text-[10px] font-medium"
                style={{
                  backgroundColor: `hsl(${domain.color} / 0.15)`,
                  color: `hsl(${domain.color})`,
                }}
              >
                {domain.name}
              </span>
            </div>
          )}
        </div>

        {mentor.bio && (
          <p className="mb-4 text-xs text-muted-foreground line-clamp-2">{mentor.bio}</p>
        )}

        <div className="flex gap-2 mt-auto">
          <Button size="sm" className="flex-1 text-xs" onClick={() => setShowBooking(true)}>
            <CalendarDays className="mr-1.5 h-3.5 w-3.5" />
            Book Slot
          </Button>
          {mentor.meeting_link && (
            <Button size="sm" variant="outline" className="text-xs" asChild>
              <a href={mentor.meeting_link} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            </Button>
          )}
        </div>
      </div>

      <BookingDialog
        open={showBooking}
        onOpenChange={setShowBooking}
        mentor={mentor}
      />
    </>
  );
};

export default MentorCard;
