// The error thrown when a candidate profile breaks the contract.

/** A candidate profile does not match the contract: the schema or the references between objects. `violations` lists each failed check. */
export class ProfileError extends Error {
  override name = "ProfileError";

  constructor(readonly violations: string[]) {
    super(`Candidate profile is invalid:\n${violations.map((violation) => `- ${violation}`).join("\n")}`);
  }
}
