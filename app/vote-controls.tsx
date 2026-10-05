"use client";

import { useState, useTransition } from "react";
import { castVote } from "@/app/actions";
import type { VoteValue } from "@/lib/sidequests";

type VoteControlsProps = {
  sidequestId: string;
  initialWorthItCount: number;
  initialSkipItCount: number;
  initialVote: VoteValue | null;
};

export default function VoteControls({
  sidequestId,
  initialWorthItCount,
  initialSkipItCount,
  initialVote,
}: VoteControlsProps) {
  const [worthItCount, setWorthItCount] = useState(initialWorthItCount);
  const [skipItCount, setSkipItCount] = useState(initialSkipItCount);
  const [vote, setVote] = useState<VoteValue | null>(initialVote);
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  function submitVote(value: VoteValue) {
    setError("");
    startTransition(async () => {
      const result = await castVote(sidequestId, value);
      if (result.error) {
        setError(result.error);
        return;
      }
      setVote(result.value ?? value);
      setWorthItCount(result.worthItCount ?? worthItCount);
      setSkipItCount(result.skipItCount ?? skipItCount);
    });
  }

  return (
    <div className="vote-area">
      <div className="vote-buttons" aria-label="Rate this sidequest">
        <button
          type="button"
          className={vote === 1 ? "vote-button selected positive" : "vote-button positive"}
          aria-pressed={vote === 1}
          disabled={isPending}
          onClick={() => submitVote(1)}
        >
          <span aria-hidden="true">↑</span> Worth it <b>{worthItCount}</b>
        </button>
        <button
          type="button"
          className={vote === -1 ? "vote-button selected negative" : "vote-button negative"}
          aria-pressed={vote === -1}
          disabled={isPending}
          onClick={() => submitVote(-1)}
        >
          <span aria-hidden="true">↓</span> Skip it <b>{skipItCount}</b>
        </button>
      </div>
      {isPending && <span className="vote-status">Saving…</span>}
      {error && <span className="vote-error" role="status">{error}</span>}
    </div>
  );
}
