import {
  contrastStatusLabels,
  type ContrastStatus,
  type ThemeContrastCheck,
} from "../lib/theme";

type ContrastWarningsProps = {
  checks: readonly ThemeContrastCheck[];
};

export function ContrastWarnings({ checks }: ContrastWarningsProps) {
  const summaryStatus = getSummaryStatus(checks);
  const passingCount = checks.filter((check) => check.status === "good").length;

  return (
    <section
      className={`contrast-panel is-${summaryStatus}`}
      aria-labelledby="contrast-checks-title"
      aria-live="polite"
    >
      <div className="contrast-panel-header">
        <div className="contrast-panel-copy">
          <span className="contrast-kicker">Accessibility review</span>
          <h3 id="contrast-checks-title">Contrast checks</h3>
          <p>
            Basic client-side checks for the editable semantic color pairs.
          </p>
        </div>
        <div className="contrast-panel-summary">
          <span className={`contrast-summary is-${summaryStatus}`}>
            {contrastStatusLabels[summaryStatus]}
          </span>
          <span>{formatSummaryLabel(passingCount, checks.length)}</span>
        </div>
      </div>

      <div className="contrast-list">
        {checks.map((check) => (
          <article className={`contrast-check is-${check.status}`} key={check.id}>
            <div className="contrast-check-top">
              <strong>{check.label}</strong>
              <span className={`contrast-status is-${check.status}`}>
                {contrastStatusLabels[check.status]}
              </span>
            </div>
            <p>{check.description}</p>
            <span className="contrast-ratio">{formatRatioLabel(check)}</span>
          </article>
        ))}
      </div>
    </section>
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
