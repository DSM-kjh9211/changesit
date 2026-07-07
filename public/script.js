const ROWS = 4;
const COLS = 4;
const SEAT_COUNT = ROWS * COLS;

let seatAssignments = new Array(SEAT_COUNT).fill('');

function getNamesFromInput() {
  const raw = document.getElementById('namesInput').value;
  return raw
    .split('\n')
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
}

function shuffleArray(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function shuffleSeats() {
  let names = getNamesFromInput();

  if (names.length > SEAT_COUNT) {
    alert(`최대 ${SEAT_COUNT}명까지만 배치할 수 있습니다. 앞의 ${SEAT_COUNT}명만 사용합니다.`);
    names = names.slice(0, SEAT_COUNT);
  }

  const padded = names.slice();
  while (padded.length < SEAT_COUNT) {
    padded.push('');
  }

  seatAssignments = shuffleArray(padded);
  renderGrid();
}

function resetSeats() {
  document.getElementById('namesInput').value = '';
  seatAssignments = new Array(SEAT_COUNT).fill('');
  renderGrid();
}

function renderGrid() {
  const grid = document.getElementById('seatGrid');
  grid.innerHTML = '';

  for (let i = 0; i < SEAT_COUNT; i++) {
    const seatNumber = i + 1;
    const name = seatAssignments[i] || '';

    const cell = document.createElement('div');
    cell.className = 'seat' + (name ? '' : ' empty');

    const numberEl = document.createElement('span');
    numberEl.className = 'seat-number';
    numberEl.textContent = String(seatNumber);

    const nameEl = document.createElement('span');
    nameEl.className = 'seat-name';
    nameEl.textContent = name || '빈자리';

    cell.appendChild(numberEl);
    cell.appendChild(nameEl);
    grid.appendChild(cell);
  }
}

function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function csvEscape(value) {
  if (/[",\r\n]/.test(value)) {
    return '"' + value.replace(/"/g, '""') + '"';
  }
  return value;
}

function exportCsv() {
  const rows = [['번호', '이름']];
  for (let i = 0; i < SEAT_COUNT; i++) {
    rows.push([String(i + 1), seatAssignments[i] || '']);
  }

  const csvContent = rows.map((r) => r.map(csvEscape).join(',')).join('\r\n');
  const blob = new Blob(['﻿' + csvContent], { type: 'text/csv;charset=utf-8;' });
  downloadBlob(blob, '자리배치표.csv');
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function exportPng() {
  const cellSize = 160;
  const gap = 16;
  const padding = 40;
  const titleHeight = 60;
  const blackboardHeight = 50;
  const gridGap = 20;

  const width = COLS * cellSize + (COLS - 1) * gap + padding * 2;
  const gridHeight = ROWS * cellSize + (ROWS - 1) * gap;
  const height = padding + titleHeight + blackboardHeight + gridGap + gridHeight + padding;

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, width, height);

  ctx.fillStyle = '#1f2937';
  ctx.font = 'bold 28px "Malgun Gothic", sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('자리 배치표', width / 2, padding + titleHeight / 2);

  const blackboardY = padding + titleHeight;
  ctx.fillStyle = '#2f4f3f';
  ctx.fillRect(padding, blackboardY, width - padding * 2, blackboardHeight);
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 18px "Malgun Gothic", sans-serif';
  ctx.fillText('칠판', width / 2, blackboardY + blackboardHeight / 2);

  const gridStartY = blackboardY + blackboardHeight + gridGap;

  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const idx = r * COLS + c;
      const seatNumber = idx + 1;
      const name = seatAssignments[idx] || '';
      const x = padding + c * (cellSize + gap);
      const y = gridStartY + r * (cellSize + gap);

      ctx.fillStyle = name ? '#eef2ff' : '#f3f4f6';
      roundRect(ctx, x, y, cellSize, cellSize, 12);
      ctx.fill();
      ctx.strokeStyle = '#c7d2fe';
      ctx.lineWidth = 2;
      roundRect(ctx, x, y, cellSize, cellSize, 12);
      ctx.stroke();

      ctx.fillStyle = '#4338ca';
      ctx.font = 'bold 22px "Malgun Gothic", sans-serif';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'top';
      ctx.fillText(String(seatNumber), x + 12, y + 10);

      ctx.fillStyle = name ? '#111827' : '#9ca3af';
      ctx.font = '20px "Malgun Gothic", sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(name || '빈자리', x + cellSize / 2, y + cellSize / 2 + 10);
    }
  }

  canvas.toBlob((blob) => {
    if (blob) {
      downloadBlob(blob, '자리배치표.png');
    }
  }, 'image/png');
}

document.addEventListener('DOMContentLoaded', () => {
  renderGrid();
  document.getElementById('shuffleBtn').addEventListener('click', shuffleSeats);
  document.getElementById('resetBtn').addEventListener('click', resetSeats);
  document.getElementById('exportPngBtn').addEventListener('click', exportPng);
  document.getElementById('exportCsvBtn').addEventListener('click', exportCsv);
});
