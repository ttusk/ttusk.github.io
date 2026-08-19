#!/usr/bin/env bun
import { existsSync, readdirSync } from "fs";
import cac from "cac";
import prompts from "prompts";
import kleur from "kleur";
import figures from "prompts/lib/util/figures.js";

kleur.enabled = true;

Object.assign(figures, {
    arrowUp: "^",
    arrowDown: "v",
    arrowLeft: "<",
    arrowRight: ">",
    radioOn: "(*)",
    radioOff: "( )",
    tick: "OK",
    cross: "X",
    ellipsis: "...",
    pointerSmall: ">",
    line: "-",
    pointer: ">",
});

type ContentType = "post" | "update" | "quote" | "gallery" | "experience";
type GalleryKind = "image" | "video";
type Draft = Record<string, unknown>;
type PromptQuestion = {
    name: string;
    message: string;
    [key: string]: unknown;
};
type PromptContext = {
    value: unknown;
    msg: string;
    done: boolean;
    rendered?: string;
};

const directories: Record<ContentType, string> = {
    post: "./src/content/posts",
    update: "./src/content/updates",
    quote: "./src/content/quotes",
    gallery: "./src/content/gallery",
    experience: "./src/content/experiences",
};

const cli = cac("content");
cli.option(
    "--type <type>",
    "Tipo: post, update, quote, gallery ou experience",
);
cli.help((sections) =>
    sections.map((section) => ({
        ...section,
        body: section.body.replace("Display this message", "Exibir esta ajuda"),
    })),
);

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

function safeSuffix(suffix: string, fallback: string) {
    return suffix
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "") || fallback;
}

function previewBlock(lines: string[]) {
    return [
        "",
        "  +-- previa",
        ...lines.map((line) => `  | ${line}`),
        "  +--",
    ].join("\n");
}

async function askWithPreview(
    questions: PromptQuestion[],
    renderPreview: Preview,
) {
    const answers: Draft = {};
    const decoratedQuestions = questions.map((question) => ({
        ...question,
        onRender(this: PromptContext) {
            const draft = { ...answers, [question.name]: this.value };
            const activeMessage = `\u001b[36m${question.message}\u001b[39m`;
            this.msg = this.done
                ? question.message
                : `${activeMessage}${previewBlock(renderPreview(draft))}`;
        },
    }));

    return prompts(decoratedQuestions, {
        onSubmit(question: PromptQuestion, answer: unknown) {
            answers[question.name] = answer;
        },
    });
}

function nextFilePath(type: ContentType, suffix: string) {
    const safe = safeSuffix(suffix, type);

    if (type === "gallery" || type === "experience") {
        const largestNumber = readdirSync(directories[type]).reduce((largest, file) => {
            const match = file.match(/^(\d+)-/);
            return Math.max(largest, match ? Number(match[1]) : 0);
        }, 0);

        let number = largestNumber + 1;
        let filePath = "";
        do {
            filePath = `${directories[type]}/${String(number).padStart(2, "0")}-${safe}.md`;
            number += 1;
        } while (existsSync(filePath));
        return filePath;
    }

    const date = today();
    let number = 0;
    let filePath = "";
    do {
        const counter = number === 0 ? "" : `-${number + 1}`;
        filePath = `${directories[type]}/${date}-${safe}${counter}.md`;
        number += 1;
    } while (existsSync(filePath));

    return filePath;
}

function previewPost(draft: Draft) {
    return [
        `title: ${asYaml(String(draft.title ?? ""))}`,
        `description: ${asYaml(String(draft.description ?? ""))}`,
        `tags: ${String(draft.tags ?? "") || "[]"}`,
        `draft: ${draft.draft === undefined ? "true" : String(draft.draft)}`,
    ];
}

function previewUpdate(draft: Draft) {
    return [
        `date: ${today()}`,
        `update: ${asYaml(String(draft.update ?? ""))}`,
        "corpo:",
        String(draft.description ?? ""),
    ];
}

function previewQuote(draft: Draft) {
    return [
        `quote: ${asYaml(String(draft.quote ?? ""))}`,
        `author: ${asYaml(String(draft.author ?? ""))}`,
        `source: ${asYaml(String(draft.source ?? ""))}`,
    ];
}

function previewGallery(draft: Draft) {
    const kind = String(draft.kind ?? "image");
    const common = [
        `kind: ${kind}`,
        `title: ${asYaml(String(draft.title ?? ""))}`,
        `description: ${asYaml(String(draft.description ?? ""))}`,
    ];

    if (kind === "image") {
        return [
            ...common,
            `alt: ${asYaml(String(draft.alt ?? ""))}`,
            `image: ../../assets/gallery/${String(draft.filename ?? "")}`,
        ];
    }

    return [
        ...common,
        `sourceUrl: ${String(draft.sourceUrl ?? "")}`,
    ];
}

function previewExperience(draft: Draft) {
    const bullets = String(draft.bullets ?? "")
        .split("\n")
        .map((bullet) => bullet.trim())
        .filter(Boolean);

    return [
        `organization: ${asYaml(String(draft.organization ?? ""))}`,
        `title: ${asYaml(String(draft.title ?? ""))}`,
        `period: ${asYaml(String(draft.period ?? ""))}`,
        "bullets:",
        ...bullets.map((bullet) => `  - ${bullet}`),
    ];
}

async function chooseType(): Promise<ContentType | undefined> {
    const aliases: Record<string, ContentType> = {
        post: "post",
        postagem: "post",
        update: "update",
        atualizacao: "update",
        quote: "quote",
        citacao: "quote",
        gallery: "gallery",
        galeria: "gallery",
        experience: "experience",
        experiencia: "experience",
    };
    const requestedType = String(options.type ?? "").toLowerCase();

    if (requestedType) {
        return aliases[requestedType];
    }

    const response = await prompts({
        type: "select",
        name: "type",
        message: "O que voce quer criar?",
        hint: "- Use as setas. Pressione Enter para confirmar.",
        choices: [
            { title: "Post", value: "post" },
            { title: "Atualizacao de vida", value: "update" },
            { title: "Citacao", value: "quote" },
            { title: "Item da galeria", value: "gallery" },
            { title: "Experiencia profissional", value: "experience" },
        ],
    });

    return response.type;
}

async function createPost() {
    const response = await askWithPreview([
        { type: "text", name: "title", message: "Titulo" },
        { type: "text", name: "description", message: "Descricao curta (opcional)" },
        { type: "text", name: "tags", message: "Tags separadas por virgula (opcional)" },
        { type: "confirm", name: "draft", message: "Salvar como rascunho?", initial: true },
    ], previewPost);

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
    console.log(`Criado: ${filePath}`);
}

async function createUpdate() {
    const response = await askWithPreview([
        { type: "text", name: "update", message: "Atualizacao" },
        { type: "text", name: "description", message: "Corpo da atualizacao (opcional)" },
    ], previewUpdate);

    if (!response.update) return;

    const filePath = nextFilePath("update", response.update);
    await Bun.write(filePath, ["---", `date: ${today()}`, `update: ${asYaml(response.update)}`, "---", "", response.description ?? "", ""].join("\n"));
    console.log(`Criado: ${filePath}`);
}

async function createQuote() {
    const response = await askWithPreview([
        { type: "text", name: "quote", message: "Citacao" },
        { type: "text", name: "author", message: "Autor" },
        { type: "text", name: "source", message: "Fonte (opcional)" },
    ], previewQuote);

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
    console.log(`Criado: ${filePath}`);
}

function splitBullets(value: string) {
    return String(value ?? "")
        .split("\n")
        .map((bullet) => bullet.trim())
        .filter(Boolean);
}

function youtubeThumbnail(sourceUrl: string) {
    try {
        const url = new URL(sourceUrl);
        const videoId = url.hostname === "youtu.be"
            ? url.pathname.slice(1)
            : url.searchParams.get("v");
        return videoId ? `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg` : "";
    } catch {
        return "";
    }
}

async function createGallery() {
    const kindResponse = await askWithPreview([
        {
            type: "select",
            name: "kind",
            message: "Qual tipo de item?",
            hint: "- Use as setas. Pressione Enter para confirmar.",
            choices: [
                { title: "Imagem", value: "image" },
                { title: "Link de video", value: "video" },
            ],
        },
    ], previewGallery);
    const kind = kindResponse.kind as GalleryKind | undefined;
    if (!kind) return;

    const response = await askWithPreview([
        { type: "text", name: "title", message: "Titulo" },
        { type: "text", name: "description", message: "Descricao" },
    ], (draft) => previewGallery({ kind, ...draft }));
    if (!response.title || !response.description) return;

    let lines: string[];
    if (kind === "image") {
        const image = await askWithPreview([
            {
                type: "text",
                name: "filename",
                message: "Nome do arquivo em src/assets/gallery",
            },
            { type: "text", name: "alt", message: "Texto alternativo" },
        ], (draft) => previewGallery({ ...response, kind, ...draft }));
        const filename = String(image.filename ?? "").trim();
        const assetPath = `./src/assets/gallery/${filename}`;
        if (!filename || filename.includes("/") || !existsSync(assetPath)) {
            console.error(`Arquivo nao encontrado: ${assetPath}`);
            process.exitCode = 1;
            return;
        }
        if (!image.alt) return;

        lines = [
            "---",
            "kind: image",
            `title: ${asYaml(response.title)}`,
            `description: ${asYaml(response.description)}`,
            `alt: ${asYaml(image.alt)}`,
            `image: ${asYaml(`../../assets/gallery/${filename}`)}`,
            "---",
            "",
        ];
    } else {
        const video = await askWithPreview([
            { type: "text", name: "sourceUrl", message: "URL do video" },
        ], (draft) => previewGallery({ ...response, kind, ...draft }));
        const sourceUrl = String(video.sourceUrl ?? "").trim();
        const thumbnailUrl = youtubeThumbnail(sourceUrl);
        if (!sourceUrl || !thumbnailUrl) {
            console.error("Informe uma URL valida de um video do YouTube.");
            process.exitCode = 1;
            return;
        }

        lines = [
            "---",
            "kind: video",
            `title: ${asYaml(response.title)}`,
            `description: ${asYaml(response.description)}`,
            `thumbnailUrl: ${asYaml(thumbnailUrl)}`,
            `sourceUrl: ${asYaml(sourceUrl)}`,
            "---",
            "",
        ];
    }

    const filePath = nextFilePath("gallery", response.title);
    await Bun.write(filePath, lines.join("\n"));
    console.log(`Criado: ${filePath}`);
}

async function createExperience() {
    const response = await askWithPreview([
        { type: "text", name: "organization", message: "Organizacao" },
        { type: "text", name: "title", message: "Cargo ou projeto" },
        { type: "text", name: "period", message: "Periodo" },
        {
            type: "text",
            name: "bullets",
            message: "Topicos (um por linha)",
        },
    ], previewExperience);
    const bullets = splitBullets(response.bullets);

    if (!response.organization || !response.title || !response.period || bullets.length === 0) return;

    const lines = [
        "---",
        `title: ${asYaml(response.title)}`,
        `organization: ${asYaml(response.organization)}`,
        `period: ${asYaml(response.period)}`,
        "bullets:",
        ...bullets.map((bullet) => `    - ${asYaml(bullet)}`),
        "---",
        "",
    ];
    const filePath = nextFilePath("experience", response.organization);
    await Bun.write(filePath, lines.join("\n"));
    console.log(`Criado: ${filePath}`);
}

async function main() {
    const type = await chooseType();

    if (!type) {
        console.error("Escolha um tipo: post, update, quote, gallery ou experience.");
        process.exitCode = 1;
        return;
    }

    if (type === "post") await createPost();
    if (type === "update") await createUpdate();
    if (type === "quote") await createQuote();
    if (type === "gallery") await createGallery();
    if (type === "experience") await createExperience();
}

main();
