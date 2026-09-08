'use client';

import { type UIEventHandler, useCallback, useLayoutEffect, useRef } from 'react';

/**
 * Keeps an embedded screen at its last scroll position while CSS3D moves its
 * DOM node between the room projection and the focused native layout.
 */
export function useEmbeddedScreenScrollSession(interactive: boolean) {
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const lastScrollTopRef = useRef(0);

  const onScroll = useCallback<UIEventHandler<HTMLDivElement>>((event) => {
    if (interactive) {
      lastScrollTopRef.current = event.currentTarget.scrollTop;
    }
  }, [interactive]);

  useLayoutEffect(() => {
    const scrollContainer = scrollRef.current;
    if (!scrollContainer) return;

    const restoreScroll = (): void => {
      // The room hides inactive CSS3D documents before their static preview is
      // captured. A hidden element reports zero dimensions; clamping against
      // that temporary layout would erase the last scroll position.
      if (scrollContainer.clientHeight < 1 || scrollContainer.scrollHeight < 1) {
        return;
      }

      const maxScrollTop = Math.max(0, scrollContainer.scrollHeight - scrollContainer.clientHeight);
      scrollContainer.scrollTop = Math.min(lastScrollTopRef.current, maxScrollTop);
    };

    // CSS3D reparents the screen after each layout switch. Reapply after its
    // follow-up layout frames so the room and focused views stay in sync.
    let framesRemaining = 4;
    let animationFrame = 0;
    const restoreAcrossFrames = (): void => {
      restoreScroll();
      framesRemaining -= 1;
      if (framesRemaining > 0) {
        animationFrame = window.requestAnimationFrame(restoreAcrossFrames);
      }
    };

    restoreAcrossFrames();
    return () => {
      if (interactive) {
        lastScrollTopRef.current = scrollContainer.scrollTop;
      }
      window.cancelAnimationFrame(animationFrame);
    };
  }, [interactive]);

  return { scrollRef, onScroll };
}
