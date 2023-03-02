import * as fs from "fs/promises";
import * as path from "path";
import { fileURLToPath } from "url";
import { UserNode } from "./search-github-sponsorable-in-japan.mjs";
import { mdEscape, mdImg, mdLink } from "markdown-function"

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const datadir = path.join(__dirname, "../data");
const resultJSON: UserNode[] = JSON.parse(await fs.readFile(path.join(datadir, "results.json"), "utf-8"));
const escapeTable = (text?: string) => text ? text.replace(/\|/g, "｜").replace(/\r?\n/g, " ") : "";
const isAccount = (person: UserNode) => person.login !== undefined;
const persons = resultJSON.filter(isAccount).map((person) => {
    const firstPin = person.pinnedItems?.edges?.[0]?.node ?? {};
    const firstItem = firstPin.url ? mdLink({
        text: firstPin.name ?? "",
        url: firstPin.url
    }) : "<!-- no item -->"
    const firstItemDescription = firstPin.description ? mdEscape(firstPin.description ?? "") : "<!-- no description -->"
    return `## ${mdLink({
        text: `${person.name ?? ""}`,
        url: person.url,
    })}
    
| ${mdLink({ text: `@${person.login}`, url: person.url })} | <!-- bio --> |
| --- | --- |
| <img src="${person.avatarUrl}" alt="" width="40" /> | ${escapeTable(mdEscape(person.bio ?? ""))} |
| ${escapeTable(firstItem)} | ${escapeTable(firstItemDescription)} |

    `

}).join("\n\n");

const OUTPUT = `# GitHub Sponsor-able Users in Japan

This repository is a list of GitHub users who are living in Japan and are sponsor-able.

- Total: ${resultJSON.length}
- Search Results: <https://github.com/search?q=location%3AJapan++is%3Asponsorable&type=users&ref=simplesearch>

----

${persons}

}
`
const README_FILE = path.join(__dirname, "../README.md");
await fs.writeFile(README_FILE, OUTPUT);
