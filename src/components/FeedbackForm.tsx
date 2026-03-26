import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Star, Send, MessageCircleHeart } from "lucide-react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";

const FeedbackForm = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    rating: 5,
    message: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim() || !form.message.trim()) {
      toast({ title: "Please fill all fields", variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase.from("feedback" as any).insert({
        user_id: user?.id || null,
        name: form.name.trim(),
        email: form.email.trim(),
        rating: form.rating,
        message: form.message.trim(),
      } as any);
      if (error) throw error;
      toast({ title: "Thank you for your feedback! 🎉" });
      setForm({ name: "", email: "", rating: 5, message: "" });
      setOpen(false);
    } catch (err: any) {
      toast({ title: "Failed to submit", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <MessageCircleHeart className="h-4 w-4" /> Feedback
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageCircleHeart className="h-5 w-5 text-primary" /> Share Your Feedback
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div>
            <label className="text-sm font-medium text-foreground">Name</label>
            <Input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Your name"
              maxLength={100}
            />
          </div>
          <div>
            <label className="text-sm font-medium text-foreground">Email</label>
            <Input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="your@email.com"
              maxLength={255}
            />
          </div>
          <div>
            <label className="text-sm font-medium text-foreground block mb-2">Rating</label>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setForm({ ...form, rating: star })}
                  className="p-0.5 transition-transform hover:scale-110"
                >
                  <Star
                    className={`h-7 w-7 ${star <= form.rating ? "text-yellow-400 fill-yellow-400" : "text-muted-foreground"}`}
                  />
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-foreground">Message</label>
            <Textarea
              value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
              placeholder="Tell us what you think..."
              rows={4}
              maxLength={1000}
            />
          </div>
          <Button type="submit" className="w-full gap-2" disabled={loading}>
            <Send className="h-4 w-4" /> {loading ? "Submitting..." : "Submit Feedback"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default FeedbackForm;
