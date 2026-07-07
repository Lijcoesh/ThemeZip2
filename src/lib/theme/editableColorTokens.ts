import type { ThemeColors, ThemeTokens } from "../../types/theme";

export type ThemeColorTokenPath =
  | { group: "brand"; token: keyof ThemeColors["brand"] }
  | { group: "background"; token: keyof ThemeColors["background"] }
  | { group: "text"; token: keyof ThemeColors["text"] }
  | { group: "border"; token: keyof ThemeColors["border"] };

export type EditableColorToken = ThemeColorTokenPath & {
  label: string;
};

export type EditableColorTokenGroup = {
  label: string;
  tokens: readonly EditableColorToken[];
};

export const editableColorTokenGroups = [
  {
    label: "Brand",
    tokens: [
      { group: "brand", token: "primary", label: "Primary" },
      { group: "brand", token: "secondary", label: "Secondary" },
      { group: "brand", token: "accent", label: "Accent" },
    ],
  },
  {
    label: "Background",
    tokens: [
      { group: "background", token: "page", label: "Page" },
      { group: "background", token: "surface", label: "Surface" },
      { group: "background", token: "muted", label: "Muted" },
    ],
  },
  {
    label: "Text",
    tokens: [
      { group: "text", token: "primary", label: "Primary" },
      { group: "text", token: "secondary", label: "Secondary" },
      { group: "text", token: "muted", label: "Muted" },
      { group: "text", token: "inverse", label: "Inverse" },
    ],
  },
  {
    label: "Border",
    tokens: [
      { group: "border", token: "default", label: "Default" },
      { group: "border", token: "strong", label: "Strong" },
    ],
  },
] as const satisfies readonly EditableColorTokenGroup[];

export function getThemeColorTokenValue(
  colors: ThemeColors,
  path: ThemeColorTokenPath,
) {
  switch (path.group) {
    case "brand":
      return colors.brand[path.token];
    case "background":
      return colors.background[path.token];
    case "text":
      return colors.text[path.token];
    case "border":
      return colors.border[path.token];
  }
}

export function updateThemeColorToken(
  theme: ThemeTokens,
  path: ThemeColorTokenPath,
  value: string,
): ThemeTokens {
  switch (path.group) {
    case "brand":
      return {
        ...theme,
        colors: {
          ...theme.colors,
          brand: {
            ...theme.colors.brand,
            [path.token]: value,
          },
        },
      };
    case "background":
      return {
        ...theme,
        colors: {
          ...theme.colors,
          background: {
            ...theme.colors.background,
            [path.token]: value,
          },
        },
      };
    case "text":
      return {
        ...theme,
        colors: {
          ...theme.colors,
          text: {
            ...theme.colors.text,
            [path.token]: value,
          },
        },
      };
    case "border":
      return {
        ...theme,
        colors: {
          ...theme.colors,
          border: {
            ...theme.colors.border,
            [path.token]: value,
          },
        },
      };
  }
}

export function isHexColorValue(value: string) {
  return /^#[0-9a-f]{6}$/i.test(value);
}
