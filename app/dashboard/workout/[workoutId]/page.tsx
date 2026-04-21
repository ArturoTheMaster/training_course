import { notFound } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { getWorkoutWithDetails } from "@/data/workouts";
import { getAllExercises } from "@/data/exercises";
import WorkoutLogger from "./workout-logger";

type Props = {
  params: Promise<{ workoutId: string }>;
};

export default async function WorkoutPage({ params }: Props) {
  const { workoutId } = await params;
  const id = parseInt(workoutId, 10);

  if (isNaN(id)) notFound();

  const { userId } = await auth();
  if (!userId) notFound();

  const [workout, allExercises] = await Promise.all([
    getWorkoutWithDetails(userId, id),
    getAllExercises(),
  ]);

  if (!workout) notFound();

  return <WorkoutLogger workout={workout} allExercises={allExercises} />;
}
