import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createPreviewCaptureQueue } from '../../src/features/portfolio-3d/preview-capture-queue';

beforeEach(() => vi.useFakeTimers());
afterEach(() => {
  vi.clearAllTimers();
  vi.useRealTimers();
  vi.restoreAllMocks();
});

describe('initial monitor preview queue', () => {
  it('runs nine slow captures one at a time, yielding between jobs', async () => {
    const queue = createPreviewCaptureQueue(() => true);
    let concurrent = 0;
    let maximumConcurrent = 0;
    let completed = 0;
    const capture = vi.fn(async () => {
      concurrent += 1;
      maximumConcurrent = Math.max(maximumConcurrent, concurrent);
      await new Promise((resolve) => setTimeout(resolve, 600));
      concurrent -= 1;
      completed += 1;
    });
    for (let index = 0; index < 9; index++) queue.enqueue(capture, index * 420);
    await vi.advanceTimersByTimeAsync(8000);
    expect(completed).toBe(9);
    expect(maximumConcurrent).toBe(1);
    expect(vi.getTimerCount()).toBe(0);
    queue.dispose();
  });

  it('waits through camera movement and checks again before the next capture', async () => {
    let idle = false;
    const queue = createPreviewCaptureQueue(() => idle);
    const first = vi.fn(async () => { idle = false; });
    const second = vi.fn(async () => {});
    queue.enqueue(first, 0);
    queue.enqueue(second, 0);
    await vi.advanceTimersByTimeAsync(1000);
    expect(first).not.toHaveBeenCalled();
    idle = true;
    await vi.advanceTimersByTimeAsync(240);
    expect(first).toHaveBeenCalledOnce();
    expect(second).not.toHaveBeenCalled();
    idle = true;
    await vi.advanceTimersByTimeAsync(240);
    expect(second).toHaveBeenCalledOnce();
    queue.dispose();
  });

  it('cancels a queued preview when its page is opened', async () => {
    const queue = createPreviewCaptureQueue(() => true);
    const cancelled = vi.fn(async () => {});
    const remaining = vi.fn(async () => {});
    const cancel = queue.enqueue(cancelled, 0);
    queue.enqueue(remaining, 0);
    cancel();
    await vi.advanceTimersByTimeAsync(240);
    expect(cancelled).not.toHaveBeenCalled();
    expect(remaining).toHaveBeenCalledOnce();
    queue.dispose();
  });

  it('continues after a failed capture and stops pending jobs on disposal', async () => {
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    const queue = createPreviewCaptureQueue(() => true);
    const next = vi.fn(async () => {});
    const stopped = vi.fn(async () => {});
    queue.enqueue(async () => { throw new Error('capture failed'); }, 0);
    queue.enqueue(next, 0);
    queue.enqueue(stopped, 2000);
    await vi.advanceTimersByTimeAsync(300);
    expect(next).toHaveBeenCalledOnce();
    queue.dispose();
    await vi.advanceTimersByTimeAsync(3000);
    expect(stopped).not.toHaveBeenCalled();
    expect(vi.getTimerCount()).toBe(0);
  });
});
