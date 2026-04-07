"use server";

import { z } from "zod";
import { auth } from "@clerk/nextjs/server";
import { createWorkout } from "@/data/workouts";

const createWorkoutSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  startedAt: z.coerce.date(),
});

export async function createWorkoutAction(params: {
  name: string;
  startedAt: Date;
}) {
  const { userId } = await auth();
  if (!userId) return { success: false, error: "Unauthorized" } as const;

  const parsed = createWorkoutSchema.safeParse(params);
  if (!parsed.success) {
    return { success: false, error: parsed.error.flatten().fieldErrors } as const;
  }

  const workout = await createWorkout(userId, parsed.data.name, parsed.data.startedAt);
  return { success: true, data: workout } as const;
}
