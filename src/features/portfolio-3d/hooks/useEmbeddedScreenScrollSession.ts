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
      const top = event.currentTarget.scrollTop;
      const left = event.currentTarget.scrollLeft;
      lastScrollTopRef.current = top;
      if (top !== 0) event.currentTarget.dataset.scrollTop = String(top);
      else delete event.currentTarget.dataset.scrollTop;
      if (left !== 0) event.currentTarget.dataset.scrollLeft = String(left);
      else delete event.currentTarget.dataset.scrollLeft;
    }
  }, [interactive]);

  useLayoutEffect(() => {
    const scrollContainer = scrollRef.current;
    if (!scrollContainer) return;

    const restoreScroll = (): void => {
      // A hidden CSS3D document reports zero dimensions. Clamping against that
      // temporary layout would erase the last scroll position.
      if (scrollContainer.clientHeight < 1 || scrollContainer.scrollHeight < 1) {
        return;
      }

      const maxScrollTop = Math.max(0, scrollContainer.scrollHeight - scrollContainer.clientHeight);
      const targetTop = Math.min(lastScrollTopRef.current, maxScrollTop);
      // State restoration must not inherit the page's smooth-scroll animation.
      scrollContainer.scrollTo({
        top: targetTop,
        behavior: 'instant'
      });
      if (targetTop !== 0) scrollContainer.dataset.scrollTop = String(targetTop);
      else delete scrollContainer.dataset.scrollTop;
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
