import Link from "next/link";
import VoteControls from "@/app/vote-controls";
import { budgetLabel, vibeLabel, type Sidequest, type VoteValue } from "@/lib/sidequests";

type SidequestCardProps = {
  sidequest: Sidequest;
  currentVote?: VoteValue | null;
  detailed?: boolean;
};

export default function SidequestCard({
  sidequest,
  currentVote = null,
  detailed = false,
}: SidequestCardProps) {
  const formattedDate = new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
  }).format(new Date(sidequest.createdAt));

  return (
    <article className={`sidequest-card${detailed ? " sidequest-detail" : ""}`}>
      <div className="card-topline">
        <div className="tag-row">
          <span className="tag tag-place">{sidequest.neighborhood}</span>
          <span className="tag">{budgetLabel(sidequest.budget)}</span>
          <span className="tag">{vibeLabel(sidequest.vibe)}</span>
        </div>
        <time dateTime={sidequest.createdAt}>{formattedDate}</time>
      </div>

      {detailed ? (
        <h1>{sidequest.title}</h1>
      ) : (
        <h2>
          <Link href={`/sidequests/${sidequest.id}`}>{sidequest.title}</Link>
        </h2>
      )}
      <p className="hook">{sidequest.hook}</p>

      <ol className="stops">
        {sidequest.stops.map((stop, index) => (
          <li key={`${stop.label}-${index}`}>
            <span className="stop-number">{index + 1}</span>
            <div>
              <strong>{stop.label}</strong>
              <p>{stop.activity}</p>
            </div>
          </li>
        ))}
      </ol>

      <div className="budget-note">
        <span>Budget check</span>
        <p>{sidequest.budgetNote}</p>
      </div>

      <div className="card-footer">
        <VoteControls
          sidequestId={sidequest.id}
          initialWorthItCount={sidequest.worthItCount}
          initialSkipItCount={sidequest.skipItCount}
          initialVote={currentVote}
        />
        {!detailed && (
          <Link className="details-link" href={`/sidequests/${sidequest.id}`}>
            Open quest <span aria-hidden="true">↗</span>
          </Link>
        )}
      </div>
    </article>
  );
}
