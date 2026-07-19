import { beforeEach, describe, expect, it, mock } from "bun:test";

let mockOpenFileDialog: ReturnType<typeof mock>;

mock.module("electrobun", () => ({
  Utils: {
    openFileDialog: (...args: unknown[]) => mockOpenFileDialog(...args),
  },
}));

mock.module("electrobun/dist/api/bun/core/Socket", () => ({
  socketMap: {},
}));

const { createAddRepository } = await import("./add-repository.action");

describe("createAddRepository", () => {
  let mockGitClone: ReturnType<typeof mock>;

  beforeEach(() => {
    mockOpenFileDialog = mock(async () => ["/repo/path"]);
    mockGitClone = mock(async () => undefined);
  });

  it("should return null when dialog is cancelled", async () => {
    mockOpenFileDialog.mockResolvedValue([]);

    const addRepository = createAddRepository({ gitClone: mockGitClone });
    const result = await addRepository();

    expect(result).toBeNull();
  });

  it("should call gitClone with path and repoName", async () => {
    const addRepository = createAddRepository({ gitClone: mockGitClone });
    await addRepository();

    expect(mockGitClone).toHaveBeenCalledWith("/repo/path", "path");
  });

  it("should return the selected path", async () => {
    const addRepository = createAddRepository({ gitClone: mockGitClone });
    const result = await addRepository();

    expect(result).toBe("/repo/path");
  });

  it("should trim the selected path", async () => {
    mockOpenFileDialog.mockResolvedValue(["  /repo/path  "]);

    const addRepository = createAddRepository({ gitClone: mockGitClone });
    const result = await addRepository();

    expect(result).toBe("/repo/path");
    expect(mockGitClone).toHaveBeenCalledWith("/repo/path", "path");
  });

  it("should throw if gitClone fails", () => {
    mockGitClone.mockRejectedValue(new Error("clone failed"));

    const addRepository = createAddRepository({ gitClone: mockGitClone });

    expect(addRepository()).rejects.toThrow("clone failed");
  });

  it("should throw if openFileDialog fails", () => {
    mockOpenFileDialog.mockRejectedValue(new Error("open failed"));

    const addRepository = createAddRepository({ gitClone: mockGitClone });

    expect(addRepository()).rejects.toThrow("open failed");
  });
});
