import { useId } from "react";
import {
  editableColorTokenGroups,
  getThemeColorTokenValue,
  isHexColorValue,
  type EditableColorToken,
  type ThemeColorTokenPath,
} from "../lib/theme";
import type { ThemeColors } from "../types/theme";

type TokenEditorProps = {
  colors: ThemeColors;
  disabled?: boolean;
  onColorChange: (path: ThemeColorTokenPath, value: string) => void;
};

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
    <div className="token-editor" aria-label="Editable semantic color tokens">
      <p className="token-editor-intro">
        Adjust suggested HEX values and the preview will update immediately.
      </p>

      {editableColorTokenGroups.map((group) => (
        <fieldset className="token-group" key={group.label} disabled={disabled}>
          <legend className="token-group-title">{group.label}</legend>

          {group.tokens.map((token) => {
            const tokenValue = getThemeColorTokenValue(colors, token);
            const isValidHex = isHexColorValue(tokenValue);

            return (
              <div className="token-row" key={`${token.group}-${token.token}`}>
                <input
                  className="token-color-input"
                  type="color"
                  value={isValidHex ? tokenValue : "#000000"}
                  aria-label={`${group.label} ${token.label} color picker`}
                  onChange={(event) =>
                    onColorChange(token, event.currentTarget.value)
                  }
                />

                <label className="token-label" htmlFor={getInputId(token)}>
                  {token.label}
                  <span>
                    {token.group}.{token.token}
                  </span>
                </label>

                <input
                  id={getInputId(token)}
                  className="token-value-input"
                  type="text"
                  value={tokenValue}
                  inputMode="text"
                  maxLength={7}
                  pattern="#[0-9A-Fa-f]{6}"
                  spellCheck={false}
                  aria-invalid={!isValidHex}
                  onChange={(event) =>
                    onColorChange(token, event.currentTarget.value)
                  }
                />
              </div>
            );
          })}
        </fieldset>
      ))}
    </div>
  );
}
