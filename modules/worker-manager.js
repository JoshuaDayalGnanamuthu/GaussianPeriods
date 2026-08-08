// Spawn fresh worker for each computation to avoid stale state
let worker = new Worker('worker.js');
let computeTimeout = null;

// Timeout for large computations (30 seconds)
const COMPUTE_TIMEOUT_MS = 30000;

export function computeAsync(n, w, callback) {
  worker.terminate();
  worker = new Worker('worker.js');

  let completed = false;

  worker.onmessage = ({ data }) => {
    completed = true;
    clearTimeout(computeTimeout);
    callback(data);
  };

  worker.onerror = (err) => {
    completed = true;
    clearTimeout(computeTimeout);
    callback(null, new Error(`Worker error: ${err.message}`));
  };

  // Set timeout for long-running computations
  computeTimeout = setTimeout(() => {
    if (!completed) {
      completed = true;
      worker.terminate();
      callback(null, new Error(`Computation timeout exceeded (${COMPUTE_TIMEOUT_MS / 1000}s). Try different N value.`));
    }
  }, COMPUTE_TIMEOUT_MS);

  worker.postMessage({ n, w });
}

export function terminateWorker() {
  clearTimeout(computeTimeout);
  worker.terminate();
}
