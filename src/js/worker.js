self.onmessage = function({ data: { n, w } }) {
  w %= n;
  const residuesBuf = new Int32Array(n);
  let res = 1;
  let order = 0;
  do {
    residuesBuf[order++] = res;
    res = (res * w) % n;
  } while (res !== 1);

  const residues = residuesBuf.slice(0, order);

  const cosA = new Float64Array(n);
  const sinA = new Float64Array(n);
  for (let i = 0; i < n; i++) {
    const angle = 2 * Math.PI * i / n;
    cosA[i] = Math.cos(angle);
    sinA[i] = Math.sin(angle);
  }

  const reals = new Float64Array(n);
  const imags = new Float64Array(n);
  for (let k = 0; k < n; k++) {
    let real = 0, imag = 0;
    for (const r of residues) {
      const idx = (k * r) % n;
      real += cosA[idx];
      imag += sinA[idx];
    }
    reals[k] = real;
    imags[k] = imag;
  }

  self.postMessage({ reals, imags, residues, order: residues.length },
    [reals.buffer, imags.buffer, residues.buffer]);
};