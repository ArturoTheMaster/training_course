"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Check, ChevronsUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { addExerciseAction } from "./actions";
import { cn } from "@/lib/utils";

type Exercise = { id: number; name: string; muscleGroup: string | null };

type Props = {
  workoutId: number;
  exercises: Exercise[];
};

export default function AddExerciseCombobox({ workoutId, exercises }: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);

  async function handleSelect(exerciseId: number) {
    setOpen(false);
    setPending(true);
    await addExerciseAction({ workoutId, exerciseId });
    setPending(false);
    router.refresh();
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={
          <Button variant="outline" disabled={pending} className="gap-2">
            <Plus className="h-4 w-4" />
            {pending ? "Adding…" : "Add exercise"}
            <ChevronsUpDown className="h-4 w-4 opacity-50" />
          </Button>
        }
      />
      <PopoverContent className="w-72 p-0" align="start">
        <Command>
          <CommandInput placeholder="Search exercises…" />
          <CommandList>
            <CommandEmpty>No exercises found.</CommandEmpty>
            <CommandGroup>
              {exercises.map((ex) => (
                <CommandItem
                  key={ex.id}
                  value={ex.name}
                  onSelect={() => handleSelect(ex.id)}
                >
                  <Check className={cn("mr-2 h-4 w-4 opacity-0")} />
                  <span className="text-zinc-900 dark:text-zinc-100">{ex.name}</span>
                  {ex.muscleGroup && (
                    <span className="ml-auto text-xs text-zinc-500 dark:text-zinc-400">{ex.muscleGroup}</span>
                  )}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
