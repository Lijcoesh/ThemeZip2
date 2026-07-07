import { useMemo, useState } from "react";
import {
  generateThemeCodePreviews,
  type GeneratedThemeCodeFile,
  type ThemeCodePreviewId,
} from "../lib/theme";
import type { ThemeTokens } from "../types/theme";

type CodePreviewProps = {
  theme: ThemeTokens;
};

export function CodePreview({ theme }: CodePreviewProps) {
  const previews = useMemo(() => generateThemeCodePreviews(theme), [theme]);
  const [selectedPreviewId, setSelectedPreviewId] =
    useState<ThemeCodePreviewId>("typescript");
  const [selectedFileIds, setSelectedFileIds] = useState<
    Partial<Record<ThemeCodePreviewId, string>>
  >({});
  const selectedPreview =
    previews.find((preview) => preview.id === selectedPreviewId) ?? previews[0];
  const selectedFileId =
    selectedFileIds[selectedPreview.id] ?? selectedPreview.files[0].id;
  const selectedFile =
    selectedPreview.files.find((file) => file.id === selectedFileId) ??
    selectedPreview.files[0];
  const fileGroups = groupFilesByFolder(selectedPreview.files);

  function handleFileSelect(file: GeneratedThemeCodeFile) {
    setSelectedFileIds((currentFileIds) => ({
      ...currentFileIds,
      [selectedPreview.id]: file.id,
    }));
  }

  return (
    <section className="code-preview-section" aria-labelledby="code-preview-title">
      <div className="code-preview-header">
        <div>
          <span className="code-preview-kicker">Generated output</span>
          <h3 id="code-preview-title">Code previews</h3>
          <p>
            These client-side outputs are generated from the current token set
            and refresh as soon as color tokens change.
          </p>
        </div>
      </div>

      <div
        className="code-preview-tabs"
        role="tablist"
        aria-label="Generated code formats"
      >
        {previews.map((preview) => {
          const isSelected = preview.id === selectedPreview.id;

          return (
            <button
              className={`code-preview-tab ${isSelected ? "is-active" : ""}`}
              id={`code-preview-tab-${preview.id}`}
              type="button"
              role="tab"
              aria-selected={isSelected}
              aria-controls={`code-preview-panel-${preview.id}`}
              key={preview.id}
              onClick={() => setSelectedPreviewId(preview.id)}
            >
              {preview.title}
            </button>
          );
        })}
      </div>

      <article
        className="code-preview-panel"
        id={`code-preview-panel-${selectedPreview.id}`}
        role="tabpanel"
        aria-labelledby={`code-preview-tab-${selectedPreview.id}`}
      >
        <div className="code-preview-browser">
          <div
            className="code-file-tree"
            aria-label={`${selectedPreview.title} files`}
          >
            {fileGroups.map((group) => (
              <div className="code-file-group" key={group.folder}>
                <div className="code-file-folder">{group.folder}/</div>
                <div className="code-file-list">
                  {group.files.map((file) => {
                    const isSelected = file.id === selectedFile.id;

                    return (
                      <button
                        className={`code-file-button ${
                          isSelected ? "is-active" : ""
                        }`}
                        type="button"
                        aria-pressed={isSelected}
                        key={file.id}
                        onClick={() => handleFileSelect(file)}
                      >
                        {file.filename}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          <div className="code-preview-content">
            <div className="code-preview-meta">
              <div>
                <strong>{selectedFile.path}</strong>
                <p>{selectedPreview.description}</p>
              </div>
              <span>{selectedFile.language}</span>
            </div>

            <pre className="code-preview-block" tabIndex={0}>
              <code>{selectedFile.code}</code>
            </pre>
          </div>
        </div>
      </article>
    </section>
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
