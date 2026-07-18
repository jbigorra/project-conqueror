import { spawn } from "node:child_process";
import * as fs from "node:fs/promises";
import { resolve } from "node:path";
import { spawnAsync } from "@prj-conq/lib/processes";
import { BrowserView, Utils } from "electrobun";
import type { AppRPC } from "../../shared/types";

async function getRemoteOriginUrl(path: string): Promise<string> {
  const gitDir = resolve(`${path}/.git`);
  const configPath = await resolveConfigPath(gitDir);

  const text = Bun.file(configPath);
  if (!text.exists())
    throw new Error(`${configPath}: No such file or directory`);

  const content = await text.text();
  if (!content.trim()) throw new Error(`${configPath} is empty`);

  return parseOriginUrl(content);
}

async function resolveConfigPath(path: string): Promise<string> {
  if (!(await fs.exists(path)))
    throw new Error(`${path}: No such file or directory`);

  const stats = await fs.stat(path);

  if (!stats.isDirectory()) throw new Error(`${path}: Not a directory`);

  return `${path}/config`;
}

function parseOriginUrl(config: string): string {
  // Match [remote "origin"] section and extract first url key
  const sectionMatch = config.match(/\[remote\s+"?origin"?\]\s*\n([^[]*)/);
  if (!sectionMatch)
    throw new Error(".git/config: No origin section found. Can't clone.");

  const body = sectionMatch[1];
  const urlMatch = body.match(/^\s*url\s*=\s*(.+)/m);
  if (!urlMatch)
    throw new Error(
      ".git/config: No url found in origin section. Can't clone.",
    );

  return urlMatch?.[1]?.trim();
}

async function cloneRepository(
  gitUrl: string,
  repoName: string,
  projectsPath = `${Utils.paths.userData}/projects/default`,
) {
  if (!(await fs.exists(projectsPath))) {
    await fs.mkdir(`${projectsPath}`);
  }

  const result = await spawnAsync({ spawn })("git", [
    "clone",
    gitUrl,
    `${projectsPath}/${repoName}`,
  ]);

  if (result.isFailure())
    throw new Error(
      `git clone failed ${result.errorCode}: ${result.errorMessage()}`,
    );
}

export const rpc = BrowserView.defineRPC<AppRPC>({
  handlers: {
    requests: {
      openFolderDialog: async () => {
        const paths = await Utils.openFileDialog({
          canChooseFiles: false,
          canChooseDirectory: true,
          allowsMultipleSelection: false,
        });

        const path = paths?.[0]?.trim() ?? null;

        if (!path) return null; // handle dialog cancellation

        const gitUrl = await getRemoteOriginUrl(path);

        const repoName = gitUrl.split("/").pop();
        // biome-ignore lint/style/noNonNullAssertion: repoName is guaranteed to be defined by getRemoteOriginUrl
        await cloneRepository(gitUrl, repoName!);

        return path;
      },
    },
    messages: {},
  },
});
