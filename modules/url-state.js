export function getParamsFromUrl() {
  const p = new URLSearchParams(window.location.search);
  return {
    n: p.get('n') ?? '12',
    w: p.get('w') ?? '7',
    c: p.get('c') ?? '3'
  };
}

export function updateUrl(n, w, c, replace = false) {
  const url = new URL(window.location.href);
  url.searchParams.set('n', n);
  url.searchParams.set('w', w);
  url.searchParams.set('c', c);
  const state = { n, w, c };

  if (replace) {
    window.history.replaceState(state, '', url);
  } else {
    window.history.pushState(state, '', url);
  }
}

export function loadParamsFromUrl(nInput, wInput, cInput) {
  const { n, w, c } = getParamsFromUrl();
  nInput.value = n;
  wInput.value = w;
  cInput.value = c;
}

export function saveState(state, history, currentHistoryIndex) {
  history = history.slice(0, currentHistoryIndex + 1);
  history.push(state);
  return { history, currentHistoryIndex: history.length - 1 };
}

export function updateHistoryButtons(prevButton, nextButton, currentHistoryIndex, historyLength) {
  prevButton.disabled = currentHistoryIndex <= 0;
  nextButton.disabled = currentHistoryIndex >= historyLength - 1;
}

export function buildStatusText(state, currentHistoryIndex, historyLength) {
  return [
    `time: ${state.computeTime.toFixed(2)} ms`,
    `color modulus m: ${state.c}`,
    `ord_N(omega): ${state.order}`,
    `roots per point: ${state.order}`,
    `distinct visible: ${state.distinctCount} / ${state.n}`,
    `gcd(N, omega): ${state.gcdOmegaN}`,
    `gcd(N, omega - 1): ${state.gcdOmegaMinusOne}`,
    `gcd(colors, N): ${state.gcdColorsN}`,
    `gcd(colors, ord_N(omega)): ${state.gcdColorsOrder}`,
    `omega inverse mod N: ${state.omegaInverse}`,
    `history: ${currentHistoryIndex + 1} / ${historyLength}`
  ].join('\n');
}

export function updateColorFilterOptions(colorFilter, c, selectedColors = null) {
  colorFilter.innerHTML = '';
  for (let i = 0; i < c; i++) {
    const opt = document.createElement('option');
    opt.value = i;
    opt.textContent = `Color ${i}`;
    opt.selected = selectedColors === null || selectedColors.includes(i);
    colorFilter.appendChild(opt);
  }
}

export function getSelectedColors(colorFilter) {
  return Array.from(colorFilter.selectedOptions).map(o => Number(o.value));
}
