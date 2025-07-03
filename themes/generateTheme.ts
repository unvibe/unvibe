// Generate a full app.css and head font tags for a ThemeConfig, using template.app.css as template
import type { ThemeConfig } from './types';
import fs from 'fs';
import path from 'path';

/**
 * Generates an app.css string and font head tags for a ThemeConfig.
 * - appCss: CSS with variables matching ThemeConfig
 * - fontsHeadTags: array of <link rel="stylesheet"> for google fonts, or [] for local
 */
export function generateTheme(theme: ThemeConfig): {
  appCss: string;
  fontsHeadTags: string[];
} {
  const {
    fonts: { body, mono },
    ui_colors,
    base,
  } = theme;

  // Helper to build Google Fonts <link> for a family
  const googleFontLink = (family: string) =>
    `<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=${encodeURIComponent(
      family.split(',')[0].replace(/['"]/g, '').trim()
    )}:wght@100;200;300;400;500;600;700;800;900&display=swap" />`;

  // Fonts head tags: only for google fonts
  const fontsHeadTags: string[] = [];
  if (body.type === 'google') fontsHeadTags.push(googleFontLink(body.family));
  if (mono.type === 'google') {
    // Only add if it's a different family
    if (mono.family.split(',')[0] !== body.family.split(',')[0])
      fontsHeadTags.push(googleFontLink(mono.family));
    else if (body.type !== 'google')
      fontsHeadTags.push(googleFontLink(mono.family));
  }

  // 1. Read template.app.css
  const templatePath = path.join(__dirname, 'template.app.css');
  let template = '';
  try {
    template = fs.readFileSync(templatePath, 'utf-8');
  } catch (e) {
    throw new Error(
      `Failed to load template.app.css from ${templatePath}: ${e instanceof Error ? e.message : e}`
    );
  }

  // 2. Build theme vars block (with all CSS variables)
  const themeVars = [
    ':root {',
    `  color-scheme: ${base};`,
    `  --background: ${ui_colors.background[0]};`,
    `  --background-1: ${ui_colors.background[1]};`,
    `  --background-2: ${ui_colors.background[2]};`,
    `  --border: ${ui_colors.border[0]};`,
    `  --border-1: ${ui_colors.border[1]};`,
    `  --border-2: ${ui_colors.border[2]};`,
    `  --foreground: ${ui_colors.forground[1]};`,
    `  --foreground-1: ${ui_colors.forground[2]};`,
    `  --foreground-2: ${ui_colors.forground[3]};`,
    `  --font-mono: ${mono.family};`,
    '}',
    '',
  ].join('\n');

  // 3. Replace slot in template
  let appCss = template.replace(/\/\* SLOT:theme-vars \*\//, themeVars);

  // 4. Replace font-family in body selector using string replacement
  const bodyFontFamilyLine =
    "  font-family: var(--font-body, 'Prompt', Arial, Helvetica, sans-serif);";
  const customBodyFontLine = `  font-family: ${body.family};`;
  appCss = appCss.replace(bodyFontFamilyLine, customBodyFontLine);

  // Optionally, could also set font-family as a var if desired.

  return { appCss, fontsHeadTags };
}
