import { beforeEach, describe, expect, it, mock } from "bun:test";
import { getRemoteOriginUrl } from "./git-config-parser";

const REPO_PATH = "/home/user/sample-repo";
const CONFIG_PATH = `${REPO_PATH}/.git/config`;

let mockExec: ReturnType<typeof mock>;

mock.module("@prj-conq/lib/processes", () => ({
  spawnAsync: mock(() => mockExec),
}));

const createResult = (
  stdout: string,
  errorCode = 0,
  stderr = "",
  error: Error | null = null,
) => ({
  stdout,
  stderr,
  errorCode,
  error,
  errorMessage: () =>
    errorCode === 0
      ? undefined
      : error?.message ||
        stderr ||
        stdout ||
        `Command failed with errorCode ${errorCode}`,
  isSuccess: () => errorCode === 0,
  isFailure: () => errorCode !== 0,
});

describe("getRemoteOriginUrl", () => {
  beforeEach(() => {
    mockExec = mock(() => Promise.resolve(createResult("")));
  });

  it.each([
    ["https://github.com/username/sample-repo.git"],
    ["git@github.com:username/sample-repo.git"],
  ])("should return the remote origin url: %s", async (validUrl) => {
    mockExec.mockResolvedValue(createResult(`${validUrl}\n`));

    const url = await getRemoteOriginUrl(REPO_PATH);

    expect(url).toBe(validUrl);
  });

  it("should invoke git config with the correct config path", async () => {
    mockExec.mockResolvedValue(
      createResult("https://github.com/username/sample-repo.git\n"),
    );

    await getRemoteOriginUrl(REPO_PATH);

    expect(mockExec).toHaveBeenCalledWith("git", [
      "config",
      "--file",
      CONFIG_PATH,
      "remote.origin.url",
    ]);
  });

  it("should throw if git config command fails", () => {
    mockExec.mockResolvedValue(createResult("", 1, "not found"));

    expect(getRemoteOriginUrl(REPO_PATH)).rejects.toThrow(
      ".git: no config file found.",
    );
  });

  it("should throw if origin url is empty", () => {
    mockExec.mockResolvedValue(createResult(""));

    expect(getRemoteOriginUrl(REPO_PATH)).rejects.toThrow(
      ".git/config: origin url is empty.",
    );
  });

  it("should throw if origin url is whitespace only", () => {
    mockExec.mockResolvedValue(createResult("   \n"));

    expect(getRemoteOriginUrl(REPO_PATH)).rejects.toThrow(
      ".git/config: origin url is empty.",
    );
  });
});
