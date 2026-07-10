import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import type { SxProps, Theme } from "@mui/material/styles";
import {
  contrastStatusLabels,
  type ContrastStatus,
  type ThemeContrastCheck,
} from "../../lib/theme";
import { chromeColors, monoFontFamily } from "../../theme/muiTheme";

type ContrastWarningsProps = {
  checks: readonly ThemeContrastCheck[];
};

/** `.contrast-panel.is-*` border-color per status. */
const panelBorderColor: Record<ContrastStatus, string> = {
  good: "#b8dfd1",
  review: "#fde68a",
  low: "#fecaca",
};

/** `.contrast-check.is-*` border-color per status. */
const checkBorderColor: Record<ContrastStatus, string> = {
  good: "#cbe8dd",
  review: "#f6d86d",
  low: "#f6aaa6",
};

/**
 * `.contrast-summary.is-*` / `.contrast-status.is-*` pill colors — the two
 * selectors are comma-grouped in the original CSS with identical geometry
 * (only used by `pillSx` below), so one status→color map covers both.
 */
const pillColors: Record<ContrastStatus, { bg: string; border: string; color: string }> = {
  good: { bg: "#e5f4ef", border: "#b8dfd1", color: "#0d6959" },
  review: { bg: "#fffbeb", border: "#fde68a", color: "#92400e" },
  low: { bg: chromeColors.dangerSoft, border: "#fecaca", color: chromeColors.danger },
};

/**
 * Shared visual for `.contrast-summary` and `.contrast-status` (identical
 * comma-grouped rule in the original CSS: inline-flex, min-height 26,
 * padding 0 9px, font-size .75rem, font-weight 900, nowrap).
 */
function pillSx(status: ContrastStatus): SxProps<Theme> {
  const colors = pillColors[status];
  return {
    height: "auto",
    minHeight: "26px",
    width: "fit-content",
    border: `1px solid ${colors.border}`,
    backgroundColor: colors.bg,
    color: colors.color,
    fontSize: "0.75rem",
    fontWeight: 900,
    whiteSpace: "nowrap",
    "& .MuiChip-label": {
      padding: "0 9px",
    },
  };
}

export function ContrastWarnings({ checks }: ContrastWarningsProps) {
  const summaryStatus = getSummaryStatus(checks);
  const passingCount = checks.filter((check) => check.status === "good").length;

  return (
    <Paper
      component="section"
      elevation={0}
      aria-labelledby="contrast-checks-title"
      aria-live="polite"
      sx={{
        display: "grid",
        gap: "16px",
        marginBottom: "20px",
        padding: "16px",
        border: `1px solid ${panelBorderColor[summaryStatus]}`,
        background: `linear-gradient(135deg, rgba(229, 244, 239, 0.74), rgba(255, 255, 255, 0.88)), ${chromeColors.surface}`,
        color: chromeColors.ink,
      }}
    >
      <Box
        sx={{
          display: "flex",
          flexWrap: "wrap",
          gap: "16px",
          alignItems: "flex-start",
          justifyContent: "space-between",
        }}
      >
        <Box sx={{ display: "grid", gap: "4px", maxWidth: "560px" }}>
          <Typography
            component="span"
            sx={{
              color: chromeColors.primary,
              fontSize: "0.76rem",
              fontWeight: 900,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
            }}
          >
            Accessibility review
          </Typography>
          <Typography
            id="contrast-checks-title"
            component="h3"
            sx={{
              margin: 0,
              color: chromeColors.ink,
              fontSize: "1.05rem",
              fontWeight: 700,
            }}
          >
            Contrast checks
          </Typography>
          <Typography
            component="p"
            sx={{
              margin: 0,
              color: chromeColors.muted,
              fontSize: "1rem",
              fontWeight: 400,
              lineHeight: 1.5,
            }}
          >
            Basic client-side checks for the editable semantic color pairs.
          </Typography>
        </Box>
        <Box
          sx={{
            display: "grid",
            gap: "6px",
            justifyItems: "end",
            color: chromeColors.muted,
            fontSize: "0.82rem",
            fontWeight: 800,
          }}
        >
          <Chip label={contrastStatusLabels[summaryStatus]} sx={pillSx(summaryStatus)} />
          <Typography
            component="span"
            sx={{
              color: chromeColors.muted,
              fontSize: "0.82rem",
              fontWeight: 800,
            }}
          >
            {formatSummaryLabel(passingCount, checks.length)}
          </Typography>
        </Box>
      </Box>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: "10px",
        }}
      >
        {checks.map((check) => (
          <Paper
            component="article"
            elevation={0}
            key={check.id}
            sx={{
              display: "grid",
              gap: "8px",
              alignContent: "start",
              minHeight: "132px",
              padding: "12px",
              border: `1px solid ${checkBorderColor[check.status]}`,
              background: "rgba(255, 255, 255, 0.78)",
              "@media (max-width: 520px)": {
                gridTemplateColumns: "1fr",
              },
            }}
          >
            <Box
              sx={{
                display: "flex",
                gap: "10px",
                alignItems: "flex-start",
                justifyContent: "space-between",
              }}
            >
              <Typography
                component="strong"
                sx={{
                  color: chromeColors.ink,
                  fontSize: "0.92rem",
                  fontWeight: 700,
                }}
              >
                {check.label}
              </Typography>
              <Chip label={contrastStatusLabels[check.status]} sx={pillSx(check.status)} />
            </Box>
            <Typography
              component="p"
              sx={{
                margin: 0,
                color: chromeColors.muted,
                fontSize: "0.82rem",
                lineHeight: 1.45,
              }}
            >
              {check.description}
            </Typography>
            <Typography
              component="span"
              sx={{
                color: chromeColors.ink,
                fontFamily: monoFontFamily,
                fontSize: "0.76rem",
                fontWeight: 800,
              }}
            >
              {formatRatioLabel(check)}
            </Typography>
          </Paper>
        ))}
      </Box>
    </Paper>
  );
}

function getSummaryStatus(checks: readonly ThemeContrastCheck[]): ContrastStatus {
  if (checks.some((check) => check.status === "low")) {
    return "low";
  }

  if (checks.some((check) => check.status === "review")) {
    return "review";
  }

  return "good";
}

function formatSummaryLabel(passingCount: number, totalCount: number) {
  const attentionCount = totalCount - passingCount;

  if (attentionCount === 0) {
    return `${passingCount}/${totalCount} checks passing`;
  }

  return `${attentionCount} ${attentionCount === 1 ? "check" : "checks"} need attention`;
}

function formatRatioLabel(check: ThemeContrastCheck) {
  if (check.ratio === null) {
    return "Check HEX values before judging contrast.";
  }

  const prefix = check.pairs.length > 1 ? "Lowest ratio" : "Ratio";
  return `${prefix}: ${check.ratio.toFixed(2)}:1. Target: ${check.targetRatio}:1.`;
}
