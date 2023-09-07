import { exec } from "node:child_process";
import { promisify } from "node:util";

const execAsync = promisify(exec);

export async function createChangelogFile() {
  await execAsync(`touch CHANGELOG.md`);
}

export async function writeChangelonToFile(changelog) {
  await execAsync(`echo '${changelog}' > CHANGELOG.md`);
}

export function sanitizeChangelog(changelog) {
  return changelog.map((line) => `${line.slice(9)}`);
}

export function getSplitedChangelog(changelog) {
  const addedCommits = changelog.filter((line) => line.startsWith("feat"));
  const changedCommits = changelog.filter((line) =>
    line.startsWith("refactor")
  );
  const fixedCommits = changelog.filter((line) => line.startsWith("fix"));
  const securityCommits = changelog.filter(
    (line) => line.startsWith("build") || line.startsWith("chore")
  );
  const restOfCommits = changelog.filter(
    (line) =>
      !line.startsWith("feat") &&
      !line.startsWith("refactor") &&
      !line.startsWith("fix") &&
      !line.startsWith("build") &&
      !line.startsWith("chore")
  );
  return {
    addedCommits,
    changedCommits,
    fixedCommits,
    securityCommits,
    restOfCommits,
  };
}

export function printChangelogSection(commits, types, title) {
  if (commits.length === 0) {
    return "";
  }
  let changelogSection = `### ${title}\n\n`;
  commits.forEach((line) => {
    let finalLine = line;
    types.forEach((type) => {
      finalLine = line
        .replace(`${type}(`, `[`)
        .replace(`${type}: `, ``)
        .replace("):", "]:");
    });
    changelogSection += `- ${finalLine}\n`;
  });
  changelogSection += `\n`;
  return changelogSection;
}
