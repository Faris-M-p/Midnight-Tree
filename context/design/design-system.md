# Design system

## Themes

`src/theme/` defines two themes:

| Id | Name | Scheme |
|---|---|---|
| `midnight` | Midnight | dark (default) |
| `ocean-breeze` | Ocean Breeze | light |

`ThemeProvider` applies the theme by setting CSS variables from `THEME_COLOR_TO_CSS` and `data-theme`. The stored key is `midnight.theme-id`. `ThemeToggle` switches them.

Components are supposed to use the CSS variables, not branch on theme id (`theme/types.ts` comment). Many screens still use Tailwind `slate-*` and `emerald-*` classes directly, so they do not fully follow the token set.

## Tokens

Each theme supplies: page, sidebar, header, card, surface, surfaceHover, fg, fgSecondary, fgMuted, border, accent, accentHover, accentMuted, accentFg, accentSoft, success, warning, danger, dangerFg, dangerSoft, input, inputBorder, overlay, overlayStrong, shadow, map, ring, ghostCard, ghostBorder, ghostFg.

Midnight accent is emerald `#10b981`. Page background `#020617`. Card `#0f172a`. Danger `#f43f5e`.

CSS variables are also hardcoded under `:root` and `[data-theme="midnight"]` in `src/index.css`, and again under `[data-theme="ocean-breeze"]`.

## Type

`index.css` loads Inter from Google Fonts (weights 400–700, plus italic 400). Landing headlines use `font-serif` (the browser’s serif stack). There is no custom serif file in the repo.

## Icons

`lucide-react` only. Sizes in nav and headers are typically 16.

## Radius and surfaces

Cards and inputs commonly use `rounded-xl` or `rounded-2xl`, `border-slate-800`, and `bg-slate-900` / `bg-slate-950`. Accent buttons are emerald with dark text (`bg-emerald-500`, `text-slate-950`).

## Toasts and overlays

- Toaster: Sonner via `AppToaster`
- Drawers: `DrawerPortal`, overlay `bg-overlay`, panel `bg-card`
- z-index used by the notification drawer: `z-[60]`

## Maps

Leaflet map background token is `--theme-map`.

## Not in the system

No spacing scale document, no component library package (no MUI, Chakra, or shadcn), no Figma link in the repo. **TBD** if a visual spec exists outside this workspace.
