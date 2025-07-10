/* eslint-disable @typescript-eslint/no-unused-vars */
// Tool: web_scrape (Markdown only, returns string)
import axios from 'axios';
import * as cheerio from 'cheerio';
import TurndownService from 'turndown';
import { CreateTool, make } from '@/plugins/_types/tools';
import * as llm from '@/server/llm';

export const config = make({
  name: 'web_scrape',
  description: `Fetches a web page by URL and returns the main content as Markdown, using Turndown for conversion. Cleans out scripts/styles for best results.`,
  usage: `- **web_scrape**: Scrape a web page and output as Markdown only.\n\nParams:\n- url (string, required): The URL to fetch.\n\nReturns only the Markdown as a string, not an object.`,
  parameters: {
    url: { type: 'string', description: 'The URL to fetch.' },
  },
});

function htmlToMarkdown(html: string): string {
  const $ = cheerio.load(html);
  $(
    'script, style, noscript, nav, footer, aside, header, .sidebar, .ads, .promo'
  ).remove();
  // Prefer main/article, else body
  let mainHtml =
    $('main').html() || $('article').html() || $('body').html() || html;
  if (!mainHtml) mainHtml = html;
  // Convert to Markdown
  const turndownService = new TurndownService({ headingStyle: 'atx' });
  const markdown = turndownService.turndown(mainHtml);
  return markdown;
}

export const createTool: CreateTool = () => {
  return llm.tool(
    config.name,
    config.description,
    config.parameters,
    async ({ url }) => {
      try {
        if (typeof url !== 'string' || !/^https?:\/\//.test(url)) {
          throw new Error(
            'Invalid or missing URL (must start with http[s]://)'
          );
        }
        // const html = await browserless_parser(url);
        // const html = await axios_parser(url);
        const html = await playwright_parser(url);
        // Clean with cheerio (remove noise)
        return htmlToMarkdown(html);
      } catch (error) {
        return typeof error === 'object' && error && 'message' in error
          ? (error as Error).message
          : String(error);
      }
    }
  );
};

/* Experimenting with different website parsers */
// async function axios_parser(url: string): Promise<string> {
//   const response = await axios.get(url, {
//     timeout: 10000,
//   });
//   const html = response.data;
//   return html;
// }

// async function browserless_parser(url: string): Promise<string> {
//   const TOKEN = process.env.BROWSERLESS_API_KEY;
//   const response = await fetch(
//     `https://production-lon.browserless.io/content?token=${TOKEN}`,
//     {
//       method: 'POST',
//       headers: {
//         'Cache-Control': 'no-cache',
//         'Content-Type': 'application/json',
//       },
//       body: JSON.stringify({
//         url: url,
//         waitForEvent: {
//           event: 'load',
//         },
//       }),
//     }
//   );

//   const content = await response.text();
//   return content;
// }

/**
 * Playwright-powered parser for dynamic web scraping
 * Requires the 'playwright' package to be installed.
 */
async function playwright_parser(url: string): Promise<string> {
  const { chromium } = await import('playwright');
  const browser = await chromium.launch({
    headless: true,
  });
  const context = await browser.newContext({});
  const page = await context.newPage();
  try {
    // wait for one minute (60 * 1000 ms) to allow the page to load
    await page.goto(url);
    // Optionally, could wait for network to be idle, or provide selector support
    const html = await page.content();
    await context.close();
    await browser.close();
    return html;
  } catch (err) {
    await context.close();
    await browser.close();
    throw err;
  }
}
