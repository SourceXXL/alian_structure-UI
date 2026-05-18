"use client";

import { useState, useEffect } from "react";
import { Submission } from "../types";

interface UseSubmissionsResult {
  data: Submission[];
  loading: boolean;
}

const normalizeSubmission = (input: unknown): Submission | null => {
  if (typeof input !== "object" || input === null) {
    return null;
  }

  const item = input as Record<string, unknown>;

  const id = String(item.id ?? item._id ?? "");
  const txHash = String(item.txHash ?? item.hash ?? "");
  const status = String(item.status ?? item.state ?? "pending");
  const rawTimestamp = item.timestamp ?? item.createdAt ?? item.time ?? "";
  const timestamp: string | number =
    typeof rawTimestamp === "number" ? rawTimestamp : String(rawTimestamp);
  const error = item.error ? String(item.error) : undefined;

  if (!id || !txHash) {
    return null;
  }

  const submission: Submission = {
    id,
    txHash,
    status,
    timestamp,
  };

  if (error) {
    submission.error = error;
  }

  return submission;
};

export function useSubmissions(): UseSubmissionsResult {
  const [data, setData] = useState<Submission[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let cancelled = false;

    const fetchSubmissions = async () => {
      setLoading(true);

      try {
        const res = await fetch("/api/submissions");
        const responseBody = await res.json();

        console.debug("Submissions response:", responseBody);

        if (cancelled) {
          return;
        }

        if (!Array.isArray(responseBody)) {
          setData([]);
          setLoading(false);
          return;
        }

        const normalized = responseBody
          .map(normalizeSubmission)
          .filter((entry): entry is Submission => entry !== null);

        setData(normalized);
      } catch (error) {
        console.error("Failed to load submissions", error);
        setData([]);
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    fetchSubmissions();

    return () => {
      cancelled = true;
    };
  }, []);

  return { data, loading };
}
