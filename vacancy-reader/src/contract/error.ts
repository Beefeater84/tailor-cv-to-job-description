/** A vacancy contract does not match `contract/vacancy.schema.json`. `violations` lists each failed check. */
export class ContractError extends Error {
  override name = "ContractError";

  constructor(readonly violations: string[]) {
    super(`Vacancy contract is invalid:\n${violations.map((violation) => `- ${violation}`).join("\n")}`);
  }
}
