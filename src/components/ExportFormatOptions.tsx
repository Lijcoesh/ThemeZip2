import Box from "@mui/material/Box";
import Checkbox from "@mui/material/Checkbox";
import Typography from "@mui/material/Typography";
import { chromeColors, monoFontFamily } from "../theme/muiTheme";
import type {
  ThemeExportFormatId,
  ThemeExportFormatOption,
} from "../lib/export/exportFormats";

type ExportFormatOptionsProps = {
  options: readonly ThemeExportFormatOption[];
  selectedFormats: readonly ThemeExportFormatId[];
  onToggle: (formatId: ThemeExportFormatId) => void;
  disabled?: boolean;
};

export default function ExportFormatOptions({
  options,
  selectedFormats,
  onToggle,
  disabled = false,
}: ExportFormatOptionsProps) {
  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
        gap: "10px",
      }}
    >
      {options.map((option) => {
        const isSelected = selectedFormats.includes(option.id);
        const isLastSelected = isSelected && selectedFormats.length === 1;

        return (
          <Box
            component="label"
            key={option.id}
            sx={{
              display: "grid",
              gridTemplateColumns: "20px 1fr",
              gap: "10px",
              minWidth: 0,
              padding: "12px",
              border: `1px solid ${isSelected ? "#b8dfd1" : chromeColors.border}`,
              borderRadius: "8px",
              background: isSelected ? "#f0faf6" : chromeColors.page,
              cursor: disabled ? "default" : "pointer",
              opacity: disabled ? 0.72 : 1,
              transition: "background-color 180ms ease, border-color 180ms ease",
            }}
          >
            <Checkbox
              checked={isSelected}
              disabled={disabled || isLastSelected}
              onChange={() => onToggle(option.id)}
              sx={{ marginTop: "2px" }}
            />

            <Box sx={{ display: "grid", gap: "5px", minWidth: 0 }}>
              <Typography
                component="strong"
                sx={{
                  color: chromeColors.ink,
                  fontSize: "0.92rem",
                  fontWeight: 700,
                }}
              >
                {option.label}
              </Typography>
              <Typography
                component="small"
                sx={{
                  color: chromeColors.muted,
                  // The original markup never sets a font-size on <small> in
                  // App.css — it relies on the browser's UA-default `small {
                  // font-size: smaller }` rule. MUI's Typography variant class
                  // would otherwise force 1rem and override that UA rule, so
                  // the "smaller" keyword is set explicitly here to reproduce
                  // the exact same browser-computed value 1:1 (not an
                  // approximation — "smaller" is a valid CSS value).
                  fontSize: "smaller",
                  lineHeight: 1.45,
                }}
              >
                {option.description}
              </Typography>
              <Typography
                component="code"
                sx={{
                  color: chromeColors.primary,
                  fontFamily: monoFontFamily,
                  fontSize: "0.72rem",
                  fontWeight: 800,
                  overflowWrap: "anywhere",
                }}
              >
                {option.fileHint}
              </Typography>
            </Box>
          </Box>
        );
      })}
    </Box>
  );
}
