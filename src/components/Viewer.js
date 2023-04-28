/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/no-noninteractive-element-interactions */
/* eslint-disable no-nested-ternary */
import { useState, useRef } from 'react';
import ZoomLens from './ZoomLens';
import paintings from '../data/paintings';
import getCursorPos from '../helpers/getCursorPos';
import getNewWindowPos from '../helpers/getNewWindowPos';

export default function Viewer({ painting, handleHit, handleLoad }) {
  const { img: imgSrc } = paintings.find((p) => p.id === painting);

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

  const [zoomWindowSize, setZoomWindowSize] = useState(300);
  const [zoomWindowPosition, setZoomWindowPosition] = useState({ x: 0, y: 0 });
  const [lensPosition, setLensPosition] = useState({ x: 0, y: 0 });

  const imgProperties = imgRef.current?.getBoundingClientRect();
  const zoomLensProperties = zoomLensRef.current?.getBoundingClientRect();

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

  // const zoomLensPos =
  //   zoomLensRef.current && imgRef.current
  //     ? {
  //         x: zoomLensProperties.left - imgProperties.left,
  //         y: zoomLensProperties.top - imgProperties.top,
  //       }
  //     : { x: 0, y: 0 };

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

  function handleMoveLens(e) {
    const newPos = getNewWindowPos(
      {
        width: zoomLensRef.current?.offsetWidth,
        height: zoomLensRef.current?.offsetHeight,
      },
      imgRef.current,
      e
    );
    setLensPosition(newPos);
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
    const newPos = getNewWindowPos(
      zoomWindowRef.current.getBoundingClientRect(),
      viewerContainerRef.current,
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

  function findRelativePosition(value, axis, relativeWindow) {
    return axis === 'x'
      ? (value - relativeWindow.left) / relativeWindow.width
      : (value - relativeWindow.top) / relativeWindow.height;
  }

  function handleClick(e) {
    // FOR ADDING TARGET COORDINATES TO DATABASE
    // const cursorPos = getCursorPos(e, imgProperties);
    // const x = cursorPos.x / imgProperties.width;
    // const y = cursorPos.y / imgProperties.height;
    // console.log(x, y);
    const { top, right, bottom, left } =
      reticleRef.current.getBoundingClientRect();
    const reticleRelativePosition = {
      top: findRelativePosition(top, 'y', imgProperties),
      right: findRelativePosition(right, 'x', imgProperties),
      bottom: findRelativePosition(bottom, 'y', imgProperties),
      left: findRelativePosition(left, 'x', imgProperties),
    };
    handleHit(reticleRelativePosition);
  }

  return (
    <div ref={viewerContainerRef} className='viewer-container'>
      <div className='viewer-contents'>
        <div className='viewer--img-container'>
          <img
            onLoad={handleLoad}
            ref={imgRef}
            style={imgDimensions}
            className='viewer--img'
            src={imgSrc}
            alt='beautiful painting'
            onPointerMove={handleMoveLens}
            onClick={handleClick}
          />
          <ZoomLens ref={zoomLensRef} position={lensPosition} setPosition={setLensPosition} handleMove={(e) => handleMoveLens(e)}>
            <div ref={reticleRef} className='reticle' />
          </ZoomLens>
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
    </div>
  );
}
