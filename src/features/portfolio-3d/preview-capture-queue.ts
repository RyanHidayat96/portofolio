interface PreviewCaptureJob {
  readonly capture: () => Promise<void>;
  readonly readyAt: number;
}

// A timeout between jobs yields to input and rendering; an idle callback alone
// cannot keep several asynchronous DOM-to-image captures from overlapping.
export function createPreviewCaptureQueue(canCapture: () => boolean) {
  const jobs = new Set<PreviewCaptureJob>();
  let timer: ReturnType<typeof setTimeout> | undefined;
  let running = false;
  let disposed = false;

  const schedule = (): void => {
    if (disposed || running || timer !== undefined || jobs.size === 0) return;
    timer = setTimeout(pump, 80);
  };

  const pump = (): void => {
    timer = undefined;
    if (disposed || running || jobs.size === 0) return;
    if (!canCapture()) {
      schedule();
      return;
    }

    const now = performance.now();
    const job = [...jobs].find((candidate) => candidate.readyAt <= now);
    if (!job) {
      schedule();
      return;
    }

    jobs.delete(job);
    running = true;
    void Promise.resolve()
      .then(job.capture)
      .catch((error: unknown) => {
        console.warn('[portfolio-3d] Initial screen preview capture failed.', error);
      })
      .finally(() => {
        running = false;
        schedule();
      });
  };

  return {
    enqueue(capture: () => Promise<void>, delayMs: number): () => void {
      if (disposed) return () => {};
      const job = { capture, readyAt: performance.now() + delayMs };
      jobs.add(job);
      schedule();
      return () => {
        jobs.delete(job);
        if (jobs.size === 0 && timer !== undefined) {
          clearTimeout(timer);
          timer = undefined;
        }
      };
    },
    dispose(): void {
      disposed = true;
      jobs.clear();
      if (timer !== undefined) clearTimeout(timer);
      timer = undefined;
    }
  };
}
