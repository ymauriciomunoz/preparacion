import type { QuestionVisual as Visual } from "@/types/exam";

export function QuestionVisual({ visual }: { visual: Visual }) {
  if (visual.type === "bars") {
    const max = Math.max(...visual.values);
    return (
      <figure className="question-visual chart-visual" aria-label={visual.title}>
        <figcaption>{visual.title}</figcaption>
        <div className="bar-chart">
          {visual.values.map((value, index) => (
            <div className="bar-column" key={`${visual.labels[index]}-${value}`}>
              <span className="bar-value">{value}{visual.unit ?? ""}</span>
              <span className="bar" style={{ height: `${Math.max(10, (value / max) * 100)}%` }} />
              <span className="bar-label">{visual.labels[index]}</span>
            </div>
          ))}
        </div>
      </figure>
    );
  }

  if (visual.type === "table") {
    return (
      <figure className="question-visual table-visual">
        {visual.title && <figcaption>{visual.title}</figcaption>}
        <div className="table-scroll">
          <table>
            <thead><tr>{visual.headers.map((header) => <th key={header}>{header}</th>)}</tr></thead>
            <tbody>
              {visual.rows.map((row, rowIndex) => (
                <tr key={row.join("-")}>
                  {row.map((cell, cellIndex) => cellIndex === 0
                    ? <th scope="row" key={`${rowIndex}-${cellIndex}`}>{cell}</th>
                    : <td key={`${rowIndex}-${cellIndex}`}>{cell}</td>)}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </figure>
    );
  }

  if (visual.type === "sequence") {
    return (
      <figure className="question-visual sequence-visual" aria-label="Secuencia visual">
        {visual.items.map((item, index) => (
          <div className={`sequence-item ${index === visual.missingAt ? "missing" : ""}`} key={`${item}-${index}`}>
            {item}
          </div>
        ))}
      </figure>
    );
  }

  if (visual.type === "rectangle") {
    return (
      <figure className="question-visual geometry-visual" aria-label={`Rectángulo de ${visual.width} por ${visual.height}`}>
        <div className="rectangle-shape"><span>{visual.width}</span><b>{visual.height}</b></div>
      </figure>
    );
  }

  if (visual.type === "triangle") {
    return (
      <figure className="question-visual geometry-visual" aria-label="Triángulo rectángulo">
        <div className="triangle-shape">
          <span className="triangle-base">{visual.base}</span>
          <span className="triangle-height">{visual.height}</span>
          {visual.hypotenuse && <span className="triangle-hypotenuse">{visual.hypotenuse}</span>}
        </div>
      </figure>
    );
  }

  if (visual.type === "venn") {
    return (
      <figure className="question-visual venn-visual" aria-label="Diagrama de Venn">
        <div className="venn-circle venn-left"><span>{visual.left}</span></div>
        <div className="venn-circle venn-right"><span>{visual.right}</span></div>
        <strong>{visual.intersection}</strong>
      </figure>
    );
  }

  if (visual.type === "balance") {
    return (
      <figure className="question-visual balance-visual" aria-label="Balanza equilibrada">
        <div className="balance-items">{visual.left.map((item, index) => <span key={`l-${index}`}>{item}</span>)}</div>
        <div className="balance-beam"><span /></div>
        <div className="balance-items">{visual.right.map((item, index) => <span key={`r-${index}`}>{item}</span>)}</div>
      </figure>
    );
  }

  return (
    <figure className="question-visual coordinate-visual" aria-label="Plano cartesiano">
      <div className="coordinate-grid">
        {visual.points.map((point) => (
          <span
            className="coordinate-point"
            key={point.label}
            style={{ left: `${8 + point.x * 8}%`, bottom: `${8 + point.y * 8}%` }}
            title={`${point.label} (${point.x}, ${point.y})`}
          >
            <b>{point.label}</b>
          </span>
        ))}
      </div>
    </figure>
  );
}
