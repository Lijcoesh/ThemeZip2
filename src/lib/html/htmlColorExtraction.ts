import { choosePaletteColors, createPaletteColor, mixColors } from "../color/colorUtils";
import { findCssColorTokens } from "../color/cssColorParsing";
import type { ExtractedPalette, RgbColor } from "../../types/color";

type HtmlPaletteExtractionOptions = {
  colorCount?: number;
  bucketSize?: number;
};

type WeightedColorToken = {
  rgb: RgbColor;
  alpha: number;
  weight: number;
};

type ColorBucket = {
  rTotal: number;
  gTotal: number;
  bTotal: number;
  weight: number;
};

const DEFAULT_OPTIONS = {
  colorCount: 8,
  bucketSize: 20,
} satisfies Required<HtmlPaletteExtractionOptions>;

const WHITE: RgbColor = { r: 255, g: 255, b: 255 };
const LEGACY_COLOR_ATTRIBUTES = ["bgcolor", "color", "text", "link", "vlink", "alink"];
const FOREGROUND_PROPERTIES = ["color", "border-top-color", "outline-color", "fill", "stroke"];

// Declaration-frequency is a poor stand-in for on-page visual area (a brand
// color repeated across a handful of small UI elements can easily out-count
// a `body { background }` declared exactly once), so weights are tiered by
// how reliably a signal reflects a large rendered area rather than by raw
// occurrence count.
const BASE_WEIGHT = 1;
const BACKGROUND_WEIGHT = 2;
const PAGE_BACKGROUND_WEIGHT = 20;
// A <meta name="theme-color"> is an explicit, high-confidence brand-color
// signal that authors set deliberately, so it counts for several regular
// declarations when picking the semantic primary color. Kept modest so it
// nudges primary-color selection without swamping every other page color
// on pages that otherwise have very little inline/embedded CSS.
const THEME_COLOR_WEIGHT = 10;

/**
 * Builds a palette from the colors referenced in a saved HTML document: any
 * inline `style` attributes, `<style>` blocks, legacy HTML color attributes
 * (bgcolor, color, ...) and `<meta name="theme-color">`. Parsing happens via
 * an inert `DOMParser` document, so nothing in the file is rendered, no
 * scripts run and no external resources are requested.
 */
export function extractColorPaletteFromHtml(
  htmlText: string,
  options: HtmlPaletteExtractionOptions = {},
): ExtractedPalette {
  const resolvedOptions = {
    ...DEFAULT_OPTIONS,
    ...options,
  };
  const parsedDocument = new DOMParser().parseFromString(htmlText, "text/html");
  const tokens = collectWeightedColorTokens(parsedDocument);
  const visibleTokens = tokens.filter((token) => token.alpha > 0);
  const candidates = bucketColorTokens(visibleTokens, resolvedOptions.bucketSize);
  const dominant = candidates[0] ?? null;

  return {
    colors: choosePaletteColors(candidates, resolvedOptions.colorCount),
    dominant,
    totalSampleCount: tokens.length,
    matchedSampleCount: visibleTokens.length,
  };
}

function collectWeightedColorTokens(parsedDocument: Document): WeightedColorToken[] {
  const tokens: WeightedColorToken[] = [];

  parsedDocument.querySelectorAll("style").forEach((styleElement) => {
    const sheet = styleElement.sheet;

    if (sheet) {
      for (const rule of collectStyleRules(sheet.cssRules)) {
        const isPageLevel = isPageLevelSelector(rule.selectorText);
        tokens.push(...collectDeclarationTokens(rule.style, isPageLevel));
      }
    } else {
      // Fallback for the rare case the stylesheet wasn't parsed: a plain,
      // property-agnostic text scan of the block.
      for (const token of findCssColorTokens(styleElement.textContent ?? "")) {
        tokens.push({ ...token, weight: BASE_WEIGHT });
      }
    }
  });

  parsedDocument.querySelectorAll<HTMLElement>("[style]").forEach((element) => {
    const isPageLevel = isPageLevelElement(parsedDocument, element);
    tokens.push(...collectDeclarationTokens(element.style, isPageLevel));
  });

  for (const attribute of LEGACY_COLOR_ATTRIBUTES) {
    parsedDocument.querySelectorAll(`[${attribute}]`).forEach((element) => {
      const rawValue = element.getAttribute(attribute);
      const token = rawValue ? findCssColorTokens(rawValue)[0] : undefined;

      if (!token) {
        return;
      }

      const isPageLevel = attribute === "bgcolor" && isPageLevelElement(parsedDocument, element);
      const weight =
        attribute === "bgcolor" ? (isPageLevel ? PAGE_BACKGROUND_WEIGHT : BACKGROUND_WEIGHT) : BASE_WEIGHT;

      tokens.push({ ...token, weight });
    });
  }

  parsedDocument.querySelectorAll('meta[name="theme-color"]').forEach((meta) => {
    const content = meta.getAttribute("content")?.trim();
    const themeColorToken = content ? findCssColorTokens(content)[0] : undefined;

    if (themeColorToken) {
      tokens.push({ ...themeColorToken, weight: THEME_COLOR_WEIGHT });
    }
  });

  return tokens;
}

function collectStyleRules(cssRules: CSSRuleList): CSSStyleRule[] {
  const styleRules: CSSStyleRule[] = [];

  for (const rule of Array.from(cssRules)) {
    if (rule instanceof CSSStyleRule) {
      styleRules.push(rule);
    } else if (rule instanceof CSSGroupingRule) {
      styleRules.push(...collectStyleRules(rule.cssRules));
    }
  }

  return styleRules;
}

function collectDeclarationTokens(
  style: CSSStyleDeclaration,
  isPageLevel: boolean,
): WeightedColorToken[] {
  const tokens: WeightedColorToken[] = [];
  const backgroundValue = style.getPropertyValue("background-color");
  const backgroundToken = backgroundValue ? findCssColorTokens(backgroundValue)[0] : undefined;

  if (backgroundToken) {
    tokens.push({
      ...backgroundToken,
      weight: isPageLevel ? PAGE_BACKGROUND_WEIGHT : BACKGROUND_WEIGHT,
    });
  }

  for (const property of FOREGROUND_PROPERTIES) {
    const value = style.getPropertyValue(property);
    const token = value ? findCssColorTokens(value)[0] : undefined;

    if (token) {
      tokens.push({ ...token, weight: BASE_WEIGHT });
    }
  }

  return tokens;
}

function isPageLevelElement(parsedDocument: Document, element: Element) {
  return element === parsedDocument.body || element === parsedDocument.documentElement;
}

function isPageLevelSelector(selectorText: string) {
  return selectorText
    .split(",")
    .some((selectorPart) => /^\s*(html|body|:root)(?![\w-])/i.test(selectorPart));
}

function bucketColorTokens(tokens: readonly WeightedColorToken[], bucketSize: number) {
  const buckets = new Map<string, ColorBucket>();

  for (const token of tokens) {
    const rgb = token.alpha < 1 ? mixColors(WHITE, token.rgb, token.alpha) : token.rgb;
    const bucketKey = [
      Math.floor(rgb.r / bucketSize),
      Math.floor(rgb.g / bucketSize),
      Math.floor(rgb.b / bucketSize),
    ].join("-");
    const bucket = buckets.get(bucketKey) ?? {
      rTotal: 0,
      gTotal: 0,
      bTotal: 0,
      weight: 0,
    };

    bucket.rTotal += rgb.r * token.weight;
    bucket.gTotal += rgb.g * token.weight;
    bucket.bTotal += rgb.b * token.weight;
    bucket.weight += token.weight;
    buckets.set(bucketKey, bucket);
  }

  const totalWeight = Array.from(buckets.values()).reduce(
    (sum, bucket) => sum + bucket.weight,
    0,
  );

  return Array.from(buckets.values())
    .map((bucket) =>
      createPaletteColor(
        {
          r: bucket.rTotal / bucket.weight,
          g: bucket.gTotal / bucket.weight,
          b: bucket.bTotal / bucket.weight,
        },
        totalWeight === 0 ? 0 : bucket.weight / totalWeight,
      ),
    )
    .sort((first, second) => second.population - first.population);
}
