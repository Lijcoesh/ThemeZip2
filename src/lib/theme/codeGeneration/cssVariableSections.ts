import type { ThemeTokens } from "../../../types/theme";

type CssVariable = {
  name: string;
  value: string | number;
};

type CssVariableSection = {
  title: string;
  variables: readonly CssVariable[];
};

export function createCssVariableSections(
  tokens: ThemeTokens,
): readonly CssVariableSection[] {
  return [
    {
      title: "Brand colors",
      variables: [
        createVariable("color-brand-primary", tokens.colors.brand.primary),
        createVariable("color-brand-secondary", tokens.colors.brand.secondary),
        createVariable("color-brand-accent", tokens.colors.brand.accent),
      ],
    },
    {
      title: "Background colors",
      variables: [
        createVariable("color-background-page", tokens.colors.background.page),
        createVariable("color-background-surface", tokens.colors.background.surface),
        createVariable("color-background-muted", tokens.colors.background.muted),
      ],
    },
    {
      title: "Text colors",
      variables: [
        createVariable("color-text-primary", tokens.colors.text.primary),
        createVariable("color-text-secondary", tokens.colors.text.secondary),
        createVariable("color-text-muted", tokens.colors.text.muted),
        createVariable("color-text-inverse", tokens.colors.text.inverse),
      ],
    },
    {
      title: "Border colors",
      variables: [
        createVariable("color-border-default", tokens.colors.border.default),
        createVariable("color-border-strong", tokens.colors.border.strong),
      ],
    },
    {
      title: "Spacing",
      variables: createVariables("spacing", tokens.spacing),
    },
    {
      title: "Radius",
      variables: createVariables("radius", tokens.radius),
    },
    {
      title: "Shadows",
      variables: createVariables("shadow", tokens.shadows),
    },
    {
      title: "Typography",
      variables: [
        ...createVariables("font-family", tokens.typography.fontFamily),
        ...createVariables("font-size", tokens.typography.fontSize),
        ...createVariables("font-weight", tokens.typography.fontWeight),
      ],
    },
  ];
}

export function createTailwindVariableSections(
  tokens: ThemeTokens,
): readonly CssVariableSection[] {
  return [
    {
      title: "Colors",
      variables: [
        createVariable("color-brand-primary", tokens.colors.brand.primary),
        createVariable("color-brand-secondary", tokens.colors.brand.secondary),
        createVariable("color-brand-accent", tokens.colors.brand.accent),
        createVariable("color-background-page", tokens.colors.background.page),
        createVariable("color-background-surface", tokens.colors.background.surface),
        createVariable("color-background-muted", tokens.colors.background.muted),
        createVariable("color-text-primary", tokens.colors.text.primary),
        createVariable("color-text-secondary", tokens.colors.text.secondary),
        createVariable("color-text-muted", tokens.colors.text.muted),
        createVariable("color-text-inverse", tokens.colors.text.inverse),
        createVariable("color-border-default", tokens.colors.border.default),
        createVariable("color-border-strong", tokens.colors.border.strong),
      ],
    },
    {
      title: "Fonts",
      variables: [
        createVariable("font-sans", tokens.typography.fontFamily.sans),
        createVariable("font-heading", tokens.typography.fontFamily.heading),
        createVariable("font-mono", tokens.typography.fontFamily.mono),
      ],
    },
    {
      title: "Text sizes",
      variables: createVariables("text", tokens.typography.fontSize),
    },
    {
      title: "Font weights",
      variables: createVariables("font-weight", tokens.typography.fontWeight),
    },
    {
      title: "Spacing",
      variables: createVariables("spacing", tokens.spacing),
    },
    {
      title: "Radius",
      variables: createVariables("radius", tokens.radius),
    },
    {
      title: "Shadows",
      variables: createVariables("shadow", tokens.shadows),
    },
  ];
}

export function createVariables<T extends object>(
  prefix: string,
  tokens: T,
): readonly CssVariable[] {
  return typedEntries(tokens).map(([tokenName, value]) =>
    createVariable(`${prefix}-${toKebabCase(String(tokenName))}`, String(value)),
  );
}

export function createVariable(name: string, value: string | number): CssVariable {
  return {
    name: `--${name}`,
    value,
  };
}

export function formatCssOutput(
  selector: string,
  sections: readonly CssVariableSection[],
) {
  const sectionBlocks = sections
    .map((section) => {
      const variables = section.variables
        .map((variable) => `  ${variable.name}: ${variable.value};`)
        .join("\n");

      return `  /* ${section.title} */\n${variables}`;
    })
    .join("\n\n");

  return `${selector} {
${sectionBlocks}
}`;
}

export function typedEntries<T extends object>(value: T) {
  return Object.entries(value) as Array<[keyof T, T[keyof T]]>;
}

export function toKebabCase(value: string) {
  return value.replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase();
}
