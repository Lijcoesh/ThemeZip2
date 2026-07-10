import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import OutlinedInput from "@mui/material/OutlinedInput";
import Paper from "@mui/material/Paper";
import type { SxProps, Theme } from "@mui/material/styles";
import CodePreview from "./CodePreview";
import type { ThemeTokens } from "../types/theme";
import { chromeColors } from "../theme/muiTheme";

type ThemeShowcaseCardProps = {
  theme: ThemeTokens;
};

/**
 * `.theme-badge` — used twice (the top badge and the "Badge" chip inside
 * `.theme-controls`): inline-flex pill, min-height 34, radius 999 (default
 * Chip override), padding 0 12px, background `theme.colors.background.muted`,
 * color `theme.colors.brand.primary` (dynamic per invariant B), font-weight
 * 800 (default Chip override).
 */
function themeBadgeSx(theme: ThemeTokens): SxProps<Theme> {
  return {
    minHeight: "34px",
    height: "auto",
    backgroundColor: theme.colors.background.muted,
    color: theme.colors.brand.primary,
    "& .MuiChip-label": {
      padding: "0 12px",
    },
  };
}

/**
 * The `.theme-page-section` mock: badge / heading / copy / controls / card /
 * field / input, plus the embedded code preview. All colors here are bound
 * directly to the `theme` prop (invariant B) — radius/spacing/typography
 * sizing stays static, ported 1:1 from the original CSS.
 */
export default function ThemeShowcaseCard({ theme }: ThemeShowcaseCardProps) {
  return (
    <Box sx={{ display: "grid", gap: "16px", alignContent: "start" }}>
      <Chip label="React starter theme" sx={themeBadgeSx(theme)} />

      <Box
        component="h3"
        sx={{
          margin: 0,
          color: theme.colors.text.primary,
          fontSize: "1.65rem",
          fontWeight: 700,
          lineHeight: 1.15,
        }}
      >
        Semantic tokens ready for component checks.
      </Box>

      <Box
        component="p"
        sx={{
          margin: 0,
          color: theme.colors.text.secondary,
          lineHeight: 1.65,
        }}
      >
        Preview the button, card, input, badge and alert against one shared
        token set before ThemeZip exports anything.
      </Box>

      <Box
        sx={{
          display: "flex",
          flexWrap: "wrap",
          gap: "10px",
          alignItems: "center",
        }}
      >
        <Button
          type="button"
          sx={{
            border: `1px solid ${theme.colors.brand.primary}`,
            backgroundColor: theme.colors.brand.primary,
            color: theme.colors.text.inverse,
            padding: "0 18px",
            "&:hover": {
              // `.theme-button:hover` is grouped with `.button-like:hover` in
              // the original CSS and resolves to the STATIC primary-strong
              // color, not a dynamic theme token — preserved as-is.
              backgroundColor: chromeColors.primaryStrong,
              borderColor: chromeColors.primaryStrong,
            },
          }}
        >
          Preview button
        </Button>
        <Chip label="Badge" sx={themeBadgeSx(theme)} />
      </Box>

      <Paper
        elevation={0}
        sx={{
          padding: "18px",
          border: `1px solid ${theme.colors.border.default}`,
          borderRadius: "8px",
          background: theme.colors.background.surface,
          boxShadow: theme.shadows.md,
        }}
      >
        <Box
          component="h4"
          sx={{
            margin: "0 0 8px",
            color: theme.colors.text.primary,
            fontSize: "1.05rem",
            fontWeight: 700,
          }}
        >
          Card example
        </Box>
        <Box
          component="p"
          sx={{
            // `.theme-page-section p` (margin: 0; line-height: 1.65) also
            // matches this paragraph since it's a descendant of
            // `.theme-page-section`; equal-specificity tie with `.theme-card p`
            // is broken by source order, so only `color` comes from
            // `.theme-card p` while margin/line-height come from the
            // ancestor rule. Reproduced 1:1 here.
            margin: 0,
            color: theme.colors.text.muted,
            lineHeight: 1.65,
          }}
        >
          Cards use surface, border, radius and shadow tokens from the same
          generated theme object.
        </Box>

        <Box
          component="label"
          sx={{
            display: "grid",
            gap: "8px",
            marginTop: "14px",
            color: theme.colors.text.secondary,
            fontWeight: 700,
          }}
        >
          Example input
          <OutlinedInput
            type="text"
            placeholder="Preview input"
            fullWidth
            sx={{
              minHeight: "44px",
              backgroundColor: theme.colors.background.surface,
              color: theme.colors.text.primary,
              "& .MuiOutlinedInput-notchedOutline": {
                borderColor: theme.colors.border.default,
              },
              "&:hover .MuiOutlinedInput-notchedOutline": {
                borderColor: theme.colors.border.default,
              },
              "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                borderColor: theme.colors.border.default,
              },
              "& .MuiOutlinedInput-input": {
                padding: "0 12px",
                // Original `<input>` used `font: inherit`, picking up the
                // wrapping `.theme-field` label's `font-weight: 700`.
                fontWeight: 700,
              },
            }}
          />
        </Box>
      </Paper>

      <CodePreview theme={theme} variant="embedded" />
    </Box>
  );
}
