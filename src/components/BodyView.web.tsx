import { createElement, forwardRef, useEffect, useImperativeHandle, useRef } from 'react';
import { BODY_HTML } from '../three/bodyScene';
import type { BodyViewHandle, BodyViewProps } from './bodyViewTypes';

// Versão web: mesma cena, dentro de um iframe. Base para a versão web futura.
export const BodyView = forwardRef<BodyViewHandle, BodyViewProps>(function BodyView({ onMessage }, ref) {
  const frame = useRef<HTMLIFrameElement | null>(null);

  useImperativeHandle(ref, () => ({
    run(js: string) {
      const w = frame.current?.contentWindow as (Window & { eval: (s: string) => unknown }) | null | undefined;
      try {
        w?.eval(js);
      } catch {}
    },
  }));

  useEffect(() => {
    function listener(e: MessageEvent) {
      if (e.source !== frame.current?.contentWindow) return;
      try {
        onMessage(JSON.parse(String(e.data)));
      } catch {}
    }
    window.addEventListener('message', listener);
    return () => window.removeEventListener('message', listener);
  }, [onMessage]);

  return createElement('iframe', {
    ref: frame,
    srcDoc: BODY_HTML,
    title: 'Corpo humano 3D',
    style: { border: 0, width: '100%', height: '100%', display: 'block', background: 'transparent' },
  });
});
