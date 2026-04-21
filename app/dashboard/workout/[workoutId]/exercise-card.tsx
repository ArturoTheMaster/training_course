"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { deleteSetAction, removeExerciseAction } from "./actions";
import AddSetForm from "./add-set-form";

type ExerciseEntry = {
  id: number;
  order: number;
  exercise: { id: number; name: string; muscleGroup: string | null };
  sets: {
    id: number;
    setNumber: number;
    reps: number | null;
    weightKg: number | null;
    durationSeconds: number | null;
  }[];
};

type Props = {
  workoutId: number;
  entry: ExerciseEntry;
};

export default function ExerciseCard({ workoutId, entry }: Props) {
  const router = useRouter();
  const [removingSetId, setRemovingSetId] = useState<number | null>(null);
  const [removing, setRemoving] = useState(false);

  async function handleDeleteSet(setId: number) {
    setRemovingSetId(setId);
    await deleteSetAction({ setId });
    setRemovingSetId(null);
    router.refresh();
  }

  async function handleRemoveExercise() {
    setRemoving(true);
    await removeExerciseAction({ workoutId, workoutExerciseId: entry.id });
    setRemoving(false);
    router.refresh();
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between pb-2">
        <div className="flex items-center gap-2">
          <CardTitle className="text-base">{entry.exercise.name}</CardTitle>
          {entry.exercise.muscleGroup && (
            <Badge variant="secondary" className="text-xs">
              {entry.exercise.muscleGroup}
            </Badge>
          )}
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 text-zinc-500 dark:text-zinc-400 hover:text-red-500"
          onClick={handleRemoveExercise}
          disabled={removing}
          title="Remove exercise"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent>
        {entry.sets.length > 0 ? (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-zinc-600 dark:text-zinc-500">
                <th className="pb-1 font-medium">Set</th>
                <th className="pb-1 font-medium">Reps</th>
                <th className="pb-1 font-medium">Weight (kg)</th>
                <th className="pb-1" />
              </tr>
            </thead>
            <tbody>
              {entry.sets.map((set) => (
                <tr key={set.id} className="border-t border-zinc-100 dark:border-zinc-800">
                  <td className="py-1">{set.setNumber}</td>
                  <td className="py-1">{set.reps ?? "—"}</td>
                  <td className="py-1">{set.weightKg != null ? `${set.weightKg} kg` : "—"}</td>
                  <td className="py-1 text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 text-zinc-500 dark:text-zinc-400 hover:text-red-500"
                      onClick={() => handleDeleteSet(set.id)}
                      disabled={removingSetId === set.id}
                      title="Delete set"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="text-sm text-zinc-500 dark:text-zinc-400">No sets logged yet.</p>
        )}
        <AddSetForm
          workoutExerciseId={entry.id}
          nextSetNumber={entry.sets.length + 1}
        />
      </CardContent>
    </Card>
  );
}
