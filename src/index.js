import { intro, outro, select } from "@clack/prompts";
import colors from "picocolors";
import { trytm } from "@bdsqqq/try";

import {
  createChangelogFile,
  getSplitedChangelog,
  printChangelogSection,
  sanitizeChangelog,
  writeChangelonToFile,
} from "./utils.js";
import { getChangedFiles, getFullChangelog, getTagList } from "./git.js";

intro(colors.magenta(`🌟 Changelog generation tool`));

const [, errorChangedFiles] = await trytm(getChangedFiles());
if (errorChangedFiles) {
  outro(colors.red("Error: Check you are in a Git repository"));
  process.exit(1);
}

const [tagList, errorTagList] = await trytm(getTagList());
if (errorTagList) {
  outro(colors.red("Error: Sorry, the tag list hasn't could be recovered"));
  process.exit(1);
}

const initialTagVersion = await select({
  message: colors.blue("1️⃣  Initial tag version"),
  options: tagList.map((tag) => ({
    value: tag,
    label: tag,
  })),
});

const finalTagVersion = await select({
  message: colors.blue("2️⃣  Target tag version"),
  options: tagList.map((tag) => ({
    value: tag,
    label: tag,
  })),
});

const [changelog, errorChangelog] = await trytm(
  getFullChangelog(initialTagVersion, finalTagVersion)
);
if (errorChangelog) {
  outro(colors.red("Error: Sorry, the changelog hasn't been generated."));
  process.exit(1);
}

const {
  addedCommits,
  changedCommits,
  fixedCommits,
  securityCommits,
  restOfCommits,
} = getSplitedChangelog(sanitizeChangelog(changelog));

const now = new Date();
const dateStr = `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}`;

let changelogToFile = `# Changelog ${dateStr} \n\n`;
changelogToFile += `## mpm-spa [${finalTagVersion.slice(1)}] \n\n`;
changelogToFile += printChangelogSection(addedCommits, ["feat"], "Added");
changelogToFile += printChangelogSection(
  changedCommits,
  ["refactor"],
  "Changed"
);
changelogToFile += printChangelogSection(fixedCommits, ["fix"], "Fixed");
changelogToFile += printChangelogSection(
  securityCommits,
  ["chore", "build"],
  "Security"
);
changelogToFile += printChangelogSection(restOfCommits, [], "Other");

const [, errorCreatedFile] = await trytm(createChangelogFile());
if (errorCreatedFile) {
  outro(colors.red("Error: The file CHANGELOG.md hasn't been created"));
  process.exit(1);
}
console.log(changelogToFile);
const [, errorWritingFile] = await trytm(writeChangelonToFile(changelogToFile));
if (errorWritingFile) {
  outro(colors.red("Error: The file CHANGELOG.md hasn't been written"));
  process.exit(1);
}

outro(colors.green(`🚀 Changelog was generated successfully`));
