import type { ThemeTokens } from "../../../types/theme";
import { literal } from "./fileUtils";

export function generateButtonExampleOutput(tokens: ThemeTokens) {
  return `export function ButtonExample() {
  return (
    <button
      type="button"
      style={{
        minHeight: ${literal(tokens.spacing.xl)},
        border: ${literal(`1px solid ${tokens.colors.brand.primary}`)},
        borderRadius: ${literal(tokens.radius.md)},
        background: ${literal(tokens.colors.brand.primary)},
        color: ${literal(tokens.colors.text.inverse)},
        boxShadow: ${literal(tokens.shadows.sm)},
        cursor: "pointer",
        fontWeight: ${literal(tokens.typography.fontWeight.semibold)},
        padding: ${literal(`0 ${tokens.spacing.lg}`)},
      }}
    >
      Preview button
    </button>
  );
}
`;
}

export function generateCardExampleOutput(tokens: ThemeTokens) {
  return `export function CardExample() {
  return (
    <article
      style={{
        maxWidth: "420px",
        border: ${literal(`1px solid ${tokens.colors.border.default}`)},
        borderRadius: ${literal(tokens.radius.lg)},
        background: ${literal(tokens.colors.background.surface)},
        color: ${literal(tokens.colors.text.primary)},
        boxShadow: ${literal(tokens.shadows.md)},
        padding: ${literal(tokens.spacing.lg)},
      }}
    >
      <span
        style={{
          display: "inline-flex",
          borderRadius: ${literal(tokens.radius.full)},
          background: ${literal(tokens.colors.background.muted)},
          color: ${literal(tokens.colors.brand.primary)},
          fontSize: ${literal(tokens.typography.fontSize.sm)},
          fontWeight: ${literal(tokens.typography.fontWeight.bold)},
          padding: ${literal(`${tokens.spacing.xs} ${tokens.spacing.sm}`)},
        }}
      >
        ThemeZip card
      </span>
      <h2 style={{ margin: "${tokens.spacing.md} 0 ${tokens.spacing.xs}" }}>
        Generated theme starter
      </h2>
      <p style={{ margin: 0, color: ${literal(tokens.colors.text.secondary)} }}>
        Use this component to sanity-check surface, border, radius and shadow
        tokens in your React project.
      </p>
    </article>
  );
}
`;
}

export function generateFormExampleOutput(tokens: ThemeTokens) {
  return `export function FormExample() {
  return (
    <form
      style={{
        display: "grid",
        gap: ${literal(tokens.spacing.md)},
        maxWidth: "420px",
        color: ${literal(tokens.colors.text.primary)},
      }}
    >
      <label style={{ display: "grid", gap: ${literal(tokens.spacing.sm)} }}>
        Project name
        <input
          type="text"
          placeholder="Client dashboard"
          style={{
            minHeight: ${literal(tokens.spacing["2xl"])},
            border: ${literal(`1px solid ${tokens.colors.border.default}`)},
            borderRadius: ${literal(tokens.radius.md)},
            background: ${literal(tokens.colors.background.surface)},
            color: ${literal(tokens.colors.text.primary)},
            padding: ${literal(`0 ${tokens.spacing.md}`)},
          }}
        />
      </label>
      <button
        type="button"
        style={{
          minHeight: ${literal(tokens.spacing["2xl"])},
          border: 0,
          borderRadius: ${literal(tokens.radius.md)},
          background: ${literal(tokens.colors.brand.secondary)},
          color: ${literal(tokens.colors.text.inverse)},
          fontWeight: ${literal(tokens.typography.fontWeight.semibold)},
          padding: ${literal(`0 ${tokens.spacing.lg}`)},
        }}
      >
        Save theme
      </button>
    </form>
  );
}
`;
}

export function generatePreviewPageOutput(tokens: ThemeTokens) {
  return `import { ButtonExample } from "./ButtonExample";
import { CardExample } from "./CardExample";
import { FormExample } from "./FormExample";

export function PreviewPage() {
  return (
    <main
      style={{
        minHeight: "100vh",
        background: ${literal(tokens.colors.background.page)},
        color: ${literal(tokens.colors.text.primary)},
        fontFamily: ${literal(tokens.typography.fontFamily.sans)},
        padding: ${literal(tokens.spacing.xl)},
      }}
    >
      <section style={{ display: "grid", gap: ${literal(tokens.spacing.lg)} }}>
        <div>
          <p
            style={{
              margin: 0,
              color: ${literal(tokens.colors.brand.primary)},
              fontWeight: ${literal(tokens.typography.fontWeight.bold)},
            }}
          >
            ThemeZip preview
          </p>
          <h1 style={{ margin: "${tokens.spacing.sm} 0", maxWidth: "680px" }}>
            React theme starter generated from your visual reference.
          </h1>
          <p
            style={{
              maxWidth: "620px",
              color: ${literal(tokens.colors.text.secondary)},
              lineHeight: 1.65,
              margin: 0,
            }}
          >
            Copy these examples into your app to check the generated semantic
            tokens against real component states.
          </p>
        </div>
        <ButtonExample />
        <CardExample />
        <FormExample />
      </section>
    </main>
  );
}
`;
}
