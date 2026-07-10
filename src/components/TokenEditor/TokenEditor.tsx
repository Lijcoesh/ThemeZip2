import { useId } from "react";
import Box from "@mui/material/Box";
import OutlinedInput from "@mui/material/OutlinedInput";
import { styled } from "@mui/material/styles";
import {
  editableColorTokenGroups,
  getThemeColorTokenValue,
  isHexColorValue,
  type EditableColorToken,
  type ThemeColorTokenPath,
} from "../../lib/theme";
import type { ThemeColors } from "../../types/theme";
import { chromeColors, monoFontFamily } from "../../theme/muiTheme";

type TokenEditorProps = {
  colors: ThemeColors;
  disabled?: boolean;
  onColorChange: (path: ThemeColorTokenPath, value: string) => void;
};

// Native <input type="color"> has no MUI equivalent, so it stays a real
// native input. Its swatch is rendered via vendor pseudo-elements, which
// `sx` cannot target — `styled()` can, since it emits a real CSS class.
// Border color is the per-render theme's border token (matches the
// original `var(--theme-border)`), so it's applied as an inline `style`
// override at the call site rather than baked in here statically.
const ColorSwatchInput = styled("input")({
  width: 34,
  height: 34,
  padding: 0,
  border: `1px solid ${chromeColors.border}`,
  borderRadius: 8,
  background: "transparent",
  cursor: "pointer",
  "&::-webkit-color-swatch-wrapper": {
    padding: 0,
  },
  "&::-webkit-color-swatch": {
    border: 0,
    borderRadius: 7,
  },
  "&::-moz-color-swatch": {
    border: 0,
    borderRadius: 7,
  },
  "&:focus-visible": {
    outline: "3px solid rgba(13, 122, 103, 0.28)",
    outlineOffset: "2px",
  },
});

export function TokenEditor({
  colors,
  disabled = false,
  onColorChange,
}: TokenEditorProps) {
  const editorId = useId();

  function getInputId(token: EditableColorToken) {
    return `${editorId}-${token.group}-${token.token}`;
  }

  return (
    <Box aria-label="Editable semantic color tokens" sx={{ display: "grid", gap: "16px" }}>
      <Box
        component="p"
        sx={{
          margin: 0,
          color: colors.text.secondary,
          fontSize: "0.9rem",
          lineHeight: 1.55,
        }}
      >
        Adjust suggested HEX values and the preview will update immediately.
      </Box>

      {editableColorTokenGroups.map((group) => (
        <Box
          component="fieldset"
          key={group.label}
          disabled={disabled}
          sx={{
            display: "grid",
            gap: "10px",
            minInlineSize: 0,
            margin: 0,
            padding: 0,
            border: 0,
            "&:disabled": {
              opacity: 0.72,
            },
          }}
        >
          <Box
            component="legend"
            sx={{
              color: colors.text.muted,
              fontSize: "0.76rem",
              fontWeight: 900,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
            }}
          >
            {group.label}
          </Box>

          {group.tokens.map((token) => {
            const tokenValue = getThemeColorTokenValue(colors, token);
            const isValidHex = isHexColorValue(tokenValue);

            return (
              <Box
                key={`${token.group}-${token.token}`}
                sx={{
                  display: "grid",
                  gridTemplateColumns: "34px minmax(82px, 1fr) minmax(110px, 132px)",
                  gap: "10px",
                  alignItems: "center",
                  color: colors.text.secondary,
                  fontSize: "0.925rem",
                  "@media (max-width: 520px)": {
                    gridTemplateColumns: "30px 1fr",
                  },
                }}
              >
                <ColorSwatchInput
                  type="color"
                  value={isValidHex ? tokenValue : "#000000"}
                  aria-label={`${group.label} ${token.label} color picker`}
                  disabled={disabled}
                  style={{ borderColor: colors.border.default }}
                  onChange={(event) =>
                    onColorChange(token, event.currentTarget.value)
                  }
                />

                <Box
                  component="label"
                  htmlFor={getInputId(token)}
                  sx={{
                    display: "grid",
                    gap: "2px",
                    minWidth: 0,
                    color: colors.text.secondary,
                    fontWeight: 800,
                  }}
                >
                  {token.label}
                  <Box
                    component="span"
                    sx={{
                      color: colors.text.muted,
                      fontFamily: monoFontFamily,
                      fontSize: "0.73rem",
                      fontWeight: 700,
                      overflowWrap: "anywhere",
                    }}
                  >
                    {token.group}.{token.token}
                  </Box>
                </Box>

                <OutlinedInput
                  id={getInputId(token)}
                  type="text"
                  value={tokenValue}
                  disabled={disabled}
                  onChange={(event) =>
                    onColorChange(token, event.currentTarget.value)
                  }
                  inputProps={{
                    inputMode: "text",
                    maxLength: 7,
                    pattern: "#[0-9A-Fa-f]{6}",
                    spellCheck: false,
                    "aria-invalid": !isValidHex,
                  }}
                  sx={{
                    minWidth: 0,
                    minHeight: 38,
                    borderRadius: "8px",
                    background: colors.background.page,
                    color: colors.text.primary,
                    fontFamily: monoFontFamily,
                    fontSize: "0.86rem",
                    "@media (max-width: 520px)": {
                      gridColumn: "1 / -1",
                    },
                    "& .MuiOutlinedInput-input": {
                      padding: "0 10px",
                    },
                    "& .MuiOutlinedInput-notchedOutline": {
                      borderColor: colors.border.default,
                    },
                    "&:hover .MuiOutlinedInput-notchedOutline": {
                      borderColor: colors.border.default,
                    },
                    "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                      borderColor: colors.border.default,
                    },
                    "&.Mui-focused": {
                      outlineOffset: "2px",
                    },
                    ...(!isValidHex && {
                      color: chromeColors.danger,
                      background: chromeColors.dangerSoft,
                      "& .MuiOutlinedInput-notchedOutline": {
                        borderColor: chromeColors.danger,
                      },
                      "&:hover .MuiOutlinedInput-notchedOutline": {
                        borderColor: chromeColors.danger,
                      },
                      "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                        borderColor: chromeColors.danger,
                      },
                    }),
                  }}
                />
              </Box>
            );
          })}
        </Box>
      ))}
    </Box>
  );
}
