import { useState } from "react";
import { Briefcase, Clock, ExternalLink, CalendarDays, User2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { domains } from "@/lib/domains";
import BookingDialog from "./BookingDialog";
import type { Mentor } from "@/pages/Mentors";

const MentorCard = ({ mentor }: { mentor: Mentor }) => {
  const [showBooking, setShowBooking] = useState(false);
  const domain = domains.find((d) => d.id === mentor.domain_id);

  return (
    <>
      <div className="flex flex-col rounded-xl border border-border bg-card p-5 transition-all duration-300 hover:border-primary/30 hover:-translate-y-1 hover:shadow-lg group">
        {/* Avatar + Info */}
        <div className="flex items-start gap-4 mb-4">
          {mentor.avatar_url ? (
            <img
              src={mentor.avatar_url}
              alt={mentor.name}
              className="h-14 w-14 shrink-0 rounded-full object-cover border-2 border-border group-hover:border-primary/30 transition-colors"
            />
          ) : (
            <div
              className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full text-lg font-bold"
              style={{
                backgroundColor: domain ? `hsl(${domain.color} / 0.15)` : undefined,
                color: domain ? `hsl(${domain.color})` : undefined,
              }}
            >
              {mentor.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
            </div>
          )}
          <div className="min-w-0">
            <h3 className="font-semibold text-foreground truncate">{mentor.name}</h3>
            <p className="text-xs text-muted-foreground truncate">{mentor.role}</p>
            <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
              <Briefcase className="h-3 w-3 shrink-0" />
              <span className="font-medium">{mentor.company}</span>
            </div>
          </div>
        </div>

        {/* Meta */}
        <div className="flex flex-wrap gap-1.5 mb-3">
          <Badge variant="outline" className="text-[10px] border-border text-muted-foreground">
            <Clock className="mr-1 h-2.5 w-2.5" /> {mentor.years_experience}y exp
          </Badge>
          {domain && (
            <Badge
              variant="outline"
              className="text-[10px]"
              style={{
                borderColor: `hsl(${domain.color} / 0.3)`,
                backgroundColor: `hsl(${domain.color} / 0.1)`,
                color: `hsl(${domain.color})`,
              }}
            >
              {domain.name}
            </Badge>
          )}
        </div>

        {mentor.bio && (
          <p className="mb-4 text-xs text-muted-foreground line-clamp-2 flex-1">{mentor.bio}</p>
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
