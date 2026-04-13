"use server";

import { z } from "zod";
import { auth } from "@clerk/nextjs/server";
import { updateWorkout } from "@/data/workouts";

const updateWorkoutSchema = z.object({
  workoutId: z.number().int().positive(),
  name: z.string().min(1, "Name is required").max(100),
  startedAt: z.coerce.date(),
});

export async function updateWorkoutAction(params: {
  workoutId: number;
  name: string;
  startedAt: Date;
}) {
  const { userId } = await auth();
  if (!userId) return { success: false, error: "Unauthorized" } as const;

  const parsed = updateWorkoutSchema.safeParse(params);
  if (!parsed.success) {
    return { success: false, error: parsed.error.flatten().fieldErrors } as const;
  }

  const workout = await updateWorkout(
    userId,
    parsed.data.workoutId,
    parsed.data.name,
    parsed.data.startedAt,
  );

  if (!workout) {
    return { success: false, error: "Workout not found" } as const;
  }

  return { success: true, data: workout } as const;
}
