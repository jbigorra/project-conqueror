import { Utils } from "electrobun";
import { cloneRepository } from "../infrastructure/git/git-cloner";

type TDeps = {
  gitClone: (
    path: string,
    repoName: string,
    projectsPath?: string,
  ) => Promise<void>;
};

export const createAddRepository = (deps: TDeps) => {
  const { gitClone } = deps;
  return async () => {
    const paths = await Utils.openFileDialog({
      canChooseFiles: false,
      canChooseDirectory: true,
      allowsMultipleSelection: false,
    });

    const path = paths?.[0]?.trim() ?? null;

    if (!path) return null; // handle dialog cancellation
    const repoName = path.split("/").pop();

    // biome-ignore lint/style/noNonNullAssertion: repoName is guaranteed to be defined
    await gitClone(path, repoName!);

    return path;
  };
};

export const addRepository = createAddRepository({ gitClone: cloneRepository });
