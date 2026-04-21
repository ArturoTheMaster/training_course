"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronLeft, Check } from "lucide-react";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { WorkoutWithDetails } from "@/data/workouts";
import type { Exercise } from "@/src/db/schema";
import ExerciseCard from "./exercise-card";
import AddExerciseCombobox from "./add-exercise-combobox";
import CompleteWorkoutButton from "./complete-workout-button";
import { updateWorkoutAction } from "./actions";

type Props = {
  workout: WorkoutWithDetails;
  allExercises: Exercise[];
};

export default function WorkoutLogger({ workout, allExercises }: Props) {
  const router = useRouter();
  const [name, setName] = useState(workout.name ?? "");
  const [date, setDate] = useState(
    workout.startedAt ? format(workout.startedAt, "yyyy-MM-dd") : format(new Date(), "yyyy-MM-dd"),
  );
  const [time, setTime] = useState(
    workout.startedAt ? format(workout.startedAt, "HH:mm") : format(new Date(), "HH:mm"),
  );
  const [savePending, setSavePending] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [savedAt, setSavedAt] = useState<number | null>(null);

  async function handleBlur() {
    if (!name.trim() || !date || !time) return;
    setSaveError(null);
    setSavePending(true);
    const result = await updateWorkoutAction({
      workoutId: workout.id,
      name,
      startedAt: new Date(`${date}T${time}:00`),
    });
    setSavePending(false);
    if (!result.success) {
      const err = result.error;
      setSaveError(typeof err === "string" ? err : "Failed to save");
      return;
    }
    setSavedAt(Date.now());
    setTimeout(() => setSavedAt(null), 2500);
    router.refresh();
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black">
      <div className="mx-auto max-w-2xl px-6 py-12 space-y-8">
        <div>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1 text-sm text-zinc-600 dark:text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 mb-4"
          >
            <ChevronLeft className="h-4 w-4" />
            Back to dashboard
          </Link>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
              {workout.name ?? "Untitled workout"}
            </h1>
            <Badge variant={workout.completedAt ? "default" : "secondary"}>
              {workout.completedAt ? "Finished" : "In progress"}
            </Badge>
          </div>
          {workout.startedAt && (
            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-500">
              {format(workout.startedAt, "do MMM yyyy, HH:mm")}
            </p>
          )}
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Workout details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  placeholder="e.g. Morning push day"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  onBlur={handleBlur}
                />
              </div>
              <div className="flex gap-4">
                <div className="flex-1 space-y-2">
                  <Label htmlFor="date">Date</Label>
                  <Input
                    id="date"
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    onBlur={handleBlur}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="time">Time</Label>
                  <Input
                    id="time"
                    type="time"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    onBlur={handleBlur}
                  />
                </div>
              </div>
              {saveError && <p className="text-sm text-red-500">{saveError}</p>}
              {savePending && <p className="text-xs text-zinc-500 dark:text-zinc-400">Saving…</p>}
              {!savePending && savedAt && (
                <p className="flex items-center gap-1 text-xs text-green-600 dark:text-green-400">
                  <Check className="h-3 w-3" />
                  Saved
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        <section className="space-y-4">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">Exercises</h2>
          {workout.exercises.length === 0 ? (
            <p className="text-sm text-zinc-500 dark:text-zinc-400">No exercises added yet.</p>
          ) : (
            <div className="space-y-4">
              {workout.exercises.map((entry) => (
                <ExerciseCard key={entry.id} workoutId={workout.id} entry={entry} />
              ))}
            </div>
          )}
          <AddExerciseCombobox workoutId={workout.id} exercises={allExercises} />
        </section>

        <div className="flex justify-end pt-4 border-t border-zinc-200 dark:border-zinc-800">
          <CompleteWorkoutButton workoutId={workout.id} completedAt={workout.completedAt} />
        </div>
      </div>
    </div>
  );
}
