import type { ReactNode, RefObject } from 'react';

interface DemoTvFrameProps {
  viewportRef: RefObject<HTMLDivElement | null>;
  children: ReactNode;
}

/**
 * Crops the CC0 source artwork down to its television cabinet and places the
 * live office canvas over the CRT's original dark screen area.
 *
 * Source: https://opengameart.org/content/pixel-art-tv-sprite-cc0
 */
export function DemoTvFrame({ viewportRef, children }: DemoTvFrameProps) {
  return (
    <section className="demo-tv-stage" aria-label="픽셀 아날로그 TV 속 에이전트 오피스">
      <div className="demo-tv-cabinet">
        <img
          src="/ui/old_tv_cc0.png"
          alt=""
          aria-hidden="true"
          draggable={false}
          className="demo-tv-art"
        />
        <div ref={viewportRef} className="demo-tv-screen">
          {children}
        </div>
      </div>
    </section>
  );
}
