import { db } from '@/lib/db';
import { workouts, workoutExercises, sets } from '@/src/db/schema';
import { eq, and } from 'drizzle-orm';
import type { Set } from '@/src/db/schema';

async function verifySetOwnership(userId: string, workoutExerciseId: number): Promise<void> {
  const [row] = await db
    .select({ userId: workouts.userId })
    .from(workoutExercises)
    .innerJoin(workouts, eq(workouts.id, workoutExercises.workoutId))
    .where(and(eq(workoutExercises.id, workoutExerciseId), eq(workouts.userId, userId)));
  if (!row) throw new Error('Workout exercise not found');
}

export async function addSet(
  userId: string,
  workoutExerciseId: number,
  data: { reps: number; weightKg: number | null; setNumber: number },
): Promise<Set> {
  await verifySetOwnership(userId, workoutExerciseId);

  const [set] = await db
    .insert(sets)
    .values({
      workoutExerciseId,
      setNumber: data.setNumber,
      reps: data.reps,
      weightKg: data.weightKg,
    })
    .returning();
  return set;
}

export async function deleteSet(userId: string, setId: number): Promise<void> {
  const [row] = await db
    .select({ userId: workouts.userId })
    .from(sets)
    .innerJoin(workoutExercises, eq(workoutExercises.id, sets.workoutExerciseId))
    .innerJoin(workouts, eq(workouts.id, workoutExercises.workoutId))
    .where(and(eq(sets.id, setId), eq(workouts.userId, userId)));
  if (!row) throw new Error('Set not found');

  await db.delete(sets).where(eq(sets.id, setId));
}
