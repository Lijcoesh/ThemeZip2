import Box from "@mui/material/Box";
import { chromeColors, monoFontFamily } from "../theme/muiTheme";
import type { GeneratedThemeCodeFile } from "../lib/theme";

// Dark IDE-style palette local to this file-tree sidebar. Nothing else in the
// app uses this dark aesthetic, so these stay local hex literals rather than
// joining the shared chromeColors chrome tokens.
const treeBackground = "#0b1210";
const treeInk = "#dbe7e2";
const folderColor = "#a7f3d0";
const fileColor = "#b9cac5";
const treeBorder = "rgba(255, 255, 255, 0.1)";
const fileActiveBorder = "rgba(167, 243, 208, 0.24)";
const fileActiveBackground = "rgba(167, 243, 208, 0.1)";

const narrowLayoutQuery = "@media (max-width:920px)";

type CodeFileTreeProps = {
  files: readonly GeneratedThemeCodeFile[];
  selectedFileId: string;
  onFileSelect: (file: GeneratedThemeCodeFile) => void;
  embedded: boolean;
  ariaLabel: string;
};

export default function CodeFileTree({
  files,
  selectedFileId,
  onFileSelect,
  embedded,
  ariaLabel,
}: CodeFileTreeProps) {
  const fileGroups = groupFilesByFolder(files);

  return (
    <Box
      aria-label={ariaLabel}
      sx={{
        minWidth: 0,
        padding: embedded ? "10px" : "12px",
        borderRight: `1px solid ${treeBorder}`,
        background: treeBackground,
        color: treeInk,
        [narrowLayoutQuery]: {
          borderRight: 0,
          borderBottom: `1px solid ${treeBorder}`,
        },
      }}
    >
      {fileGroups.map((group) => (
        <Box sx={{ display: "grid", gap: "6px" }} key={group.folder}>
          <Box
            sx={{
              color: folderColor,
              fontFamily: monoFontFamily,
              fontSize: embedded ? "0.72rem" : "0.78rem",
              fontWeight: 900,
              padding: embedded ? "4px 6px" : "4px 8px",
            }}
          >
            {group.folder}/
          </Box>
          <Box
            sx={{
              display: "grid",
              gap: "4px",
              [narrowLayoutQuery]: {
                gridTemplateColumns: "repeat(auto-fit, minmax(132px, 1fr))",
              },
            }}
          >
            {group.files.map((file) => {
              const isSelected = file.id === selectedFileId;

              return (
                <Box
                  component="button"
                  type="button"
                  aria-pressed={isSelected}
                  key={file.id}
                  onClick={() => onFileSelect(file)}
                  sx={[
                    {
                      minHeight: embedded ? 32 : 36,
                      width: "100%",
                      border: "1px solid transparent",
                      borderRadius: "8px",
                      background: "transparent",
                      color: fileColor,
                      cursor: "pointer",
                      fontFamily: monoFontFamily,
                      fontSize: embedded ? "0.74rem" : "0.8rem",
                      fontWeight: 800,
                      padding: embedded ? "0 8px 0 12px" : "0 10px 0 18px",
                      textAlign: "left",
                      transition:
                        "background-color 180ms ease, border-color 180ms ease, color 180ms ease",
                      "&:hover": {
                        borderColor: fileActiveBorder,
                        background: fileActiveBackground,
                        color: "#ffffff",
                      },
                      "&:focus-visible": {
                        outline: `3px solid ${chromeColors.focusRing}`,
                        outlineOffset: "3px",
                      },
                    },
                    isSelected && {
                      borderColor: fileActiveBorder,
                      background: fileActiveBackground,
                      color: "#ffffff",
                    },
                  ]}
                >
                  {file.filename}
                </Box>
              );
            })}
          </Box>
        </Box>
      ))}
    </Box>
  );
}

function groupFilesByFolder(files: readonly GeneratedThemeCodeFile[]) {
  const groups = new Map<string, GeneratedThemeCodeFile[]>();

  for (const file of files) {
    const pathParts = file.path.split("/");
    const folder = pathParts.length > 1 ? pathParts[0] : ".";
    const groupFiles = groups.get(folder) ?? [];

    groupFiles.push(file);
    groups.set(folder, groupFiles);
  }

  return Array.from(groups, ([folder, groupFiles]) => ({
    folder,
    files: groupFiles,
  }));
}
