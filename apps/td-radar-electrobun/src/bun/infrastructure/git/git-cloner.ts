import { spawn } from "node:child_process";
import * as fs from "node:fs/promises";
import { spawnAsync } from "@prj-conq/lib/processes";
import { Utils } from "electrobun";
import { getRemoteOriginUrl } from "./git-config-parser";

export const cloneRepository = async (
  path: string,
  repoName: string,
  projectsPath = `${Utils.paths.userData}/projects/default`,
): Promise<void> => {
  if (!(await fs.exists(projectsPath))) {
    await fs.mkdir(`${projectsPath}`);
  }

  const gitUrl = await getRemoteOriginUrl(path);

  const result = await spawnAsync({ spawn })("git", [
    "clone",
    gitUrl,
    `${projectsPath}/${repoName}`,
  ]);

  if (result.isFailure())
    throw new Error(
      `git clone failed ${result.errorCode}: ${result.errorMessage()}`,
    );
};
