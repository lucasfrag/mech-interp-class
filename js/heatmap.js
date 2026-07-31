// Utilitário compartilhado para renderizar heatmaps camada x posição
// usados nos slides de Activation Patching.

function intensityToColor(t) {
  const stops = [
    [0, [237, 233, 254]], // #EDE9FE — baixo efeito
    [0.5, [124, 58, 237]], // #7C3AED — efeito médio
    [1, [59, 7, 100]], // #3B0764 — efeito alto
  ];
  let a = stops[0],
    b = stops[1];
  if (t > 0.5) {
    a = stops[1];
    b = stops[2];
  }
  const localT = a === stops[0] ? t / 0.5 : (t - 0.5) / 0.5;
  const r = Math.round(a[1][0] + (b[1][0] - a[1][0]) * localT);
  const g = Math.round(a[1][1] + (b[1][1] - a[1][1]) * localT);
  const bl = Math.round(a[1][2] + (b[1][2] - a[1][2]) * localT);
  return `rgb(${r}, ${g}, ${bl})`;
}

// matrix: array de linhas indexadas de L0 (rasa, índice 0) até a mais
// profunda (índice N-1). Cada linha é um array de valores 0..1 por coluna.
function buildHeatmap(container, matrix, colLabels, opts = {}) {
  const { fragmentRows = false, rowPrefix = "L" } = opts;
  const nRows = matrix.length;

  const grid = document.createElement("div");
  grid.className = "heatmap-grid-inner";

  matrix.forEach((rowValues, rowIndex) => {
    const row = document.createElement("div");
    row.className = "heatmap-row" + (fragmentRows ? " fragment" : "");
    row.style.order = String(nRows - 1 - rowIndex);
    row.dataset.rowIndex = String(rowIndex);

    const label = document.createElement("span");
    label.className = "heatmap-row-label";
    label.textContent = rowPrefix + rowIndex;
    row.appendChild(label);

    rowValues.forEach((v) => {
      const cell = document.createElement("span");
      cell.className = "heatmap-cell";
      cell.style.background = intensityToColor(v);
      row.appendChild(cell);
    });

    grid.appendChild(row);
  });

  const colRow = document.createElement("div");
  colRow.className = "heatmap-row heatmap-col-labels";
  colRow.style.order = String(nRows);
  const spacer = document.createElement("span");
  spacer.className = "heatmap-row-label";
  colRow.appendChild(spacer);
  colLabels.forEach((c) => {
    const cl = document.createElement("span");
    cl.className = "heatmap-col-label";
    cl.textContent = c;
    colRow.appendChild(cl);
  });
  grid.appendChild(colRow);

  container.appendChild(grid);
}

// Marca uma célula específica (rowIndex, colIndex) com um anel de destaque.
function highlightCell(container, rowIndex, colIndex) {
  const row = container.querySelector(`.heatmap-row[data-row-index="${rowIndex}"]`);
  if (!row) return;
  const cell = row.querySelectorAll(".heatmap-cell")[colIndex];
  if (cell) cell.classList.add("cell-pinned");
}

// Matriz compartilhada do exemplo "The Space Needle is located in the city of"
// (Meng et al. 2022) — ilustrativa, 8 blocos de camada x 9 posições de token.
const SPACE_NEEDLE_TOKENS = [
  "The",
  "Space",
  "Needle",
  "is",
  "located",
  "in",
  "the",
  "city",
  "of",
];

const SPACE_NEEDLE_MATRIX = [
  [0.06, 0.08, 0.12, 0.06, 0.05, 0.05, 0.05, 0.06, 0.07], // L0
  [0.07, 0.1, 0.16, 0.08, 0.06, 0.05, 0.05, 0.06, 0.08], // L1
  [0.08, 0.14, 0.28, 0.1, 0.07, 0.06, 0.06, 0.07, 0.09], // L2
  [0.09, 0.22, 0.48, 0.16, 0.09, 0.07, 0.06, 0.08, 0.11], // L3
  [0.1, 0.32, 0.7, 0.24, 0.1, 0.08, 0.07, 0.09, 0.14], // L4 — early site
  [0.1, 0.28, 0.88, 0.22, 0.1, 0.08, 0.08, 0.11, 0.18], // L5 — early site (pico)
  [0.09, 0.18, 0.55, 0.16, 0.1, 0.09, 0.09, 0.16, 0.3], // L6
  [0.08, 0.12, 0.3, 0.12, 0.1, 0.1, 0.11, 0.28, 0.86], // L7 — late site (pico)
];
