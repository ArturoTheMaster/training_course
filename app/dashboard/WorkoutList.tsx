'use client';

import { useState, useTransition, useEffect } from 'react';
import { format } from 'date-fns';
import { getWorkoutsForDate, WorkoutWithDetails } from './actions';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

export default function WorkoutList() {
  const today = format(new Date(), 'yyyy-MM-dd');
  const [date, setDate] = useState(today);
  const [workouts, setWorkouts] = useState<WorkoutWithDetails[]>([]);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    startTransition(async () => {
      const data = await getWorkoutsForDate(date);
      setWorkouts(data);
    });
  }, [date]);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <label htmlFor="date-picker" className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Date
        </label>
        <Input
          id="date-picker"
          type="date"
          value={date}
          max={today}
          onChange={(e) => setDate(e.target.value)}
        />
      </div>

      {isPending && (
        <p className="text-sm text-zinc-400">Loading...</p>
      )}

      {!isPending && workouts.length === 0 && (
        <Card className="px-6 py-10 text-center">
          <p className="text-sm text-zinc-500 dark:text-zinc-400">No workouts logged for this date.</p>
        </Card>
      )}

      {!isPending && workouts.map((workout) => (
        <Card key={workout.id}>
          <CardHeader>
            <CardTitle>{workout.name ?? 'Workout'}</CardTitle>
            {workout.startedAt && (
              <p className="mt-0.5 text-xs text-zinc-400">
                {format(new Date(workout.startedAt), 'HH:mm')}
                {workout.completedAt && (
                  <> — {format(new Date(workout.completedAt), 'HH:mm')}</>
                )}
              </p>
            )}
          </CardHeader>

          <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
            {workout.exercises.map((we) => (
              <CardContent key={we.id}>
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium text-zinc-800 dark:text-zinc-200">
                    {we.exercise.name}
                  </h3>
                  {we.exercise.muscleGroup && (
                    <Badge variant="secondary">{we.exercise.muscleGroup}</Badge>
                  )}
                </div>

                {we.sets.length > 0 && (
                  <table className="mt-3 w-full text-xs text-zinc-500 dark:text-zinc-400">
                    <thead>
                      <tr className="text-left">
                        <th className="pb-1.5 font-medium">Set</th>
                        <th className="pb-1.5 font-medium">Reps</th>
                        <th className="pb-1.5 font-medium">Weight (kg)</th>
                        <th className="pb-1.5 font-medium">Duration (s)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-50 dark:divide-zinc-800/50">
                      {we.sets.map((s) => (
                        <tr key={s.id}>
                          <td className="py-1">{s.setNumber}</td>
                          <td className="py-1">{s.reps ?? '—'}</td>
                          <td className="py-1">{s.weightKg ?? '—'}</td>
                          <td className="py-1">{s.durationSeconds ?? '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </CardContent>
            ))}
          </div>
        </Card>
      ))}
    </div>
  );
}
