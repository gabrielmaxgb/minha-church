import type { MyScheduleRosterEntry } from "@/types/ministries";
import { formatRosterRole } from "@/lib/ministries/roster";

export function ScheduleEventRosterList({
  roster,
  className,
}: {
  roster: MyScheduleRosterEntry[];
  className?: string;
}) {
  if (roster.length === 0) {
    return null;
  }

  return (
    <div className={className}>
      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        Escala do evento
      </p>
      <ul className="mt-2 space-y-1">
        {roster.map((entry) => (
          <li
            key={entry.memberId}
            className="flex items-center justify-between gap-2 text-sm"
          >
            <span className="truncate text-foreground">{entry.memberName}</span>
            <span className="shrink-0 text-muted-foreground">
              {formatRosterRole(entry.roleLabel)}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
