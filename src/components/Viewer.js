import { useState, useEffect, useRef, useLayoutEffect } from 'react';
import bosch from '../assets/paintings/bosch-earthly-delights.jpg';

const imgSrc = bosch;

export default function Viewer() {
  const imgRef = useRef(null);
  const zoomResultRef = useRef(null);
  const zoomLensRef = useRef(null);
  const mouseCoordinates = useRef(null);

  const [lensPosition, setLensPosition] = useState({ x: 0, y: 0 });
  const [imgProperties, setImgProperties] = useState(null);
  const [zoomRatio, setZoomRatio] = useState({ x: 0, y: 0 });
  const [lensSize, setLensSize] = useState(40);
  
  function getCursorPos(e) {
    let x = 0;
    let y = 0;
    /* Calculate the cursor's x and y coordinates, relative to the image: */
    x = e.pageX - imgProperties.left;
    y = e.pageY - imgProperties.top;
    /* Consider any page scrolling: */
    x -= window.pageXOffset;
    y -= window.pageYOffset;
    return { x, y };
  }

  function moveLens(e) {
    if (!imgProperties) return;
    const imgWidth = imgProperties.width;
    const imgHeight = imgProperties.height;
    const lensWidth = zoomLensRef.current.offsetWidth;
    const lensHeight = zoomLensRef.current.offsetHeight;
    /* Prevent any other actions that may occur when moving over the image */
    e.preventDefault?.();
    /* Get the cursor's x and y positions: */
    const pos = getCursorPos(e);
    /* Calculate the position of the lens: */
    let x = pos.x - lensWidth / 2;
    let y = pos.y - lensHeight / 2;
    /* Prevent the lens from being positioned outside the image: */
    if (x > imgWidth - lensWidth) {
      x = imgWidth - lensWidth;
    }
    if (x < 0) {
      x = 0;
    }
    if (y > imgHeight - lensHeight) {
      y = imgHeight - lensHeight;
    }
    if (y < 0) {
      y = 0;
    }
    /* Set the position of the lens: */
    setLensPosition({ x, y });
  }

  useLayoutEffect(() => {
    setZoomRatio({
      x: zoomResultRef.current.offsetWidth / zoomLensRef.current.offsetWidth,
      y: zoomResultRef.current.offsetHeight / zoomLensRef.current.offsetHeight,
    });
    if (mouseCoordinates.current) moveLens(mouseCoordinates.current);
  }, [lensSize]);

  function adjustZoom(e) {
    const { code } = e;
    switch (code) {
      case 'ArrowDown':
      case 'Minus':
        setLensSize((prev) => {
          if (prev >= 100) return prev;
          return prev + 10;
        });
        break;
      case 'ArrowUp':
      case 'Equal':
      case 'Plus':
        setLensSize((prev) => {
          if (prev <= 10) return prev;
          return prev - 10;
        });
        break;
      default:
        break;
    }
  }

  function recordMouseCoordinates(e) {
    const {pageX, pageY} = e;
    mouseCoordinates.current = {pageX, pageY};
  }

  useEffect(() => {
    window.addEventListener('keydown', adjustZoom);
    window.addEventListener('mousemove', recordMouseCoordinates);
    return () => {
      window.removeEventListener('keydown', adjustZoom);
      window.removeEventListener('mousemove', recordMouseCoordinates);
    };
  }, []);

  return (
    <div className='viewer-container'>
      <div className='viewer--img-container'>
        <img
          ref={imgRef}
          className='viewer--img'
          src={imgSrc}
          alt='beautiful painting'
          onMouseMove={moveLens}
          onTouchMove={moveLens}
          onLoad={() =>
            setImgProperties(imgRef.current.getBoundingClientRect())
          }
        />
        <div
          ref={zoomLensRef}
          className='viewer--zoom-lens'
          onMouseMove={moveLens}
          onTouchMove={moveLens}
          style={{
            width: `${lensSize}px`,
            height: `${lensSize}px`,
            left: `${lensPosition.x}px`,
            top: `${lensPosition.y}px`,
          }}
        />
      </div>
      <div
        ref={zoomResultRef}
        className='viewer--zoom-result'
        style={{
          backgroundImage: `url(${imgSrc})`,
          backgroundSize: imgProperties
            ? `${imgProperties.width * zoomRatio.x}px ${
                imgProperties.height * zoomRatio.y
              }px`
            : 'auto',
          backgroundPosition: `-${lensPosition.x * zoomRatio.x}px -${
            lensPosition.y * zoomRatio.y
          }px`,
        }}
      />
    </div>
  );
}
