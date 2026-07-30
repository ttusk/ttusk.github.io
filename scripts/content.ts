#!/usr/bin/env bun
import { existsSync } from "fs";
import cac from "cac";
import prompts from "prompts";

type ContentType = "post" | "update" | "quote";

const directories: Record<ContentType, string> = {
    post: "./src/content/posts",
    update: "./src/content/updates",
    quote: "./src/content/quotes",
};

const cli = cac("content");
cli.option("--type <type>", "Content type: post, update, or quote");
cli.help();

const { options } = cli.parse();

if (options.help) {
    process.exit(0);
}

function today() {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
}

function asYaml(value: string) {
    return JSON.stringify(value);
}

function nextFilePath(type: ContentType, suffix: string) {
    const date = today();
    const safeSuffix = suffix
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "") || type;

    let number = 0;
    let filePath = "";

    do {
        const counter = number === 0 ? "" : `-${number + 1}`;
        filePath = `${directories[type]}/${date}-${safeSuffix}${counter}.md`;
        number += 1;
    } while (existsSync(filePath));

    return filePath;
}

async function chooseType(): Promise<ContentType | undefined> {
    const requestedType = options.type as string | undefined;

    if (requestedType) {
        return ["post", "update", "quote"].includes(requestedType)
            ? (requestedType as ContentType)
            : undefined;
    }

    const response = await prompts({
        type: "select",
        name: "type",
        message: "What do you want to create?",
        choices: [
            { title: "Post", value: "post" },
            { title: "Life update", value: "update" },
            { title: "Quote", value: "quote" },
        ],
    });

    return response.type;
}

async function createPost() {
    const response = await prompts([
        { type: "text", name: "title", message: "Title" },
        { type: "text", name: "description", message: "Short description (optional)" },
        { type: "text", name: "tags", message: "Tags, separated by commas (optional)" },
        { type: "confirm", name: "draft", message: "Save as draft?", initial: true },
    ]);

    if (!response.title) return;

    const tags = String(response.tags ?? "")
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean);
    const date = today();
    const lines = [
        "---",
        `title: ${asYaml(response.title)}`,
        ...(response.description ? [`description: ${asYaml(response.description)}`] : []),
        "tldr: false",
        `date: ${date}`,
        `publishDate: ${date}`,
        `draft: ${response.draft !== false}`,
        ...(tags.length > 0 ? [`tags: [${tags.map(asYaml).join(", ")}]`] : []),
        "---",
        "",
    ];

    const filePath = nextFilePath("post", response.title);
    await Bun.write(filePath, lines.join("\n"));
    console.log(`Created ${filePath}`);
}

async function createUpdate() {
    const response = await prompts({
        type: "text",
        name: "update",
        message: "Update",
    });

    if (!response.update) return;

    const filePath = nextFilePath("update", response.update);
    await Bun.write(filePath, ["---", `date: ${today()}`, `update: ${asYaml(response.update)}`, "---", ""].join("\n"));
    console.log(`Created ${filePath}`);
}

async function createQuote() {
    const response = await prompts([
        { type: "text", name: "quote", message: "Quote" },
        { type: "text", name: "author", message: "Author" },
        { type: "text", name: "source", message: "Source (optional)" },
    ]);

    if (!response.quote || !response.author) return;

    const lines = [
        "---",
        `quote: ${asYaml(response.quote)}`,
        `author: ${asYaml(response.author)}`,
        ...(response.source ? [`source: ${asYaml(response.source)}`] : []),
        "---",
        "",
    ];
    const filePath = nextFilePath("quote", response.author);
    await Bun.write(filePath, lines.join("\n"));
    console.log(`Created ${filePath}`);
}

async function main() {
    const type = await chooseType();

    if (!type) {
        console.error("Choose one of: post, update, quote.");
        process.exitCode = 1;
        return;
    }

    if (type === "post") await createPost();
    if (type === "update") await createUpdate();
    if (type === "quote") await createQuote();
}

main();
