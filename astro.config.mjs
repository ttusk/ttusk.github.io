// @ts-check
import { defineConfig } from "astro/config";
import tailwindcss from "@tailwindcss/vite";
import expressiveCode from "astro-expressive-code";
import sunbatherDark from "./src/styles/sunbather-dark.json" with { type: "json" };
import sunbatherLight from "./src/styles/sunbather-light.json" with { type: "json" };

/**
 * @typedef {import("hast").Element} HastElement
 * @typedef {import("hast").RootContent} HastContent
 * @typedef {import("hast").RootContent} HastNode
 * @typedef {import("hast").Parent} HastParent
 * @typedef {import("hast").Root} HastRoot
 */

const codeFontStack = 'Monaco, "Lucida Console", monospace';

/**
 * @param {HastNode | null | undefined} node
 */
function hasGifEmojiMarker(node) {
  return node?.type === "element" &&
    node["tagName"] === "img" &&
    typeof node["properties"]?.["alt"] === "string" &&
    node["properties"]["alt"].startsWith("gif:");
}

/**
 * @param {HastNode | null | undefined} node
 */
function isGifEmoji(node) {
  if (hasGifEmojiMarker(node)) return true;
  if (node?.type !== "element") return false;

  const className = node["properties"]["className"];
  return Array.isArray(className)
    ? className.includes("gif-emoji")
    : className === "gif-emoji";
}

/**
 * @param {HastContent} node
 */
function prepareGifEmoji(node) {
  if (node.type !== "element" || !hasGifEmojiMarker(node)) return;

  const alt = node["properties"]["alt"];
  if (typeof alt !== "string") return;

  const className = node["properties"]["className"];
  const classes = Array.isArray(className)
    ? className
    : typeof className === "string" || typeof className === "number"
      ? [className]
      : [];
  node["properties"]["className"] = [...classes, "gif-emoji"];
  node["properties"]["alt"] = alt.slice("gif:".length).trim();
}

/**
 * @param {HastNode | null | undefined} node
 */
function isWhitespaceText(node) {
  return node?.type === "text" && !node.value.trim();
}

/**
 * @param {HastNode | null | undefined} node
 * @returns {{mediaNode: HastElement, caption: string} | null}
 */
function getCaptionedImage(node) {
  if (node?.type !== "element" || node.tagName !== "p") return null;

  const children = node.children.filter((child) => !isWhitespaceText(child));
  if (children.length !== 1) return null;

  const child = children[0];
  if (child?.type === "element" && child.tagName === "img" && child["properties"]["alt"] && !isGifEmoji(child)) {
    return { mediaNode: child, caption: String(child["properties"]["alt"]) };
  }

  if (
    child?.type === "element" &&
    child.tagName === "a" &&
    child.children.length === 1
  ) {
    const image = child.children[0];
    if (image?.type === "element" && image.tagName === "img" && image["properties"]["alt"] && !isGifEmoji(image)) {
      return { mediaNode: child, caption: String(image["properties"]["alt"]) };
    }
  }

  return null;
}

/**
 * @param {HastContent} node
 * @param {HastParent} parent
 */
function visit(node, parent) {
  prepareGifEmoji(node);

  if (node.type === "element") {
    for (const child of node.children) {
      visit(child, node);
    }
  }

  const image = getCaptionedImage(node);
  if (!image) return;

  const index = parent.children.indexOf(node);
  if (index === -1) return;

  /** @type {HastElement} */
  const figure = {
    type: "element",
    tagName: "figure",
    properties: {},
    children: [
      image.mediaNode,
      {
        type: "element",
        tagName: "figcaption",
        properties: {},
        children: [{ type: "text", value: image.caption }],
      },
    ],
  };
  parent.children[index] = figure;
}

function rehypeImageCaptions() {
  /**
   * @param {HastRoot} tree
   */
  return (tree) => {
    for (const child of tree.children) {
      visit(child, tree);
    }
  };
}

export default defineConfig({
  integrations: [expressiveCode({
    themes: [sunbatherDark, sunbatherLight],
    useDarkModeMediaQuery: true,
    styleOverrides: {
      borderRadius: "0",
      codeFontFamily: codeFontStack,
      codeFontSize: "0.8rem",
    },
  })],
  vite: {
    // Astro and Tailwind expose separate Vite type instances at check time.
    // @ts-expect-error The plugin is runtime-compatible with Astro's Vite.
    plugins: [tailwindcss()],
  },
  markdown: {
    rehypePlugins: [rehypeImageCaptions],
  },
  site: "https://talkinghead.blog.br",
});
