import { useEffect, useState, useRef } from 'react';
import { useOutletContext } from 'react-router-dom';
import ZoomLens from '../components/ZoomLens';
import ZoomWindow from '../components/ZoomWindow';
import MenuCard from '../components/MenuCard';
import getNewWindowPos from '../helpers/getNewWindowPos';
import paintings from '../data/paintings';
import tutorialImg from '../assets/paintings/thumbnails/bosch-the-haywain-triptych.jpg';
import listIcon from '../assets/icons/list.svg';
import useUserRecords from '../hooks/useUserRecords';

export default function Menu() {
  const { setGame, setTimer, handleGameStart, user } = useOutletContext();

  const tutorialViewerRef = useRef(null);
  const reticleRef = useRef(null);
  const zoomLensRef = useRef(null);
  const zoomWindowRef = useRef(null);
  const imgRef = useRef(null);
  const instructionsRef = useRef(null);
  const instructionsContainerRef = useRef(null);
  const collapsibleRef = useRef(null);
  const instructionsButtonRef = useRef(null);

  const [zoomLensPosition, setZoomLensPosition] = useState({ x: 0, y: 0 });
  const [instructionsVisible, setInstructionsVisible] = useState(false);

  const userRecords = useUserRecords(user);

  const imgProperties = imgRef.current?.getBoundingClientRect();

  function handleMoveLens(e) {
    const newPos = getNewWindowPos(
      {
        width: zoomLensRef.current?.offsetWidth,
        height: zoomLensRef.current?.offsetHeight,
      },
      imgRef.current,
      e
    );
    setZoomLensPosition(newPos);
  }

  useEffect(() => {
    setGame(null);
    setTimer(null);
  }, []);

  useEffect(() => {
    function collapseTutorialOnClick(e) {
      if (
        !instructionsButtonRef?.current.contains(e.target) &&
        !collapsibleRef?.current.contains(e.target)
      ) {
        setInstructionsVisible(false);
      }
    }
    window.addEventListener('click', collapseTutorialOnClick);
    return () => window.removeEventListener('click', collapseTutorialOnClick);
  }, []);

  return (
    <div className='menu-container'>
      <div
        className='menu--instructions-container'
        ref={instructionsContainerRef}
      >
        <button
          ref={instructionsButtonRef}
          className='instructions-button'
          type='button'
          onClick={() => {
            setInstructionsVisible((prev) => !prev);
          }}
        >
          <div
            className='list-icon-container'
            style={{
              transition: '0.3s',
              rotate: instructionsVisible ? '180deg' : '',
            }}
          >
            <img src={listIcon} alt='instructions' />
          </div>
          Instructions
        </button>
        <div
          ref={collapsibleRef}
          className='collapsible'
          style={{
            maxHeight: instructionsVisible
              ? `${instructionsRef.current.scrollHeight}px`
              : 0,
            border: 'none',
            overflow: 'hidden',
          }}
        >
          <div ref={instructionsRef} className='collapsible-contents'>
            <ol className='menu--instructions'>
              <li>Pick a painting</li>
              <li>Review the targets</li>
              <li>Find all the targets in the painting</li>
              <ul className='menu--advanced-instructions'>
                <li>Zoom window is draggable and resizable</li>
                <li>
                  Adjust lens zoom with +/↑ and -/↓
                  <div className='tutorial-viewer' ref={tutorialViewerRef}>
                    <ZoomWindow
                      ref={zoomWindowRef}
                      lens={zoomLensRef.current}
                      lensReticle={reticleRef.current}
                      lensPosition={zoomLensPosition}
                      container={tutorialViewerRef.current}
                      imgProperties={imgProperties}
                      imgSrc={tutorialImg}
                      initSize={100}
                      maxSize={150}
                    />
                    <div className='tutorial-viewer-img-container'>
                      <div className='tutorial-viewer-img-wrapper'>
                        <img
                          ref={imgRef}
                          className='tutorial--img'
                          src={tutorialImg}
                          alt='beautiful painting'
                          onPointerMove={handleMoveLens}
                        />
                        <ZoomLens
                          ref={zoomLensRef}
                          position={zoomLensPosition}
                          setPosition={setZoomLensPosition}
                          handleMove={(e) => handleMoveLens(e)}
                        >
                          <div ref={reticleRef} className='reticle' />
                        </ZoomLens>
                      </div>
                      <div className='tutorial--img-details'>
                        <h5>The Haywain Triptych</h5>
                        <h6>Hieronymus Bosch</h6>
                        <h6>c. 1516</h6>
                      </div>
                    </div>
                  </div>
                </li>
              </ul>
            </ol>
            <div className='instructions-warning'>
              <strong>WARNING:</strong> Ranking evaluation begins immediately
              upon starting game and cannot be overwritten. Be prepared to
              finish game upon clicking start.
            </div>
          </div>
        </div>
      </div>
      <div className='menu--card-container'>
        {paintings.map((item) => (
          <MenuCard
            key={item.id}
            painting={item}
            handleGameStart={handleGameStart}
            badge={userRecords[item.id]}
          />
        ))}
      </div>
    </div>
  );
}
