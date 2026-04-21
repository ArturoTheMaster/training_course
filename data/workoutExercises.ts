import { db } from '@/lib/db';
import { workouts, workoutExercises } from '@/src/db/schema';
import { eq, and, max } from 'drizzle-orm';
import type { WorkoutExercise } from '@/src/db/schema';

export async function addExerciseToWorkout(
  userId: string,
  workoutId: number,
  exerciseId: number,
): Promise<WorkoutExercise> {
  // Verify ownership
  const [workout] = await db
    .select()
    .from(workouts)
    .where(and(eq(workouts.id, workoutId), eq(workouts.userId, userId)));
  if (!workout) throw new Error('Workout not found');

  const [{ maxOrder }] = await db
    .select({ maxOrder: max(workoutExercises.order) })
    .from(workoutExercises)
    .where(eq(workoutExercises.workoutId, workoutId));

  const order = (maxOrder ?? 0) + 1;

  const [workoutExercise] = await db
    .insert(workoutExercises)
    .values({ workoutId, exerciseId, order })
    .returning();
  return workoutExercise;
}

export async function removeExerciseFromWorkout(
  userId: string,
  workoutId: number,
  workoutExerciseId: number,
): Promise<void> {
  // Verify ownership
  const [workout] = await db
    .select()
    .from(workouts)
    .where(and(eq(workouts.id, workoutId), eq(workouts.userId, userId)));
  if (!workout) throw new Error('Workout not found');

  await db
    .delete(workoutExercises)
    .where(
      and(eq(workoutExercises.id, workoutExerciseId), eq(workoutExercises.workoutId, workoutId)),
    );
}
