/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/no-noninteractive-element-interactions */
/* eslint-disable no-nested-ternary */
import { useState, useEffect, useRef } from 'react';
import { flushSync } from 'react-dom';
import bosch from '../assets/paintings/bosch-the-haywain-triptych.jpg';
// import bosch from '../assets/paintings/bosch-earthly-delights.jpg';
import { findWaldos } from '..';

const imgSrc = bosch;
const imgTitle = 'earthly-delights';

export default function Viewer() {
  const viewerContainerRef = useRef(null);
  const imgRef = useRef(null);
  const zoomWindowRef = useRef(null);
  const zoomLensRef = useRef(null);
  const reticleRef = useRef(null);
  const dragStartPos = useRef(null);
  const resizeStartPos = useRef(null);
  const zoomWindowDragging = useRef(false);
  const zoomWindowResizing = useRef(false);
  const zoomWindowResizeRef = useRef(null);
  const zoomWindowOriginalSize = useRef(null);

  const [waldos, setWaldos] = useState([]);
  const [zoomWindowSize, setZoomWindowSize] = useState(300);
  const [zoomWindowPosition, setZoomWindowPosition] = useState({ x: 0, y: 0 });
  const [lensSize, setLensSize] = useState(40);
  const [lensPosition, setLensPosition] = useState({ x: 0, y: 0 });
  // const [imgProperties, setImgProperties] = useState(imgRef.current?.getBoundingClientRect());

  const imgProperties = imgRef.current?.getBoundingClientRect();

  async function setNewWaldos() {
    const newWaldos = await findWaldos(imgTitle);
    console.log(newWaldos);
    setWaldos(newWaldos.waldos);
  }
  useEffect(() => {
    setNewWaldos();
  }, []);

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
  const reticleZoomSize =
    zoomLensRef.current && reticleRef.current && zoomWindowRef.current
      ? {
          x:
            zoomWindowRef.current.offsetWidth *
            (reticleRef.current.offsetWidth / zoomLensRef.current.offsetWidth),
          y:
            zoomWindowRef.current.offsetHeight *
            (reticleRef.current.offsetHeight /
              zoomLensRef.current.offsetHeight),
        }
      : null;

  // assess window.innerHeight and window.innerWidth;
  // if ratio of img (height:width) exceeds window, height: 100%, width: auto

  const windowRatio = window.innerHeight / window.innerWidth;
  const imgRatio = imgProperties
    ? imgProperties.height / imgProperties.width
    : null;
  const imgDimensions = imgRatio
    ? imgRatio > windowRatio
      ? {
          width: 'auto',
          height: '100vh',
        }
      : { width: '100%', height: 'auto' }
    : null;

  function getCursorPos(e, relativeWindow) {
    let x = 0;
    let y = 0;
    /* Calculate the cursor's x and y coordinates, relative to the image: */
    x = e.pageX - relativeWindow.left;
    y = e.pageY - relativeWindow.top;
    /* Consider any page scrolling: */
    x -= window.scrollX;
    y -= window.scrollY;
    return { x, y };
  }

  function moveWindow(window, relativeWindow, setter, e, offset) {
    if (!relativeWindow) return;
    const {
      width: relativeWindowWidth,
      height: relativeWindowHeight,
      left: relativeWindowLeft,
      top: relativeWindowTop,
    } = relativeWindow.getBoundingClientRect();
    const { width: windowWidth, height: windowHeight } = window;
    /* Prevent any other actions that may occur when moving over the image */
    e.preventDefault?.();
    /* Get the cursor's x and y positions: */
    const pos = getCursorPos(e, {
      left: relativeWindowLeft,
      top: relativeWindowTop,
    });
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
      imgRef.current,
      setLensPosition,
      e
    );
  }

  const handleMousedown = (e) => {
    // e.preventDefault();
    dragStartPos.current = getCursorPos(
      e,
      zoomWindowRef.current.getBoundingClientRect()
    );
    zoomWindowDragging.current = true;
    zoomWindowRef.current.setPointerCapture(e.pointerId);
  };

  const handleMousemove = (e) => {
    if (!zoomWindowDragging.current) return;
    // e.preventDefault();
    moveWindow(
      zoomWindowRef.current.getBoundingClientRect(),
      viewerContainerRef.current,
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

  function handleImageResize() {
    console.log(imgRef.current?.getBoundingClientRect());
    setImgProperties(imgRef.current?.getBoundingClientRect())
  }

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
    // window.addEventListener('resize', handleImageResize);
    return () => {
      window.removeEventListener('keydown', adjustZoom);
      // window.removeEventListener('resize', handleImageResize);
    };
  }, []);

  // if x > 0.345 && x < 0.365 && y > 0.565 && y < 0.615
  // if left of reticle is less than greatest x and
  // right of reticle is more than least x
  // && top of reticle is less than greatest y and
  // bottom of reticle is greater than least y

  // left: {x: 0.35170178282009723, y: 0.5759271278619548}
  // right: {x: 0.36304700162074555, y: 0.5730623755063674}
  // top: {x: 0.3565640194489465, y: 0.5673328707951926}
  // bottom-left: {x: 0.34683954619124796, y: 0.6017098990622413}
  // bottom-right: {x: 0.353322528363047, y: 0.6131689084845907}

  function findRelativePosition(value, axis, relativeWindow) {
    return axis === 'x'
      ? (value - relativeWindow.left - window.scrollX) / relativeWindow.width
      : (value - relativeWindow.top - window.scrollY) / relativeWindow.height;
  }

  function waldoIsHit(waldo, reticle) {
    return (
      reticle.left < waldo.right &&
      reticle.right > waldo.left &&
      reticle.top < waldo.bottom &&
      reticle.bottom > waldo.top
    );
  }

  function handleHit(e) {
    const cursorPos = getCursorPos(e, imgProperties);
    const x = cursorPos.x / imgProperties.width;
    const y = cursorPos.y / imgProperties.height;
    console.log(x, y);
    const { top, right, bottom, left } =
      reticleRef.current.getBoundingClientRect();
    const reticleRelativePosition = {
      top: findRelativePosition(top, 'y', imgProperties),
      right: findRelativePosition(right, 'x', imgProperties),
      bottom: findRelativePosition(bottom, 'y', imgProperties),
      left: findRelativePosition(left, 'x', imgProperties),
    };
    const hit = waldos.find((waldo) =>
      waldoIsHit(waldo, reticleRelativePosition)
    );
    console.log(hit?.name);
  }

  return (
    <div ref={viewerContainerRef} className='viewer-container'>
      <div className='viewer--img-container'>
        <img
          ref={imgRef}
          style={imgDimensions}
          className='viewer--img'
          src={imgSrc}
          alt='beautiful painting'
          onPointerMove={handleMoveLens}
          onClick={handleHit}
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
          <div ref={reticleRef} className='reticle' />
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
          border:
            reticleZoomSize &&
            zoomWindowRef &&
            reticleZoomSize.x >= zoomWindowRef.current.offsetWidth
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
        {reticleZoomSize &&
          reticleZoomSize.x < zoomWindowRef.current.offsetWidth && (
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
    </div>
  );
}
