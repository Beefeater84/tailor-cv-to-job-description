// Candidate profile contract v1.0: TypeScript types mirroring `contract/profile.schema.json`, and the serializer.

/** Version of the profile contract, `<major>.<minor>`. */
export const PROFILE_VERSION = "1.0";

/** "YYYY" or "YYYY-MM". */
export type Month = string;

/** Where a unit's facts come from. Every key is present; the unused ones are null. */
export type Origin =
  | { kind: "source_cv"; source: string; quote: string; date: null }
  | { kind: "candidate" | "agent_confirmed"; source: null; quote: null; date: string };

/** A period of time; `end` is "present" for something still going on. */
export interface Period {
  start: Month;
  end: Month | "present";
}

/** A document or conversation the profile was read from. */
export interface ProfileSource {
  id: string;
  kind: "index_cv" | "file" | "chat";
  location: string | null;
  /** ISO 8601 date-time. */
  read_at: string;
}

/** Service data of the profile. */
export interface ProfileMeta {
  sources: ProfileSource[] | null;
  /** ISO 8601 date-time. */
  updated_at: string;
}

/** P-01: name and current job title. */
export interface Person {
  name: string | null;
  title: string | null;
  level: string | null;
  origin: Origin | null;
}

/** P-02: search goals and location. */
export interface Search {
  target_roles: string[] | null;
  apply_locations: string[] | null;
  relocation: string | null;
  region: string | null;
  work_formats: ("on_site" | "hybrid" | "remote")[] | null;
  current_city: string | null;
  time_zone: string | null;
  origin: Origin | null;
}

/** P-03: contacts. */
export interface Contacts {
  phone: string | null;
  email: string | null;
  linkedin: string | null;
  github: string | null;
  origin: Origin | null;
}

/** P-04: a skill with the ids of the jobs and projects that back it. */
export interface Skill {
  id: string;
  name: string;
  kind: "software" | "tool" | "method" | "technology" | null;
  evidence: string[] | null;
  origin: Origin;
}

/** P-05: an achievement linked to exactly one project. */
export interface Achievement {
  id: string;
  project: string;
  result: string;
  number: string | null;
  number_context: string | null;
  measure: string | null;
  contribution: "own" | "team" | null;
  own_part: string | null;
  how: string | null;
  ai_involved: boolean | null;
  origin: Origin;
}

/** P-06: a title held at a job for a period. */
export interface Role {
  title: string;
  period: Period;
  /** Markdown. */
  description: string | null;
  duties: string[] | null;
}

/** P-06: a project inside a job. */
export interface JobProject {
  id: string;
  name: string;
  /** Markdown. */
  context: string | null;
  role: string | null;
  period: Period | null;
  origin: Origin;
}

/** P-06: a job at one employer. */
export interface Job {
  id: string;
  company: string;
  industry: string | null;
  market_types: ("B2B" | "B2C")[] | null;
  roles: Role[];
  projects: JobProject[];
  origin: Origin;
}

/** P-07: a project outside jobs. */
export interface SideProject {
  id: string;
  name: string;
  kind: "own" | "open_source" | "study" | "vacancy_task";
  /** Markdown. */
  context: string | null;
  period: Period | null;
  result: string | null;
  link: string | null;
  origin: Origin;
}

/** P-07: a context note for a period between jobs. */
export interface PeriodNote {
  id: string;
  period: Period;
  note: string;
  origin: Origin;
}

/** P-08: a language with its level. */
export interface Language {
  name: string;
  level: "A1" | "A2" | "B1" | "B2" | "C1" | "C2" | "native";
  origin: Origin;
}

/** P-09: a degree or an equivalent qualification. */
export interface Qualification {
  title: string;
  institution: string | null;
  /** "YYYY". */
  year: string | null;
  origin: Origin;
}

/** P-09: a professional certification. */
export interface Certification {
  name: string;
  issuer: string | null;
  /** "YYYY". */
  year: string | null;
  origin: Origin;
}

/** P-09: education and certifications. */
export interface Education {
  qualifications: Qualification[] | null;
  certifications: Certification[] | null;
}

/** P-10: a hobby or an outside activity. */
export interface Hobby {
  name: string;
  relevance: string | null;
  origin: Origin;
}

/** P-11: a record of the candidate's decision. */
export interface Decision {
  id: string;
  /** "YYYY-MM-DD". */
  date: string;
  kind: "confirmation" | "override";
  rule: string;
  subject: string;
  warning: string | null;
  refs: string[] | null;
}

/** Candidate profile v1.0. Every key is always present; `null` means no value, never an empty list. */
export interface CandidateProfile {
  schema_version: typeof PROFILE_VERSION;
  meta: ProfileMeta;
  person: Person;
  search: Search;
  contacts: Contacts;
  skills: Skill[] | null;
  achievements: Achievement[] | null;
  jobs: Job[] | null;
  projects: SideProject[] | null;
  period_notes: PeriodNote[] | null;
  languages: Language[] | null;
  education: Education;
  hobbies: Hobby[] | null;
  decisions: Decision[] | null;
}

/** The bytes of a profile file: two-space indented JSON with a trailing newline. */
export function serializeProfile(profile: CandidateProfile): string {
  return `${JSON.stringify(profile, null, 2)}\n`;
}
