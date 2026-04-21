import { db } from '@/lib/db';
import { exercises } from '@/src/db/schema';
import type { Exercise } from '@/src/db/schema';

export async function getAllExercises(): Promise<Exercise[]> {
  return db.select().from(exercises).orderBy(exercises.name);
}
