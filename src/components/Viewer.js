/* eslint-disable no-nested-ternary */
import { useState, useEffect, useRef } from 'react';
import { flushSync } from 'react-dom';
import bosch from '../assets/paintings/bosch-earthly-delights.jpg';

const imgSrc = bosch;

export default function Viewer() {
  const viewerContainerRef = useRef(null);
  const imgRef = useRef(null);
  const zoomWindowRef = useRef(null);
  const zoomLensRef = useRef(null);
  const dragStartPos = useRef(null);
  const resizeStartPos = useRef(null);
  const zoomWindowDragging = useRef(false);
  const zoomWindowResizing = useRef(false);
  const zoomWindowResizeRef = useRef(null);
  const zoomWindowOriginalSize = useRef(null);

  const [zoomWindowSize, setZoomWindowSize] = useState(300);
  const [zoomWindowPosition, setZoomWindowPosition] = useState({ x: 0, y: 0 });
  const [lensSize, setLensSize] = useState(40);
  const [lensPosition, setLensPosition] = useState({ x: 0, y: 0 });

  const imgProperties = imgRef.current?.getBoundingClientRect();
  const zoomRatio =
    zoomWindowRef.current && zoomLensRef.current
      ? {
          x:
            zoomWindowRef.current.offsetWidth / zoomLensRef.current.offsetWidth,
          y:
            zoomWindowRef.current.offsetHeight /
            zoomLensRef.current.offsetHeight,
        }
      : null;

  function getCursorPos(e, relativeWindow) {
    let x = 0;
    let y = 0;
    /* Calculate the cursor's x and y coordinates, relative to the image: */
    x = e.pageX - relativeWindow.left;
    y = e.pageY - relativeWindow.top;
    /* Consider any page scrolling: */
    x -= window.pageXOffset;
    y -= window.pageYOffset;
    return { x, y };
  }

  function moveWindow(window, relativeWindow, setter, e, offset) {
    if (!relativeWindow) return;
    const { width: relativeWindowWidth, height: relativeWindowHeight } =
      relativeWindow;
    const { width: windowWidth, height: windowHeight } = window;
    /* Prevent any other actions that may occur when moving over the image */
    e.preventDefault?.();
    /* Get the cursor's x and y positions: */
    const pos = getCursorPos(e, relativeWindow);
    /* Calculate the position of the lens: */
    let x;
    let y;
    if (offset) {
      x = pos.x - offset.x;
      y = pos.y - offset.y;
    } else {
      x = pos.x - windowWidth / 2;
      y = pos.y - windowHeight / 2;
    }
    /* Prevent the lens from being positioned outside the image: */
    if (x > relativeWindowWidth - windowWidth) {
      x = relativeWindowWidth - windowWidth;
    }
    if (x < 0) {
      x = 0;
    }
    if (y > relativeWindowHeight - windowHeight) {
      y = relativeWindowHeight - windowHeight;
    }
    if (y < 0) {
      y = 0;
    }
    /* Set the position of the lens: */
    setter({ x, y });
  }

  function handleMoveLens(e) {
    moveWindow(
      {
        width: zoomLensRef.current?.offsetWidth,
        height: zoomLensRef.current?.offsetHeight,
      },
      imgRef.current.getBoundingClientRect(),
      setLensPosition,
      e
    );
  }

  const handleMousedown = (e) => {
    // e.preventDefault();
    console.log('fuck');
    dragStartPos.current = getCursorPos(
      e,
      zoomWindowRef.current.getBoundingClientRect()
    );
    zoomWindowDragging.current = true;
    zoomWindowRef.current.setPointerCapture(e.pointerId);
  };

  // get cursor position on start
  // track cursor movement difference from start
  // resize according to difference with limits considered

  const handleMousemove = (e) => {
    if (!zoomWindowDragging.current) return;
    // e.preventDefault();
    moveWindow(
      zoomWindowRef.current.getBoundingClientRect(),
      viewerContainerRef.current.getBoundingClientRect(),
      setZoomWindowPosition,
      e,
      dragStartPos.current
    );
  };

  const handleMouseup = () => {
    zoomWindowDragging.current = false;
  };

  const handleMousedownResize = (e) => {
    e.stopPropagation();
    zoomWindowOriginalSize.current = zoomWindowRef.current.offsetWidth;
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
    setZoomWindowSize(newSize < 50 ? 50 : newSize > 400 ? 400 : newSize);
  };

  const handleMouseupResize = () => {
    zoomWindowResizing.current = false;
  };

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
        setLensPosition((prev) => ({
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
    <div ref={viewerContainerRef} className='viewer-container'>
      <div className='viewer--img-container'>
        <img
          ref={imgRef}
          className='viewer--img'
          src={imgSrc}
          alt='beautiful painting'
          onPointerMove={handleMoveLens}
        />
        <div
          ref={zoomLensRef}
          className='viewer--zoom-lens'
          onPointerMove={handleMoveLens}
          style={{
            width: `${lensSize}px`,
            height: `${lensSize}px`,
            left: `${lensPosition.x}px`,
            top: `${lensPosition.y}px`,
          }}
        >
          <div className='reticle' />
        </div>
      </div>
      <div
        ref={zoomWindowRef}
        className='viewer--zoom-window'
        style={{
          width: zoomWindowSize,
          height: zoomWindowSize,
          backgroundImage: `url(${imgSrc})`,
          backgroundSize: imgProperties
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
        }}
        onPointerDown={handleMousedown}
        onPointerMove={handleMousemove}
        onPointerUp={handleMouseup}
        onPointerLeave={handleMouseup}
        onPointerOut={handleMouseup}
        onPointerCancel={handleMouseup}
      >
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
    </div>
  );
}
