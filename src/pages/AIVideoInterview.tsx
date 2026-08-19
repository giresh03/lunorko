import { useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { Video, Bot, ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import FeatureGate from "@/components/FeatureGate";
import LockGate from "@/components/LockGate";
import InterviewRoom from "@/components/interview/InterviewRoom";
import { useAuth } from "@/hooks/useAuth";
import { domains } from "@/lib/domains";

const AIVideoInterview = () => {
  const { user, loading: authLoading } = useAuth();
  const [selectedDomain, setSelectedDomain] = useState<string | null>(null);
  const [inInterview, setInInterview] = useState(false);

  if (!authLoading && !user) return <Navigate to="/auth" replace />;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <LockGate lockKey="ai_interview" name="AI Video Interview"><FeatureGate feature="interview-prep" featureName="AI Video Interview" requiredPlan="premium">
        <main className="container mx-auto px-4 pt-24 pb-20">
          {!inInterview ? (
            <>
              <div className="mb-8">
                <div className="flex items-center gap-3 mb-2">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                    <Video className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold text-foreground">AI Video Interview</h1>
                    <p className="text-muted-foreground">
                      Practice job interviews with a virtual AI robot. Machine learning evaluates your answers in real time.
                    </p>
                  </div>
                </div>
              </div>

              <div className="mb-6">
                <h2 className="text-lg font-semibold mb-3">Choose a domain</h2>
                <p className="text-sm text-muted-foreground mb-4">
                  The AI interviewer will ask domain-specific technical questions and provide feedback.
                </p>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {domains.map((d) => {
                    const Icon = d.icon;
                    const isSelected = selectedDomain === d.id;
                    return (
                      <Card
                        key={d.id}
                        className={`cursor-pointer transition-all hover:border-primary/50 ${
                          isSelected ? "border-primary ring-2 ring-primary/20" : ""
                        }`}
                        onClick={() => setSelectedDomain(d.id)}
                      >
                        <CardHeader className="pb-2">
                          <div className="flex items-center gap-3">
                            <div
                              className="flex h-10 w-10 items-center justify-center rounded-lg"
                              style={{ backgroundColor: `hsl(${d.color} / 0.2)` }}
                            >
                              <Icon className="h-5 w-5" style={{ color: `hsl(${d.color})` }} />
                            </div>
                            <CardTitle className="text-base">{d.name}</CardTitle>
                          </div>
                          <CardDescription className="line-clamp-2">{d.description}</CardDescription>
                        </CardHeader>
                      </Card>
                    );
                  })}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  size="lg"
                  disabled={!selectedDomain}
                  onClick={() => setInInterview(true)}
                  className="shadow-lg shadow-primary/20"
                >
                  <Bot className="mr-2 h-5 w-5" />
                  Start Video Interview
                </Button>
                <Button variant="outline" size="lg" asChild>
                  <Link to="/dashboard">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Dashboard
                  </Link>
                </Button>
              </div>

              <div className="mt-12 rounded-xl border border-border bg-muted/30 p-6">
                <h3 className="font-semibold mb-2">How it works</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• A virtual AI robot conducts the interview via video call</li>
                  <li>• Your camera records your responses; the AI asks questions and speaks them aloud</li>
                  <li>• Machine learning evaluates each answer and gives real-time feedback</li>
                  <li>• Get a summary and improvement tips at the end</li>
                </ul>
              </div>
            </>
          ) : (
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <Button variant="ghost" size="sm" onClick={() => setInInterview(false)}>
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Exit
                </Button>
                <span className="text-muted-foreground">
                  Interview in progress — {domains.find((d) => d.id === selectedDomain)?.name}
                </span>
              </div>
              {selectedDomain && (
                <InterviewRoom domainId={selectedDomain} onEnd={() => setInInterview(false)} />
              )}
            </div>
          )}
        </main>
      </FeatureGate></LockGate>
      <Footer />
    </div>
  );
};

export default AIVideoInterview;
