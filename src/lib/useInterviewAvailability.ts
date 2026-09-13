"use client";

import { useCallback, useEffect, useState } from "react";
import type { InterviewAvailabilitySlot } from "@/lib/interview-availability";

interface AvailabilityResponse {
  slots?: InterviewAvailabilitySlot[];
  error?: string;
}

export function useInterviewAvailability(
  applicationType: "committee" | "executive-associate",
  target: string,
) {
  const [availableSlots, setAvailableSlots] = useState<
    InterviewAvailabilitySlot[]
  >([]);
  const [groupedSlots, setGroupedSlots] = useState<
    Record<string, InterviewAvailabilitySlot[]>
  >({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!target) return;

    setIsLoading(true);
    setError(null);

    try {
      const query = new URLSearchParams({ type: applicationType, target });
      const response = await fetch(
        `/api/applications/interview-availability?${query.toString()}`,
        { cache: "no-store" },
      );
      const data = (await response.json()) as AvailabilityResponse;

      if (!response.ok || !Array.isArray(data.slots)) {
        throw new Error(data.error || "Unable to load interview schedules");
      }

      const grouped = data.slots.reduce<
        Record<string, InterviewAvailabilitySlot[]>
      >((result, slot) => {
        (result[slot.date] ??= []).push(slot);
        return result;
      }, {});

      setAvailableSlots(data.slots);
      setGroupedSlots(grouped);
    } catch (availabilityError) {
      setAvailableSlots([]);
      setGroupedSlots({});
      setError(
        availabilityError instanceof Error
          ? availabilityError.message
          : "Unable to load interview schedules",
      );
    } finally {
      setIsLoading(false);
    }
  }, [applicationType, target]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { availableSlots, groupedSlots, isLoading, error, refresh };
}
