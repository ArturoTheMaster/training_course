import { notFound } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { getWorkoutById } from "@/data/workouts";
import EditWorkoutForm from "./edit-workout-form";

type Props = {
  params: Promise<{ workoutId: string }>;
};

export default async function EditWorkoutPage({ params }: Props) {
  const { workoutId } = await params;
  const id = parseInt(workoutId, 10);

  if (isNaN(id)) notFound();

  const { userId } = await auth();
  if (!userId) notFound();

  const workout = await getWorkoutById(userId, id);
  if (!workout) notFound();

  return <EditWorkoutForm workout={workout} />;
}
