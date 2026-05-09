#!/usr/bin/env bun
import { existsSync } from "fs";
import cac from "cac";
import prompts from "prompts";

const POSTS_DIR = "./src/content/posts";

const cli = cac("post");

cli.option("--title <title>", "Post title");
cli.option("--description <description>", "Post description");
cli.option("--draft", "Mark as draft", { default: false });
cli.option("--tldr", "Set TL;DR flag", { default: false });
cli.option("--tags <tags>", "Comma-separated tags");
cli.help();

const { options } = cli.parse();

function today() {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function generateFrontmatter(args: {
  title: string;
  description?: string;
  tldr: boolean;
  date: string;
  publishDate: string;
  draft: boolean;
  tags?: string[];
}) {
  const lines = ["---", `title: '${args.title.replace(/'/g, "\\'")}'`];

  if (args.description) {
    lines.push(`description: '${args.description.replace(/'/g, "\\'")}'`);
  }

  lines.push(`tldr: ${args.tldr}`);
  lines.push(`date: ${args.date}`);
  lines.push(`publishDate: ${args.publishDate}`);
  lines.push(`draft: ${args.draft}`);

  if (args.tags && args.tags.length > 0) {
    lines.push(`tags: [${args.tags.map((t) => `"${t}"`).join(", ")}]`);
  }

  lines.push("---", "");
  return lines.join("\n");
}

async function main() {
  let title = options.title ?? "";

  if (!title) {
    const response = await prompts({
      type: "text",
      name: "title",
      message: "Title",
    });
    title = response.title ?? "";
  }

  const date = today();
  const tags = options.tags
    ? String(options.tags)
        .split(",")
        .map((t: string) => t.trim())
    : undefined;

  let fileName = `${date}.md`;
  let filePath = `${POSTS_DIR}/${fileName}`;
  let counter = 1;

  while (existsSync(filePath)) {
    fileName = `${date}-${counter}.md`;
    filePath = `${POSTS_DIR}/${fileName}`;
    counter++;
  }

  const content = generateFrontmatter({
    title,
    description: options.description || undefined,
    tldr: options.tldr,
    date,
    publishDate: date,
    draft: options.draft,
    tags,
  });

  await Bun.write(filePath, content);
  console.log(`Created ${filePath}`);
}

main();
