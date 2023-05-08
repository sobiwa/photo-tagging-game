/* eslint-disable react/prop-types */
/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import { useState, useEffect, useLayoutEffect, useRef } from 'react';
import { useOutletContext } from 'react-router-dom';

export default function MenuCard({ painting }) {
  const { thumbnail, title, artist, year, targets } = painting;
  const [flip, setFlip] = useState(false);
  const [contentHeight, setContentHeight] = useState();
  const frontRef = useRef(null);
  const backRef = useRef(null);

  const [dimensions, setDimensions] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  useEffect(() => {
    function handleResize() {
      setDimensions({ width: window.innerWidth, height: window.innerHeight });
    }
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  });

  // not sure if I can do this from this component or if it has to be from a route and I pass it in
  const { handleGameStart } = useOutletContext();

  useLayoutEffect(() => {
    setContentHeight(
      flip ? backRef.current?.scrollHeight : frontRef.current?.scrollHeight
    );
  }, [flip, dimensions]);

  return (
    <div
      // tabIndex={0}
      className='menu--card'
      onClick={() => {
        setFlip((prev) => !prev);
      }}
    >
      {/* allow cards to be flips via tabbing */}
      {/* eslint-disable-next-line jsx-a11y/control-has-associated-label */}
      <button type='button' className='tab-flipper' />
      <div className='flip-box' style={{ height: contentHeight ?? '' }}>
        <div
          className='flip-box-inner'
          style={{ transform: flip ? 'rotateY(180deg)' : '' }}
        >
          <div className='flip-box-front' ref={frontRef}>
            <div className='menu--thumbnail-container'>
              <img
                src={thumbnail}
                alt='Oil on wood'
                onLoad={() => {
                  setContentHeight(
                    flip
                      ? backRef.current?.scrollHeight
                      : frontRef.current?.scrollHeight
                  );
                }}
              />
            </div>
            <div className='menu--card-details'>
              <div className='bold'>{title}</div>
              <div>{artist}</div>
              <div>{year}</div>
            </div>
          </div>
          <div className='flip-box-back' ref={backRef}>
            <h4>Targets:</h4>
            <ul className='target-list'>
              {targets.map((target) => (
                <li key={target.dbName} className='target-details'>
                  <div className='target-img'>
                    <img src={target.img} alt={target.description} />
                  </div>
                  <div className='target-description'>{target.description}</div>
                </li>
              ))}
            </ul>
            <button
              className='start-game-button'
              style={{ visibility: flip ? 'visible' : 'hidden' }}
              type='button'
              onClick={(e) => {
                e.stopPropagation();
                handleGameStart(painting);
              }}
            >
              Start
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
