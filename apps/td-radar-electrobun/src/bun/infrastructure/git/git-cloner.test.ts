import { afterEach, beforeEach, describe, expect, it, mock } from "bun:test";

const DEFAULT_USER_DATA = "/home/user/app";
const DEFAULT_PROJECTS_PATH = `${DEFAULT_USER_DATA}/projects/default`;

let mockFsExists: ReturnType<typeof mock>;
let mockFsMkdir: ReturnType<typeof mock>;
let mockGetRemoteOriginUrl: ReturnType<typeof mock>;
let mockSpawnAsync: ReturnType<typeof mock>;

mock.module("node:fs/promises", () => ({
  exists: (...args: unknown[]) => mockFsExists(...args),
  mkdir: (...args: unknown[]) => mockFsMkdir(...args),
}));

mock.module("./git-config-parser", () => ({
  getRemoteOriginUrl: (...args: unknown[]) => mockGetRemoteOriginUrl(...args),
}));

mock.module("@prj-conq/lib/processes", () => ({
  spawnAsync: mock(() => mockSpawnAsync),
}));

mock.module("electrobun", () => ({
  Utils: {
    paths: {
      userData: DEFAULT_USER_DATA,
    },
  },
}));

mock.module("electrobun/dist/api/bun/core/Socket", () => ({
  socketMap: {},
}));

const { cloneRepository } = await import("./git-cloner");

const createResult = (
  success: boolean,
  errorCode: number | string = 0,
  stderr = "",
) => ({
  stdout: "",
  stderr,
  errorCode,
  error: null,
  errorMessage: () => (success ? undefined : stderr),
  isSuccess: () => success,
  isFailure: () => !success,
});

describe("cloneRepository", () => {
  beforeEach(() => {
    mockFsExists = mock(async () => true);
    mockFsMkdir = mock(async () => undefined);
    mockGetRemoteOriginUrl = mock(async () =>
      Promise.resolve("https://github.com/username/repo.git"),
    );
    mockSpawnAsync = mock(() => Promise.resolve(createResult(true)));
  });

  afterEach(() => {
    mock.clearAllMocks();
  });

  it("should verify projects directory exists", async () => {
    await cloneRepository("/repo/path", "repo-name");

    expect(mockFsExists).toHaveBeenCalledWith(DEFAULT_PROJECTS_PATH);
  });

  it("should create folder when projects directory does not exist", async () => {
    mockFsExists.mockResolvedValue(false);

    await cloneRepository("/repo/path", "repo-name");

    expect(mockFsMkdir).toHaveBeenCalledWith(DEFAULT_PROJECTS_PATH);
  });

  it("should clone repository when projects directory exists", async () => {
    await cloneRepository("/repo/path", "repo-name");

    expect(mockSpawnAsync).toHaveBeenCalledWith("git", [
      "clone",
      "https://github.com/username/repo.git",
      `${DEFAULT_PROJECTS_PATH}/repo-name`,
    ]);
  });

  it("should clone repository when projects directory is created", async () => {
    mockFsExists.mockResolvedValue(false);

    await cloneRepository("/repo/path", "repo-name");

    expect(mockSpawnAsync).toHaveBeenCalledWith("git", [
      "clone",
      "https://github.com/username/repo.git",
      `${DEFAULT_PROJECTS_PATH}/repo-name`,
    ]);
  });

  it("should use custom projects path", async () => {
    await cloneRepository("/repo/path", "repo-name", "/custom/projects");

    expect(mockFsExists).toHaveBeenCalledWith("/custom/projects");
    expect(mockSpawnAsync).toHaveBeenCalledWith("git", [
      "clone",
      "https://github.com/username/repo.git",
      "/custom/projects/repo-name",
    ]);
  });

  it("should throw if git clone fails", () => {
    mockSpawnAsync.mockResolvedValue(createResult(false, 1, "clone failed"));

    expect(cloneRepository("/repo/path", "repo-name")).rejects.toThrow(
      "git clone failed 1: clone failed",
    );
  });

  it("should throw if getRemoteOriginUrl fails", () => {
    mockGetRemoteOriginUrl.mockRejectedValue(new Error("no origin"));

    expect(cloneRepository("/repo/path", "repo-name")).rejects.toThrow(
      "no origin",
    );
  });

  it("should throw if fs.exists fails", () => {
    mockFsExists.mockRejectedValue(new Error("fs.exists System error"));

    expect(cloneRepository("/repo/path", "repo-name")).rejects.toThrow(
      "fs.exists System error",
    );
  });

  it("should throw if fs.mkdir fails", () => {
    mockFsExists.mockResolvedValue(false);
    mockFsMkdir.mockRejectedValue(new Error("fs.mkdir System error"));

    expect(cloneRepository("/repo/path", "repo-name")).rejects.toThrow(
      "fs.mkdir System error",
    );
  });
});
