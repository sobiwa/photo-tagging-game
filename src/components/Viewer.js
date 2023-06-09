/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/no-noninteractive-element-interactions */
/* eslint-disable no-nested-ternary */
import { useState, useRef } from 'react';
import { flushSync } from 'react-dom';
import ZoomLens from './ZoomLens';
import paintings from '../data/paintings';
import getNewWindowPos from '../helpers/getNewWindowPos';
import ZoomWindow from './ZoomWindow';
import flagIcon from '../assets/icons/ultra-flag.svg';
// import getCursorPos from '../helpers/getCursorPos';

export default function Viewer({
  painting,
  handleHit,
  handleLoad,
  flags,
  zoomWindowVisible,
}) {
  const { img: imgSrc } = paintings.find((p) => p.id === painting);

  const viewerContainerRef = useRef(null);
  const imgRef = useRef(null);
  const zoomLensRef = useRef(null);
  const reticleRef = useRef(null);
  const zoomWindowRef = useRef(null);

  const [lensPosition, setLensPosition] = useState({ x: 0, y: 0 });

  const imgProperties = imgRef.current?.getBoundingClientRect();

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
    if (window.innerWidth < 800) {
      flushSync(() => {
        handleMoveLens(e);
      });
    }
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
          <ZoomLens
            ref={zoomLensRef}
            position={lensPosition}
            setPosition={setLensPosition}
            handleMove={(e) => handleMoveLens(e)}
          >
            <div ref={reticleRef} className='reticle' />
          </ZoomLens>
          {flags.map(({ name, top, right, bottom, left }) => (
            <div
              key={name}
              className='flag'
              style={{
                width: `${(right - left) * imgProperties.width}px`,
                height: `${(bottom - top) * imgProperties.height}px`,
                top: `${top * imgProperties.height}px`,
                left: `${left * imgProperties.width}px`,
              }}
            >
              <img src={flagIcon} alt='found target' />
            </div>
          ))}
        </div>
        <ZoomWindow
          ref={zoomWindowRef}
          visible={zoomWindowVisible}
          lens={zoomLensRef.current}
          lensReticle={reticleRef.current}
          lensPosition={lensPosition}
          container={viewerContainerRef.current}
          imgProperties={imgProperties}
          imgSrc={imgSrc}
          initSize={200}
          maxSize={400}
        />
      </div>
    </div>
  );
}
