import { spawn } from "node:child_process";
import { spawnAsync } from "@prj-conq/lib/processes";

export const getRemoteOriginUrl = async (path: string): Promise<string> => {
  const configPath = `${path}/.git/config`;

  const result = await spawnAsync({ spawn })("git", [
    "config",
    "--file",
    configPath,
    "remote.origin.url",
  ]);

  if (result.isFailure()) throw new Error(".git: no config file found.");

  const url = result.stdout.trim();
  if (!url) throw new Error(".git/config: origin url is empty.");

  return url;
};
