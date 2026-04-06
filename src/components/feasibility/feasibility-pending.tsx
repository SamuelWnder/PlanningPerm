"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface Props {
  projectId: string;
}

const LOADING_MESSAGES = [
  "Identifying your local planning authority...",
  "Searching for comparable decisions in your area...",
  "Analysing local plan policies...",
  "Checking permitted development rights...",
  "Calculating approval likelihood...",
  "Drafting your feasibility assessment...",
];

export function FeasibilityPending({ projectId }: Props) {
  const router = useRouter();
  const [messageIndex, setMessageIndex] = useState(0);

  // Cycle through loading messages
  useEffect(() => {
    const interval = setInterval(() => {
      setMessageIndex((i) => (i + 1) % LOADING_MESSAGES.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  // Poll for completion
  useEffect(() => {
    const poll = async () => {
      try {
        const resp = await fetch(`/api/projects/${projectId}/status`);
        const data = await resp.json();
        if (data.status === "feasibility_complete" || data.feasibility_score !== null) {
          router.refresh();
        }
      } catch {
        // ignore
      }
    };

    const interval = setInterval(poll, 4000);
    return () => clearInterval(interval);
  }, [projectId, router]);

  return (
    <Card className="border-dashed">
      <CardContent className="flex flex-col items-center justify-center py-16 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#F0EDE6] mb-6">
          <Loader2 className="h-8 w-8 text-[#1A3A2A] animate-spin" />
        </div>
        <h3 className="text-lg font-semibold mb-2">Running your assessment</h3>
        <p className="text-[#6B7280] text-sm max-w-sm animate-pulse">
          {LOADING_MESSAGES[messageIndex]}
        </p>
        <p className="text-xs text-[#9CA3AF] mt-4">
          This usually takes 30–60 seconds. The page will update automatically.
        </p>
      </CardContent>
    </Card>
  );
}
