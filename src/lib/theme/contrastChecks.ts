import type { ThemeColors } from "../../types/theme";
import { contrastRatio, hexToRgb } from "../color/colorUtils";
import {
  getThemeColorTokenValue,
  type ThemeColorTokenPath,
} from "./editableColorTokens";

const TEXT_TARGET_RATIO = 4.5;
const TEXT_REVIEW_RATIO = 3;
const BORDER_TARGET_RATIO = 3;
const BORDER_REVIEW_RATIO = 1.5;

export type ContrastStatus = "good" | "low" | "review";

export type ContrastCheckId =
  | "primary-button-text"
  | "main-text"
  | "secondary-text"
  | "surface-text"
  | "border-visibility";

export type ContrastTokenReference = {
  label: string;
  path: ThemeColorTokenPath;
  value: string;
};

export type ContrastPairResult = {
  foreground: ContrastTokenReference;
  background: ContrastTokenReference;
  ratio: number | null;
};

export type ThemeContrastCheck = {
  id: ContrastCheckId;
  label: string;
  description: string;
  status: ContrastStatus;
  ratio: number | null;
  targetRatio: number;
  reviewRatio: number;
  pairs: readonly ContrastPairResult[];
  relatedTokens: readonly ThemeColorTokenPath[];
};

export const contrastStatusLabels = {
  good: "Good contrast",
  low: "Low contrast",
  review: "Needs review",
} as const satisfies Record<ContrastStatus, string>;

export function getHexContrastRatio(firstHex: string, secondHex: string) {
  const firstRgb = hexToRgb(firstHex);
  const secondRgb = hexToRgb(secondHex);

  if (!firstRgb || !secondRgb) {
    return null;
  }

  return contrastRatio(firstRgb, secondRgb);
}

export function getContrastStatus(
  ratio: number | null,
  targetRatio: number,
  reviewRatio: number,
): ContrastStatus {
  if (ratio === null) {
    return "review";
  }

  if (ratio >= targetRatio) {
    return "good";
  }

  if (ratio >= reviewRatio) {
    return "review";
  }

  return "low";
}

export function getThemeContrastChecks(
  colors: ThemeColors,
): readonly ThemeContrastCheck[] {
  const brandPrimary = createTokenReference(colors, "Brand primary", {
    group: "brand",
    token: "primary",
  });
  const pageBackground = createTokenReference(colors, "Page background", {
    group: "background",
    token: "page",
  });
  const surfaceBackground = createTokenReference(colors, "Surface background", {
    group: "background",
    token: "surface",
  });
  const primaryText = createTokenReference(colors, "Primary text", {
    group: "text",
    token: "primary",
  });
  const secondaryText = createTokenReference(colors, "Secondary text", {
    group: "text",
    token: "secondary",
  });
  const inverseText = createTokenReference(colors, "Inverse text", {
    group: "text",
    token: "inverse",
  });
  const defaultBorder = createTokenReference(colors, "Default border", {
    group: "border",
    token: "default",
  });

  return [
    createContrastCheck({
      id: "primary-button-text",
      label: "Primary button text",
      description: "Inverse text should stay readable on the primary button color.",
      targetRatio: TEXT_TARGET_RATIO,
      reviewRatio: TEXT_REVIEW_RATIO,
      pairs: [createContrastPair(inverseText, brandPrimary)],
    }),
    createContrastCheck({
      id: "main-text",
      label: "Main text",
      description: "Primary page copy should be readable against the page background.",
      targetRatio: TEXT_TARGET_RATIO,
      reviewRatio: TEXT_REVIEW_RATIO,
      pairs: [createContrastPair(primaryText, pageBackground)],
    }),
    createContrastCheck({
      id: "secondary-text",
      label: "Secondary text",
      description:
        "Secondary page copy can be softer, but it still needs enough contrast.",
      targetRatio: TEXT_TARGET_RATIO,
      reviewRatio: TEXT_REVIEW_RATIO,
      pairs: [createContrastPair(secondaryText, pageBackground)],
    }),
    createContrastCheck({
      id: "surface-text",
      label: "Text on surface",
      description: "Primary text should remain readable inside cards and panels.",
      targetRatio: TEXT_TARGET_RATIO,
      reviewRatio: TEXT_REVIEW_RATIO,
      pairs: [createContrastPair(primaryText, surfaceBackground)],
    }),
    createContrastCheck({
      id: "border-visibility",
      label: "Border visibility",
      description:
        "Default borders should be visible against both page and surface backgrounds.",
      targetRatio: BORDER_TARGET_RATIO,
      reviewRatio: BORDER_REVIEW_RATIO,
      pairs: [
        createContrastPair(defaultBorder, pageBackground),
        createContrastPair(defaultBorder, surfaceBackground),
      ],
    }),
  ];
}

function createTokenReference(
  colors: ThemeColors,
  label: string,
  path: ThemeColorTokenPath,
): ContrastTokenReference {
  return {
    label,
    path,
    value: getThemeColorTokenValue(colors, path),
  };
}

function createContrastPair(
  foreground: ContrastTokenReference,
  background: ContrastTokenReference,
): ContrastPairResult {
  return {
    foreground,
    background,
    ratio: getHexContrastRatio(foreground.value, background.value),
  };
}

function createContrastCheck(input: {
  id: ContrastCheckId;
  label: string;
  description: string;
  targetRatio: number;
  reviewRatio: number;
  pairs: readonly ContrastPairResult[];
}): ThemeContrastCheck {
  const ratio = getLowestContrastRatio(input.pairs);

  return {
    ...input,
    ratio,
    status: getContrastStatus(ratio, input.targetRatio, input.reviewRatio),
    relatedTokens: getRelatedTokens(input.pairs),
  };
}

function getLowestContrastRatio(pairs: readonly ContrastPairResult[]) {
  if (pairs.some((pair) => pair.ratio === null)) {
    return null;
  }

  return Math.min(...pairs.map((pair) => pair.ratio ?? Number.POSITIVE_INFINITY));
}

function getRelatedTokens(pairs: readonly ContrastPairResult[]) {
  const seenTokens = new Set<string>();
  const relatedTokens: ThemeColorTokenPath[] = [];

  for (const pair of pairs) {
    for (const token of [pair.foreground.path, pair.background.path]) {
      const tokenKey = `${token.group}.${String(token.token)}`;

      if (!seenTokens.has(tokenKey)) {
        seenTokens.add(tokenKey);
        relatedTokens.push(token);
      }
    }
  }

  return relatedTokens;
}
