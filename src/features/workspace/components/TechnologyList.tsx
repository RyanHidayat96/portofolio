import { Badge } from "@/components/ui/Badge";
import { ChevronDown } from "lucide-react";

export function TechnologyList({
  technologies,
  label
}: Readonly<{
  technologies: readonly string[];
  label: string;
}>): React.ReactElement {
  const remaining = technologies.slice(6);

  return (
    <div className="professional-technologies" aria-label={label}>
      <ul className="professional-tags">
        {technologies.slice(0, 6).map((technology) => (
          <li key={technology}>
            <Badge>{technology}</Badge>
          </li>
        ))}
      </ul>
      {remaining.length > 0 ? (
        <details className="professional-more">
          <summary>
            <ChevronDown size={16} aria-hidden="true" />
            More technologies ({remaining.length})
          </summary>
          <ul className="professional-tags">
            {remaining.map((technology) => (
              <li key={technology}>
                <Badge>{technology}</Badge>
              </li>
            ))}
          </ul>
        </details>
      ) : null}
    </div>
  );
}
