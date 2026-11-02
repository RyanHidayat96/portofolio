type PreviewCapture = () => Promise<void>;

let pendingCapture = Promise.resolve();

export function enqueueMobileRoomPreviewCapture(capture: PreviewCapture): Promise<void> {
  const task = pendingCapture.then(async () => {
    await waitForBrowserIdle();
    await capture();
  });
  pendingCapture = task.catch(() => undefined);
  return task;
}

function waitForBrowserIdle(): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve();

  return new Promise((resolve) => {
    if (typeof window.requestIdleCallback === "function") {
      window.requestIdleCallback(() => resolve(), { timeout: 1_000 });
      return;
    }
    window.setTimeout(resolve, 16);
  });
}
