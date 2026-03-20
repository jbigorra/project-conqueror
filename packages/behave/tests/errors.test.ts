import { describe, expect, test } from "bun:test"
import { CodeMaatError, LizardError, FormatError } from "../src/errors"

describe("errors", () => {
  test("CodeMaatError is tagged and carries cause", () => {
    const error = new CodeMaatError({ cause: new Error("java failed") })
    expect(error._tag).toBe("CodeMaatError")
    expect(error.cause).toBeInstanceOf(Error)
  })

  test("LizardError is tagged and carries cause", () => {
    const error = new LizardError({ cause: "python not found" })
    expect(error._tag).toBe("LizardError")
    expect(error.cause).toBe("python not found")
  })

  test("FormatError is tagged and carries message", () => {
    const error = new FormatError({ message: "empty data" })
    expect(error._tag).toBe("FormatError")
    expect(error.message).toBe("empty data")
  })
})
