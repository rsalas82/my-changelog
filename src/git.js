import { exec } from "node:child_process";
import { promisify } from "node:util";

const execAsync = promisify(exec);

function cleanStdout(stdout) {
  return stdout.trim().split("\n").filter(Boolean);
}

export async function getChangedFiles() {
  const { stdout } = await execAsync("git status --porcelain");
  return cleanStdout(stdout).map((line) => line.split(" ").at(-1));
}

export async function getFullChangelog(initialTag, finalTag) {
  const { stdout } = await execAsync(
    `git log ${initialTag}..${finalTag} --oneline --no-merges`
  );
  return cleanStdout(stdout);
}

export async function getTagList() {
  const { stdout } = await execAsync(
    "git tag --list 'v*' --sort=-version:refname"
  );
  return cleanStdout(stdout);
}
