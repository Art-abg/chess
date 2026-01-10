import '@testing-library/jest-dom';

// Mock Web Worker
class Worker {
  constructor(stringUrl) {
    this.url = stringUrl;
    this.onmessage = () => {};
  }

  postMessage(msg) {
    // Basic echo or ignore for now
  }

  terminate() {}
}

global.Worker = Worker;
