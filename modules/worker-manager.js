// Spawn fresh worker for each computation to avoid stale state
let worker = new Worker('worker.js');

export function computeAsync(n, w, callback) {
  worker.terminate();
  worker = new Worker('worker.js');
  worker.onmessage = ({ data }) => callback(data);
  worker.postMessage({ n, w });
}

export function terminateWorker() {
  worker.terminate();
}
