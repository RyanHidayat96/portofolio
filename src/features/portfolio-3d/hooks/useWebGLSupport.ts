'use client';

import { useEffect, useState } from 'react';

export type WebGLSupportStatus = 'checking' | 'supported' | 'unsupported';

export function useWebGLSupport(): WebGLSupportStatus {
  const [status, setStatus] = useState<WebGLSupportStatus>('checking');

  useEffect(() => {
    setStatus(canUseWebGL() ? 'supported' : 'unsupported');
  }, []);

  return status;
}

function canUseWebGL(): boolean {
  if (typeof window === 'undefined') {
    return false;
  }

  try {
    const canvas = document.createElement('canvas');
    const context =
      canvas.getContext('webgl2') ??
      canvas.getContext('webgl') ??
      canvas.getContext('experimental-webgl');

    if (!context || !isWebGLContext(context)) {
      return false;
    }

    const loseContext = context.getExtension('WEBGL_lose_context');
    loseContext?.loseContext();

    return true;
  } catch {
    return false;
  }
}

function isWebGLContext(
  context: RenderingContext
): context is WebGLRenderingContext | WebGL2RenderingContext {
  return 'getExtension' in context;
}

