import { db } from '@/lib/db';
import { workouts, workoutExercises, exercises, sets } from '@/src/db/schema';
import { eq, and, gte, lt } from 'drizzle-orm';

export type WorkoutWithDetails = {
  id: number;
  name: string | null;
  startedAt: Date | null;
  completedAt: Date | null;
  createdAt: Date;
  exercises: {
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
  }[];
};

export async function getWorkoutsForDate(
  userId: string,
  date: string,
): Promise<WorkoutWithDetails[]> {
  const start = new Date(`${date}T00:00:00.000Z`);
  const end = new Date(`${date}T23:59:59.999Z`);

  const rows = await db
    .select({
      workout: workouts,
      workoutExercise: workoutExercises,
      exercise: exercises,
      set: sets,
    })
    .from(workouts)
    .leftJoin(workoutExercises, eq(workoutExercises.workoutId, workouts.id))
    .leftJoin(exercises, eq(exercises.id, workoutExercises.exerciseId))
    .leftJoin(sets, eq(sets.workoutExerciseId, workoutExercises.id))
    .where(
      and(
        eq(workouts.userId, userId),
        gte(workouts.startedAt, start),
        lt(workouts.startedAt, end),
      ),
    )
    .orderBy(workouts.createdAt, workoutExercises.order, sets.setNumber);

  const workoutMap = new Map<number, WorkoutWithDetails>();

  for (const row of rows) {
    const w = row.workout;
    if (!workoutMap.has(w.id)) {
      workoutMap.set(w.id, {
        id: w.id,
        name: w.name,
        startedAt: w.startedAt,
        completedAt: w.completedAt,
        createdAt: w.createdAt,
        exercises: [],
      });
    }

    const workoutEntry = workoutMap.get(w.id)!;

    if (!row.workoutExercise || !row.exercise) continue;

    const we = row.workoutExercise;
    let weEntry = workoutEntry.exercises.find((e) => e.id === we.id);
    if (!weEntry) {
      weEntry = {
        id: we.id,
        order: we.order,
        exercise: {
          id: row.exercise.id,
          name: row.exercise.name,
          muscleGroup: row.exercise.muscleGroup,
        },
        sets: [],
      };
      workoutEntry.exercises.push(weEntry);
    }

    if (row.set) {
      weEntry.sets.push({
        id: row.set.id,
        setNumber: row.set.setNumber,
        reps: row.set.reps,
        weightKg: row.set.weightKg,
        durationSeconds: row.set.durationSeconds,
      });
    }
  }

  return Array.from(workoutMap.values());
}
