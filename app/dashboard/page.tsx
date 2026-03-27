import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { format } from 'date-fns';
import { getWorkoutsForDate } from '@/data/workouts';
import WorkoutList from './WorkoutList';

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string }>;
}) {
  const { userId } = await auth();
  if (!userId) redirect('/sign-in');

  const today = format(new Date(), 'yyyy-MM-dd');
  const { date = today } = await searchParams;

  const workouts = await getWorkoutsForDate(userId, date);

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black">
      <div className="mx-auto max-w-2xl px-6 py-12">
        <h1 className="mb-8 text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
          Dashboard
        </h1>
        <WorkoutList workouts={workouts} date={date} today={today} />
      </div>
    </div>
  );
}
