import { useState, useEffect, useRef } from 'react';
import { flushSync } from 'react-dom';
import bosch from '../assets/paintings/bosch-earthly-delights.jpg';

const imgSrc = bosch;

export default function Viewer() {
  const prevLensSize = useRef(null);
  const viewerContainerRef = useRef(null);
  const imgRef = useRef(null);
  const zoomWindowRef = useRef(null);
  const zoomLensRef = useRef(null);
  const dragStartPos = useRef(null);
  const zoomWindowDrag = useRef(false);
  const zoomWindowDragging = useRef(false);

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

  // useEffect(() => {
  //   if (lensSize > prevLensSize.current) {

  //   }
  //   setLensPosition(prev => ({
  //     x: lensSize

  //   }))

  // }, [lensSize])

  const handleMousedown = (e) => {
    // if (!zoomWindowDrag.current) return;
    e.preventDefault();
    dragStartPos.current = getCursorPos(
      e,
      zoomWindowRef.current.getBoundingClientRect()
    );
    zoomWindowDragging.current = true;
  };

  const handleMousemove = (e) => {
    if (!zoomWindowDragging.current) return;
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
        />
      </div>
      <div
        ref={zoomWindowRef}
        className='viewer--zoom-result'
        style={{
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
        onMouseEnter={() => {
          zoomWindowDrag.current = true;
        }}
        onMouseLeave={() => {
          zoomWindowDrag.current = false;
        }}
        onPointerDown={handleMousedown}
        onPointerMove={handleMousemove}
        onPointerUp={handleMouseup}
        onPointerLeave={handleMouseup}
        onPointerOut={handleMouseup}
        onPointerCancel={handleMouseup}
      />
    </div>
  );
}
