"use server";

import { z } from "zod";
import { auth } from "@clerk/nextjs/server";
import { updateWorkout, completeWorkout } from "@/data/workouts";
import { addExerciseToWorkout, removeExerciseFromWorkout } from "@/data/workoutExercises";
import { addSet, deleteSet } from "@/data/sets";

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

const addExerciseSchema = z.object({
  workoutId: z.number().int().positive(),
  exerciseId: z.number().int().positive(),
});

export async function addExerciseAction(params: { workoutId: number; exerciseId: number }) {
  const { userId } = await auth();
  if (!userId) return { success: false, error: "Unauthorized" } as const;

  const parsed = addExerciseSchema.safeParse(params);
  if (!parsed.success) {
    return { success: false, error: "Invalid parameters" } as const;
  }

  try {
    const data = await addExerciseToWorkout(userId, parsed.data.workoutId, parsed.data.exerciseId);
    return { success: true, data } as const;
  } catch {
    return { success: false, error: "Failed to add exercise" } as const;
  }
}

const removeExerciseSchema = z.object({
  workoutId: z.number().int().positive(),
  workoutExerciseId: z.number().int().positive(),
});

export async function removeExerciseAction(params: {
  workoutId: number;
  workoutExerciseId: number;
}) {
  const { userId } = await auth();
  if (!userId) return { success: false, error: "Unauthorized" } as const;

  const parsed = removeExerciseSchema.safeParse(params);
  if (!parsed.success) {
    return { success: false, error: "Invalid parameters" } as const;
  }

  try {
    await removeExerciseFromWorkout(userId, parsed.data.workoutId, parsed.data.workoutExerciseId);
    return { success: true } as const;
  } catch {
    return { success: false, error: "Failed to remove exercise" } as const;
  }
}

const addSetSchema = z.object({
  workoutExerciseId: z.number().int().positive(),
  reps: z.number().int().min(1).max(999),
  weightKg: z.number().min(0).max(9999).nullable(),
  setNumber: z.number().int().positive(),
});

export async function addSetAction(params: {
  workoutExerciseId: number;
  reps: number;
  weightKg: number | null;
  setNumber: number;
}) {
  const { userId } = await auth();
  if (!userId) return { success: false, error: "Unauthorized" } as const;

  const parsed = addSetSchema.safeParse(params);
  if (!parsed.success) {
    return { success: false, error: parsed.error.flatten().fieldErrors } as const;
  }

  try {
    const data = await addSet(userId, parsed.data.workoutExerciseId, {
      reps: parsed.data.reps,
      weightKg: parsed.data.weightKg,
      setNumber: parsed.data.setNumber,
    });
    return { success: true, data } as const;
  } catch {
    return { success: false, error: "Failed to log set" } as const;
  }
}

const deleteSetSchema = z.object({
  setId: z.number().int().positive(),
});

export async function deleteSetAction(params: { setId: number }) {
  const { userId } = await auth();
  if (!userId) return { success: false, error: "Unauthorized" } as const;

  const parsed = deleteSetSchema.safeParse(params);
  if (!parsed.success) {
    return { success: false, error: "Invalid parameters" } as const;
  }

  try {
    await deleteSet(userId, parsed.data.setId);
    return { success: true } as const;
  } catch {
    return { success: false, error: "Failed to delete set" } as const;
  }
}

const completeWorkoutSchema = z.object({
  workoutId: z.number().int().positive(),
});

export async function completeWorkoutAction(params: { workoutId: number }) {
  const { userId } = await auth();
  if (!userId) return { success: false, error: "Unauthorized" } as const;

  const parsed = completeWorkoutSchema.safeParse(params);
  if (!parsed.success) {
    return { success: false, error: "Invalid parameters" } as const;
  }

  try {
    const data = await completeWorkout(userId, parsed.data.workoutId);
    if (!data) return { success: false, error: "Workout not found" } as const;
    return { success: true, data } as const;
  } catch {
    return { success: false, error: "Failed to complete workout" } as const;
  }
}
