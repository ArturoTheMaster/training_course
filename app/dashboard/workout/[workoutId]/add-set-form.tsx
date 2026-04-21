"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { addSetAction } from "./actions";

type Props = {
  workoutExerciseId: number;
  nextSetNumber: number;
};

export default function AddSetForm({ workoutExerciseId, nextSetNumber }: Props) {
  const router = useRouter();
  const [reps, setReps] = useState("");
  const [weightKg, setWeightKg] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setPending(true);

    const result = await addSetAction({
      workoutExerciseId,
      reps: parseInt(reps, 10),
      weightKg: weightKg.trim() === "" ? null : parseFloat(weightKg),
      setNumber: nextSetNumber,
    });

    setPending(false);

    if (!result.success) {
      setError("Failed to log set");
      return;
    }

    setReps("");
    setWeightKg("");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="flex items-end gap-3 pt-2">
      <div className="space-y-1">
        <Label htmlFor={`reps-${workoutExerciseId}`} className="text-xs">
          Reps
        </Label>
        <Input
          id={`reps-${workoutExerciseId}`}
          type="number"
          min={1}
          max={999}
          placeholder="e.g. 10"
          value={reps}
          onChange={(e) => setReps(e.target.value)}
          required
          className="w-24"
        />
      </div>
      <div className="space-y-1">
        <Label htmlFor={`weight-${workoutExerciseId}`} className="text-xs">
          Weight (kg)
        </Label>
        <Input
          id={`weight-${workoutExerciseId}`}
          type="number"
          min={0}
          max={9999}
          step="0.5"
          placeholder="optional"
          value={weightKg}
          onChange={(e) => setWeightKg(e.target.value)}
          className="w-28"
        />
      </div>
      <Button type="submit" size="sm" disabled={pending}>
        {pending ? "Logging…" : "Log set"}
      </Button>
      {error && <p className="text-xs text-red-500">{error}</p>}
    </form>
  );
}
