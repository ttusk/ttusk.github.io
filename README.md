# talkinghead

Site pessoal em Astro.

## Fluxo editorial

```sh
bun install
bun run content new post
bun run content status
bun run content check
bun run content publish <post>
git push origin master
```

`new post` cria um rascunho e abre `$VISUAL` ou `$EDITOR`. Use `--no-open` para criar sem abrir o editor. O comando `publish` marca o post como publicado e define `publishDate` como hoje.

Outros tipos disponíveis: `update` e `experience`.

## Desenvolvimento

```sh
bun run dev
bun run check
bun run build
```
