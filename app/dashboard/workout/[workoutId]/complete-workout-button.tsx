"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { completeWorkoutAction } from "./actions";

type Props = {
  workoutId: number;
  completedAt: Date | null;
};

export default function CompleteWorkoutButton({ workoutId, completedAt }: Props) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  if (completedAt) {
    return (
      <Badge variant="default" className="text-sm py-1 px-3">
        Completed {format(completedAt, "do MMM yyyy")}
      </Badge>
    );
  }

  async function handleComplete() {
    if (!window.confirm("Mark this workout as complete?")) return;
    setPending(true);
    await completeWorkoutAction({ workoutId });
    setPending(false);
    router.refresh();
  }

  return (
    <Button onClick={handleComplete} disabled={pending}>
      {pending ? "Completing…" : "Complete workout"}
    </Button>
  );
}
