import Link from "next/link";
import Image from "next/image";
import VoteControls from "@/app/vote-controls";
import {
  sidequestBudgetLabel,
  vibeLabel,
  type Sidequest,
  type VoteValue,
} from "@/lib/sidequests";

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
      <figure className="cover-photo">
        <Image
          src={sidequest.cover.src}
          alt={sidequest.cover.alt}
          fill
          sizes={detailed ? "(max-width: 850px) 100vw, 850px" : "(max-width: 850px) 100vw, 540px"}
          preload={detailed}
        />
        <div className="cover-scrim" />
        <figcaption>
          <span>NYC field guide</span>
          <a
            href={sidequest.cover.creditUrl}
            target="_blank"
            rel="noreferrer"
          >
            Photo: {sidequest.cover.credit}
          </a>
        </figcaption>
      </figure>
      <div className="card-topline">
        <div className="tag-row">
          <span className="tag tag-place">{sidequest.neighborhood}</span>
          <span className="tag">{sidequestBudgetLabel(sidequest)}</span>
          {sidequest.partySize > 1 && (
            <span className="tag">{sidequest.partySize} people</span>
          )}
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
              {stop.places.length > 0 && (
                <ul className="stop-places" aria-label={`Destinations and recommendations for stop ${index + 1}`}>
                  {stop.places.map((place, placeIndex) => (
                    <li key={`${place.mapQuery}-${placeIndex}`}>
                      <span className="place-option">
                        {placeIndex === 0 ? "Destination" : `Option ${String.fromCharCode(65 + placeIndex)}`}
                      </span>
                      <a
                        href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${place.name}, ${place.address}`)}`}
                        target="_blank"
                        rel="noreferrer"
                      >
                        {place.name} <span aria-hidden="true">↗</span>
                      </a>
                      <span>{place.address}</span>
                    </li>
                  ))}
                </ul>
              )}
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
