import { Panel } from "@/components/ui/Panel";
import { education } from "@/data/education";
import { profile } from "@/data/profile";
import { CapabilityMatrix } from "@/features/workspace/components/CapabilityMatrix";

export function ProfilePanel(): React.ReactElement {
  return (
    <div className="grid gap-5 xl:grid-cols-[0.8fr_1.2fr]">
      <Panel className="p-5 sm:p-7">
        <p className="mono text-sm text-[var(--accent)]">whoami</p>
        <h1 className="mt-4 text-3xl font-semibold">{profile.name}</h1>
        <p className="mt-2 text-lg text-[var(--accent)]">{profile.headline}</p>
        <p className="mt-5 leading-7 text-[#b7c2d2]">{profile.tagline}</p>
        <p className="mt-4 text-sm leading-6 text-[#c8d4e6]">{profile.summary}</p>
        <dl className="mt-7 grid gap-4 text-sm sm:grid-cols-3">
          <div>
            <dt className="text-[var(--text-muted)]">Experience</dt>
            <dd className="mt-1 text-[var(--text-primary)]">{profile.yearsOfExperience}</dd>
          </div>
          <div>
            <dt className="text-[var(--text-muted)]">Location</dt>
            <dd className="mt-1 text-[var(--text-primary)]">{profile.location}</dd>
          </div>
          <div>
            <dt className="text-[var(--text-muted)]">Target</dt>
            <dd className="mt-1 text-[var(--success)]">{profile.availability}</dd>
          </div>
        </dl>
        <details className="mt-7 border border-[var(--border)] bg-[#111722] p-4">
          <summary className="cursor-pointer font-semibold text-[var(--accent)]">Education</summary>
          {education.map((item) => (
            <div key={item.institution} className="mt-3 text-sm leading-6 text-[#c8d4e6]">
              <p>{item.institution}</p>
              <p className="text-[var(--text-muted)]">{item.degree}</p>
              <p className="mono text-[var(--accent)]">{item.period}</p>
            </div>
          ))}
        </details>
      </Panel>

      <CapabilityMatrix />
    </div>
  );
}
