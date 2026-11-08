// Candidate profile contract: types, schema, validator and serializer.
export { PROFILE_VERSION, serializeProfile } from "./types.ts";
export type {
  Achievement,
  CandidateProfile,
  Certification,
  Contacts,
  Decision,
  Education,
  Hobby,
  Job,
  JobProject,
  Language,
  Month,
  Origin,
  Period,
  PeriodNote,
  Person,
  ProfileMeta,
  ProfileSource,
  Qualification,
  Role,
  Search,
  SideProject,
  Skill,
} from "./types.ts";
export { PROFILE_SCHEMA, validateProfile } from "./validate.ts";
export { ProfileError } from "./error.ts";
