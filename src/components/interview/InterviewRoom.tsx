import { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Video, VideoOff, Mic, MicOff, Send, Loader2, Bot, User, CheckCircle2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { domains } from "@/lib/domains";

interface InterviewRoomProps {
  domainId: string;
  onEnd: () => void;
}

interface QARecord {
  question: string;
  answer: string;
  score?: number;
  feedback?: string;
  strengths?: string[];
  improvements?: string[];
}

const invokeAI = async (action: string, body: Record<string, unknown>) => {
  const { data: sessionData } = await supabase.auth.getSession();
  const token = sessionData?.session?.access_token;
  if (!token) throw new Error("Not authenticated");

  const res = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-interview`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ action, ...body }),
  });
  const data = await res.json();
  if (data.error) throw new Error(data.error);
  return data;
};

// Speech-to-text: Web Speech API (Chrome, Safari, Edge)
const getSpeechRecognition = () => {
  if (typeof window === "undefined") return null;
  const w = window as unknown as { SpeechRecognition?: new () => any; webkitSpeechRecognition?: new () => any };
  return w.SpeechRecognition || w.webkitSpeechRecognition || null;
};

const AIAvatar = ({ isSpeaking }: { isSpeaking: boolean }) => (
  <div className="relative flex items-center justify-center">
    <div
      className={`relative flex h-32 w-32 items-center justify-center rounded-full border-4 border-primary/30 bg-gradient-to-br from-primary/20 to-primary/5 transition-all duration-300 ${
        isSpeaking ? "scale-105 ring-4 ring-primary/40" : ""
      }`}
    >
      <Bot className="h-16 w-16 text-primary" />
      <div className="absolute -bottom-1 -right-1 rounded-full bg-primary px-2 py-0.5 text-xs font-medium text-primary-foreground">
        AI
      </div>
    </div>
    {isSpeaking && (
      <div className="absolute inset-0 animate-ping rounded-full bg-primary/20" style={{ animationDuration: "1.5s" }} />
    )}
  </div>
);

export default function InterviewRoom({ domainId, onEnd }: InterviewRoomProps) {
  const { toast } = useToast();
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const recognitionRef = useRef<any>(null);
  const listeningBaseRef = useRef("");

  const [videoEnabled, setVideoEnabled] = useState(true);
  const [micEnabled, setMicEnabled] = useState(true);
  const [currentQuestion, setCurrentQuestion] = useState<string | null>(null);
  const [userAnswer, setUserAnswer] = useState("");
  const [loading, setLoading] = useState(false);
  const [evaluating, setEvaluating] = useState(false);
  const [history, setHistory] = useState<QARecord[]>([]);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [finished, setFinished] = useState(false);
  const [summary, setSummary] = useState<{ summary: string; overallScore: number; tips: string[] } | null>(null);

  const domain = domains.find((d) => d.id === domainId);
  const totalQuestions = 5;
  const speechSupported = !!getSpeechRecognition();

  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      streamRef.current = stream;
      if (videoRef.current) videoRef.current.srcObject = stream;
    } catch (e) {
      toast({ title: "Camera access", description: "Could not access camera/mic. You can still type answers.", variant: "destructive" });
    }
  }, [toast]);

  const stopCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  }, []);

  useEffect(() => {
    startCamera();
    return () => stopCamera();
  }, [startCamera, stopCamera]);

  useEffect(() => {
    if (!videoRef.current || !streamRef.current) return;
    videoRef.current.srcObject = videoEnabled ? streamRef.current : null;
  }, [videoEnabled]);

  const speakQuestion = useCallback((text: string) => {
    if (!("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.9;
    utterance.pitch = 1;
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    window.speechSynthesis.speak(utterance);
  }, []);

  const startListening = useCallback(() => {
    const SR = getSpeechRecognition();
    if (!SR || isListening || !currentQuestion) return;
    try {
      stopListening();
      listeningBaseRef.current = userAnswer.trim() ? userAnswer + " " : userAnswer;
      const recognition = new SR();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = "en-US";
      recognition.onresult = (e: SpeechRecognitionEvent) => {
        let transcript = "";
        for (let i = 0; i < e.results.length; i++) {
          transcript += e.results[i][0].transcript;
        }
        setUserAnswer(listeningBaseRef.current + transcript);
      };
      recognition.onerror = (e: SpeechRecognitionErrorEvent) => {
        if (e.error !== "aborted" && e.error !== "no-speech") {
          toast({ title: "Voice input", description: "Could not capture speech. Try typing instead.", variant: "destructive" });
        }
        setIsListening(false);
      };
      recognition.onend = () => setIsListening(false);
      recognition.start();
      recognitionRef.current = recognition;
      setIsListening(true);
    } catch (err) {
      toast({ title: "Voice input", description: "Not supported in this browser. Use Chrome or Safari.", variant: "destructive" });
    }
  }, [currentQuestion, isListening, userAnswer, toast]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {
        /* ignore */
      }
      recognitionRef.current = null;
    }
    setIsListening(false);
  }, []);

  useEffect(() => {
    return () => stopListening();
  }, [stopListening]);

  const loadNextQuestion = useCallback(async (overrideIndex?: number) => {
    const idx = overrideIndex ?? questionIndex;
    if (idx >= totalQuestions) {
      setFinished(true);
      setLoading(true);
      try {
        const sessionHistory = history.map((h) => ({ q: h.question, a: h.answer, score: h.score }));
        const data = await invokeAI("get-summary", {
          domain: domainId,
          sessionHistory,
        });
        setSummary(data);
      } catch (e) {
        toast({ title: "Error", description: (e as Error).message, variant: "destructive" });
        setSummary({ summary: "Interview completed.", overallScore: 70, tips: [] });
      }
      setLoading(false);
      return;
    }

    setLoading(true);
    stopListening();
    setCurrentQuestion(null);
    setUserAnswer("");
    try {
      const sessionHistory = history.map((h) => ({ q: h.question, a: h.answer }));
      const data = await invokeAI("generate-question", {
        domain: domainId,
        questionIndex: idx,
        sessionHistory,
      });
      setCurrentQuestion(data.question);
      speakQuestion(data.question);
    } catch (e) {
      toast({ title: "Error", description: (e as Error).message, variant: "destructive" });
      setCurrentQuestion("Tell me about your experience in this domain.");
    }
    setLoading(false);
  }, [domainId, questionIndex, history, toast, speakQuestion, stopListening]);

  const loadFirstQuestion = useCallback(() => {
    loadNextQuestion(0);
  }, [loadNextQuestion]);

  useEffect(() => {
    if (history.length === 0 && !currentQuestion && !loading) loadFirstQuestion();
  }, []);

  const handleSubmitAnswer = async () => {
    const answer = userAnswer.trim();
    if (!answer || !currentQuestion) return;

    stopListening();
    setEvaluating(true);
    try {
      const sessionHistory = history.map((h) => ({ q: h.question, a: h.answer }));
      const data = await invokeAI("evaluate-answer", {
        domain: domainId,
        question: currentQuestion,
        answer,
        sessionHistory,
      });

      setHistory((prev) => [
        ...prev,
        {
          question: currentQuestion,
          answer,
          score: data.score,
          feedback: data.feedback,
          strengths: data.strengths,
          improvements: data.improvements,
        },
      ]);

      toast({
        title: `Score: ${data.score}/100`,
        description: data.feedback,
      });

      const nextIdx = questionIndex + 1;
      setQuestionIndex(nextIdx);
      setCurrentQuestion(null);
      setUserAnswer("");
      loadNextQuestion(nextIdx);
    } catch (e) {
      toast({ title: "Error", description: (e as Error).message, variant: "destructive" });
    }
    setEvaluating(false);
  };

  if (finished) {
    return (
      <Card className="mx-auto max-w-2xl">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-500/20">
              <CheckCircle2 className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">Interview Complete</h2>
              <p className="text-muted-foreground">Your AI interview summary</p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : summary ? (
            <>
              <div>
                <p className="text-foreground">{summary.summary}</p>
                <div className="mt-4 flex items-center gap-2">
                  <Badge variant="secondary" className="text-lg px-3 py-1">
                    Overall: {summary.overallScore}/100
                  </Badge>
                </div>
              </div>
              {summary.tips.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-2">Improvement tips</h3>
                  <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                    {summary.tips.map((t, i) => (
                      <li key={i}>{t}</li>
                    ))}
                  </ul>
                </div>
              )}
            </>
          ) : null}
          <Button onClick={onEnd} className="w-full">
            Back to Interview Hub
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* AI Interviewer (left) */}
      <Card className="overflow-hidden">
        <CardHeader className="bg-muted/30 pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <AIAvatar isSpeaking={isSpeaking} />
              <div>
                <h3 className="font-semibold">AI Interview Robot</h3>
                <p className="text-sm text-muted-foreground">{domain?.name || domainId}</p>
              </div>
            </div>
            <Badge variant="outline">Q {questionIndex + 1}/{totalQuestions}</Badge>
          </div>
        </CardHeader>
        <CardContent className="min-h-[180px]">
          {loading ? (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span>Preparing next question...</span>
            </div>
          ) : currentQuestion ? (
            <div className="space-y-2">
              <p className="text-lg font-medium text-foreground">{currentQuestion}</p>
              <p className="text-sm text-muted-foreground">
                {speechSupported ? "Type or tap the mic to speak your answer (voice-to-text)." : "Type your answer below."}
              </p>
              <Button
                variant="ghost"
                size="sm"
                className="mt-1 -ml-2"
                onClick={() => speakQuestion(currentQuestion)}
              >
                🔊 Hear question again
              </Button>
            </div>
          ) : null}
        </CardContent>
      </Card>

      {/* User video + answer (right) */}
      <Card className="overflow-hidden">
        <CardHeader className="bg-muted/30 pb-4">
          <div className="flex items-center gap-3">
            <div className="relative flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <User className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold">You</h3>
              <p className="text-sm text-muted-foreground">Video call active</p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="relative aspect-video rounded-lg overflow-hidden bg-muted">
            {videoEnabled && streamRef.current ? (
              <video
                ref={videoRef}
                autoPlay
                muted
                playsInline
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full items-center justify-center">
                <VideoOff className="h-12 w-12 text-muted-foreground" />
              </div>
            )}
            <div className="absolute bottom-2 left-2 flex gap-2">
              <Button
                size="icon"
                variant="secondary"
                className="h-8 w-8"
                onClick={() => setVideoEnabled((v) => !v)}
              >
                {videoEnabled ? <Video className="h-4 w-4" /> : <VideoOff className="h-4 w-4" />}
              </Button>
              <Button
                size="icon"
                variant="secondary"
                className="h-8 w-8"
                onClick={() => setMicEnabled((m) => !m)}
              >
                {micEnabled ? <Mic className="h-4 w-4" /> : <MicOff className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          <div>
            <div className="relative">
              <Textarea
                placeholder={speechSupported ? "Type or tap the mic to speak your answer..." : "Type your answer here..."}
                value={userAnswer}
                onChange={(e) => setUserAnswer(e.target.value)}
                rows={4}
                className="resize-none pr-12"
                disabled={!currentQuestion || evaluating}
              />
              {speechSupported && currentQuestion && !evaluating && (
                <Button
                  type="button"
                  size="icon"
                  variant={isListening ? "default" : "outline"}
                  className={`absolute right-2 top-2 h-9 w-9 ${isListening ? "animate-pulse bg-primary" : ""}`}
                  onClick={() => (isListening ? stopListening() : startListening())}
                  title={isListening ? "Stop speaking" : "Speak your answer (voice-to-text)"}
                >
                  <Mic className="h-4 w-4" />
                </Button>
              )}
            </div>
            <Button
              className="mt-2 w-full"
              onClick={handleSubmitAnswer}
              disabled={!userAnswer.trim() || evaluating || !currentQuestion}
            >
              {evaluating ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Send className="mr-2 h-4 w-4" />
              )}
              Submit Answer
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* History */}
      {history.length > 0 && (
        <div className="lg:col-span-2">
          <h3 className="mb-2 font-semibold">Previous Q&A</h3>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {history.map((h, i) => (
              <div key={i} className="rounded-lg border border-border bg-card p-3 text-sm">
                <p className="font-medium text-foreground">Q: {h.question}</p>
                <p className="text-muted-foreground mt-1">A: {h.answer}</p>
                {h.score != null && (
                  <Badge variant="secondary" className="mt-2">{h.score}/100</Badge>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
