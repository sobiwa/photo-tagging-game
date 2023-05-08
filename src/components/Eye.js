import { useState, useRef } from 'react';
import getNewWindowPos from '../helpers/getNewWindowPos';

export default function Eye({ control, open }) {
  const eyeRef = useRef(null);
  const irisRef = useRef(null);

  const [irisPos, setIrisPos] = useState(null);

  // control separate eyelid for blinking
  const [blink, setBlink] = useState(false);

  function handleMouseLeave() {
    if (!open) return;
    setTimeout(() => {
      setBlink(true);
    }, 1000);
    setTimeout(() => {
      setBlink(false);
      setIrisPos(null);
    }, 1150);
  }

  function handleMousemove(e) {
    const newIrisPos = getNewWindowPos(
      {
        width: irisRef.current?.offsetWidth,
        height: irisRef.current?.offsetHeight,
      },
      eyeRef.current,
      e
    );
    setIrisPos(newIrisPos);
  }

  const irisStyle = irisPos
    ? { top: `${irisPos.y}px`, left: `${irisPos.x}px` }
    : { inset: '0', margin: 'auto' };

  return (
    <div
      onMouseMove={handleMousemove}
      onMouseLeave={handleMouseLeave}
      className='eye-container'
    >
      <button
        type='button'
        className='eye'
        onClick={control}
      >
        <div
          className='eyelid'
          style={{ translate: open ? '-57% -57%' : '' }}
        />
        <div
          className='eyelid'
          style={{ translate: blink ? '' : '-57% -57%' }}
        />
        <div ref={eyeRef} className='iris-wrapper'>
          <div ref={irisRef} className='iris' style={irisStyle}>
            <div className='pupil' />
          </div>
        </div>
      </button>
    </div>
  );
}
