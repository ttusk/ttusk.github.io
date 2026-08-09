// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
// import icon from "astro-icon";
import expressiveCode from 'astro-expressive-code';

const codeFontStack = 'Monaco, "Lucida Console", monospace';

function rehypeImageCaptions() {
  function hasGifEmojiMarker(node) {
    return node?.type === 'element' &&
      node.tagName === 'img' &&
      typeof node.properties?.alt === 'string' &&
      node.properties.alt.startsWith('gif:');
  }

  function isGifEmoji(node) {
    const className = node?.properties?.className;
    return hasGifEmojiMarker(node) ||
      (Array.isArray(className) ? className.includes('gif-emoji') : className === 'gif-emoji');
  }

  function prepareGifEmoji(node) {
    if (!hasGifEmojiMarker(node)) return;

    const className = node.properties.className;
    node.properties.className = [
      ...(Array.isArray(className) ? className : className ? [className] : []),
      'gif-emoji',
    ];
    node.properties.alt = node.properties.alt.slice('gif:'.length).trim();
  }

  function isWhitespaceText(node) {
    return node?.type === 'text' && !node.value.trim();
  }

  function getCaptionedImage(node) {
    if (node?.type !== 'element' || node.tagName !== 'p') return null;

    const children = (node.children || []).filter((child) => !isWhitespaceText(child));
    if (children.length !== 1) return null;

    const child = children[0];
    if (child?.type === 'element' && child.tagName === 'img' && child.properties?.alt && !isGifEmoji(child)) {
      return { mediaNode: child, caption: String(child.properties.alt) };
    }

    if (
      child?.type === 'element' &&
      child.tagName === 'a' &&
      Array.isArray(child.children) &&
      child.children.length === 1
    ) {
      const image = child.children[0];
      if (image?.type === 'element' && image.tagName === 'img' && image.properties?.alt && !isGifEmoji(image)) {
        return { mediaNode: child, caption: String(image.properties.alt) };
      }
    }

    return null;
  }

  function visit(node, parent) {
    prepareGifEmoji(node);
    if (!node || !Array.isArray(node.children)) return;

    for (const child of node.children) {
      visit(child, node);
    }

    if (!parent) return;
    const image = getCaptionedImage(node);
    if (!image) return;

    const index = parent.children.indexOf(node);
    if (index === -1) return;

    parent.children[index] = {
      type: 'element',
      tagName: 'figure',
      properties: {},
      children: [
        image.mediaNode,
        {
          type: 'element',
          tagName: 'figcaption',
          properties: {},
          children: [{ type: 'text', value: image.caption }],
        },
      ],
    };
  }

  return (tree) => visit(tree, null);
}

// https://astro.build/config
export default defineConfig({
  integrations: [expressiveCode({
    themes: ['solarized-light'],
    styleOverrides: {
      borderRadius: '0',
      codeFontFamily: codeFontStack,
      codeFontSize: '0.8rem',
    },
  })],
  vite: {
    plugins: [tailwindcss()],
  },
  markdown: {
    rehypePlugins: [rehypeImageCaptions],
  },

  site: "https://talkinghead.blog.br",
});
