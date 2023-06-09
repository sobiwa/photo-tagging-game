import { forwardRef, useEffect, useState } from 'react';
import { flushSync } from 'react-dom';

const ZoomLens = forwardRef(
  ({ children, position, setPosition, handleMove }, ref) => {
    const [lensSize, setLensSize] = useState(40);

    useEffect(() => {
      function adjustZoom(e) {
        let adjustPos;
        const { code } = e;
        switch (code) {
          case 'ArrowDown':
          case 'Minus':
            e.preventDefault();
            flushSync(() => {
              setLensSize((prev) => {
                if (prev >= 100) return prev;
                adjustPos = 'grow';
                return prev + 10;
              });
            });
            break;
          case 'ArrowUp':
          case 'Equal':
          case 'Plus':
            e.preventDefault();
            flushSync(() => {
              setLensSize((prev) => {
                if (prev <= 10) return prev;
                adjustPos = 'shrink';
                return prev - 10;
              });
            });
            break;
          default:
            break;
        }
        if (adjustPos) {
          setPosition((prev) => ({
            x: adjustPos === 'grow' ? prev.x - 5 : prev.x + 5,
            y: adjustPos === 'grow' ? prev.y - 5 : prev.y + 5,
          }));
        }
      }

      window.addEventListener('keydown', adjustZoom);
      return () => {
        window.removeEventListener('keydown', adjustZoom);
      };
    }, []);

    return (
      <div
        ref={ref}
        className='viewer--zoom-lens'
        onPointerMove={handleMove}
        style={{
          touchAction: 'none',
          width: `${lensSize}px`,
          height: `${lensSize}px`,
          left: `${position.x}px`,
          top: `${position.y}px`,
        }}
      >
        {children}
      </div>
    );
  }
);

export default ZoomLens;
