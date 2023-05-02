/* eslint-disable no-nested-ternary */
/* eslint-disable react/prop-types */
import { forwardRef, useRef, useState } from 'react';
import getCursorPos from '../helpers/getCursorPos';
import getNewWindowPos from '../helpers/getNewWindowPos';

const ZoomWindow = forwardRef(
  (
    {
      visible,
      lens,
      lensReticle,
      lensPosition,
      container,
      imgSrc,
      imgProperties,
      initSize,
      maxSize,
    },
    ref
  ) => {
    const dragStartPos = useRef(null);
    const resizeStartPos = useRef(null);
    const zoomWindowDragging = useRef(false);
    const zoomWindowResizing = useRef(false);
    const zoomWindowResizeRef = useRef(null);
    const zoomWindowOriginalSize = useRef(null);

    const [zoomWindowSize, setZoomWindowSize] = useState(initSize);
    const [zoomWindowPosition, setZoomWindowPosition] = useState({
      x: 0,
      y: 0,
    });

    const zoomRatio =
      ref?.current && lens
        ? {
            x: ref.current.offsetWidth / lens.offsetWidth,
            y: ref.current.offsetHeight / lens.offsetHeight,
          }
        : null;

    const reticleZoomSize =
      lens && lensReticle && ref?.current
        ? {
            x:
              ref.current.offsetWidth *
              (lensReticle.offsetWidth / lens.offsetWidth),
            y:
              ref.current.offsetHeight *
              (lensReticle.offsetHeight / lens.offsetHeight),
          }
        : null;

    const handleMousedown = (e) => {
      // e.preventDefault();
      dragStartPos.current = getCursorPos(
        e,
        ref.current.getBoundingClientRect()
      );
      zoomWindowDragging.current = true;
      ref.current.setPointerCapture(e.pointerId);
    };

    const handleMousemove = (e) => {
      if (!zoomWindowDragging.current) return;
      // e.preventDefault();
      const newPos = getNewWindowPos(
        ref.current.getBoundingClientRect(),
        container,
        e,
        dragStartPos.current
      );
      setZoomWindowPosition(newPos);
    };

    const handleMouseup = () => {
      zoomWindowDragging.current = false;
    };

    const handleMousedownResize = (e) => {
      e.stopPropagation();
      zoomWindowOriginalSize.current = ref.current.offsetWidth;
      const { pageX: x, pageY: y } = e;
      resizeStartPos.current = { x, y };
      zoomWindowResizing.current = true;
      zoomWindowResizeRef.current.setPointerCapture(e.pointerId);
    };

    const handleMousemoveResize = (e) => {
      e.stopPropagation();
      if (!zoomWindowResizing.current) return;
      const { pageX: x, pageY: y } = e;
      const { x: prevX, y: prevY } = resizeStartPos.current;
      const xDiff = x - prevX;
      const yDiff = y - prevY;
      const greatestDiff = Math.abs(xDiff) > Math.abs(yDiff) ? xDiff : yDiff;
      const newSize = zoomWindowOriginalSize.current + greatestDiff;
      setZoomWindowSize(
        newSize < 50 ? 50 : newSize > maxSize ? maxSize : newSize
      );
    };

    const handleMouseupResize = () => {
      zoomWindowResizing.current = false;
    };

    return (
      <div
        ref={ref}
        className='viewer--zoom-window'
        style={{
          visibility: visible || visible === undefined ? 'visible' : 'hidden',
          width: zoomWindowSize,
          height: zoomWindowSize,
          backgroundImage: `url(${imgSrc})`,
          backgroundSize:
            imgProperties && zoomRatio
              ? `${imgProperties.width * zoomRatio.x}px ${
                  imgProperties.height * zoomRatio.y
                }px`
              : 'auto',
          backgroundPosition: zoomRatio
            ? `-${lensPosition.x * zoomRatio.x}px -${
                lensPosition.y * zoomRatio.y
              }px`
            : '',
          left: `${zoomWindowPosition.x}px`,
          top: `${zoomWindowPosition.y}px`,
          border:
            reticleZoomSize &&
            ref &&
            reticleZoomSize.x >= ref.current.offsetWidth
              ? '3px solid #a6010184'
              : '1px solid #d4d4d4',
        }}
        onPointerDown={handleMousedown}
        onPointerMove={handleMousemove}
        onPointerUp={handleMouseup}
        onPointerLeave={handleMouseup}
        onPointerOut={handleMouseup}
        onPointerCancel={handleMouseup}
      >
        {reticleZoomSize && reticleZoomSize.x < ref.current.offsetWidth && (
          <div
            className='zoom-window-reticle'
            style={{
              width: `${reticleZoomSize.x}px`,
              height: `${reticleZoomSize.y}px`,
              border: `${zoomRatio.x}px solid rgba(166, 1, 1, 0.518)`,
            }}
          />
        )}
        <div
          ref={zoomWindowResizeRef}
          className='viewer--zoom-window-size'
          onPointerDown={handleMousedownResize}
          onPointerMove={handleMousemoveResize}
          onPointerUp={handleMouseupResize}
          onPointerLeave={handleMouseupResize}
          onPointerOut={handleMouseupResize}
          // onPointerCancel={handleMouseupResize}
        />
      </div>
    );
  }
);

export default ZoomWindow;
