import { Badge } from "@/components/ui/Badge";
import { Panel } from "@/components/ui/Panel";
import { education } from "@/data/education";
import { profile } from "@/data/profile";
import { skillGroups } from "@/data/skills";

export function ProfilePanel(): React.ReactElement {
  return (
    <div className="grid gap-5 xl:grid-cols-[0.8fr_1.2fr]">
      <Panel className="p-5 sm:p-7">
        <p className="mono text-sm text-[var(--accent)]">whoami</p>
        <h1 className="mt-4 text-3xl font-semibold">{profile.name}</h1>
        <p className="mt-2 text-lg text-[var(--accent)]">{profile.headline}</p>
        <p className="mt-5 leading-7 text-[#b7c2d2]">{profile.tagline}</p>
        <p className="mt-4 text-sm leading-6 text-[#c8d4e6]">{profile.summary}</p>
        <dl className="mt-7 space-y-4 text-sm">
          <div>
            <dt className="text-[var(--text-muted)]">Experience</dt>
            <dd className="mt-1 text-[var(--text-primary)]">{profile.yearsOfExperience}</dd>
          </div>
          <div>
            <dt className="text-[var(--text-muted)]">Location</dt>
            <dd className="mt-1 text-[var(--text-primary)]">{profile.location}</dd>
          </div>
          <div>
            <dt className="text-[var(--text-muted)]">Availability</dt>
            <dd className="mt-1 text-[var(--success)]">{profile.availability}</dd>
          </div>
        </dl>
        <div className="mt-7 border border-[var(--border)] bg-[#111722] p-4">
          <h2 className="font-semibold">Education</h2>
          {education.map((item) => (
            <div key={item.institution} className="mt-3 text-sm leading-6 text-[#c8d4e6]">
              <p>{item.institution}</p>
              <p className="text-[var(--text-muted)]">{item.degree}</p>
              <p className="mono text-[var(--accent)]">{item.period}</p>
              <p>GPA {item.gpa}</p>
            </div>
          ))}
        </div>
      </Panel>

      <div className="grid gap-4 md:grid-cols-2">
        {skillGroups.map((group) => (
          <Panel key={group.id} className="p-5">
            <h2 className="text-lg font-semibold">{group.title}</h2>
            <div className="mt-4 space-y-3">
              {group.skills.map((skill) => (
                <article
                  key={skill.name}
                  className="border border-[var(--border)] bg-[#111722] p-3"
                >
                  <div className="flex items-center justify-between gap-3">
                    <h3 className="font-semibold">{skill.name}</h3>
                    <Badge tone="info">skill</Badge>
                  </div>
                  <p className="mt-2 text-sm leading-6 text-[var(--text-muted)]">{skill.purpose}</p>
                </article>
              ))}
            </div>
          </Panel>
        ))}
      </div>
    </div>
  );
}
