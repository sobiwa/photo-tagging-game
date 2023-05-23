/* eslint-disable consistent-return */
/* eslint-disable react/jsx-no-bind */
import { useState, useRef } from 'react';
import { useLoaderData, useOutletContext } from 'react-router-dom';
import { getWaldos, timeStampGameStart, timeStampGameEnd } from '../firebase';
import useTimer from '../hooks/useTimer';
import Viewer from '../components/Viewer';
import WinScreen from '../components/WinScreen';
import FailScreen from '../components/FailScreen';

function waldoIsHit(waldo, reticle) {
  return (
    reticle.left < waldo.right &&
    reticle.right > waldo.left &&
    reticle.top < waldo.bottom &&
    reticle.bottom > waldo.top
  );
}

export async function loader({ params }) {
  const { paintingId } = params;
  try {
    const waldos = await getWaldos(paintingId);
    return { paintingId, waldos };
  } catch (err) {
    throw new Error(err.message);
  }
}

export default function Game() {
  const {
    paintingId,
    waldos: { waldos },
  } = useLoaderData();
  const {
    user,
    game,
    setGame,
    timer,
    setTimer,
    zoomWindowVisible,
    setIsLoading,
  } = useOutletContext();

  const ranked = useRef(false);

  const [timerActive, setTimerActive] = useState(false);
  const [gameWon, setGameWon] = useState(false);
  const [flags, setFlags] = useState([]);
  const [error, setError] = useState(null);
  const [newRecord, setNewRecord] = useState(false);
  const [timeError, setTimeError] = useState(null);

  useTimer(setTimer, timerActive);

  async function submitTime() {
    try {
      const recordBreak = await timeStampGameEnd(
        paintingId,
        timer.current - timer.start
      );
      if (recordBreak === 'new high score') {
        setNewRecord(paintingId);
      }
    } catch (err) {
      setTimeError(err.message);
    }
  }

  function handleWin() {
    setTimerActive(false);
    setGameWon(true);
    if (ranked.current) {
      submitTime();
    }
  }

  function checkForWin(hit) {
    const remainingTargets = game.targets.filter(
      (target) => !target.found && target.dbName !== hit.name
    );
    if (!remainingTargets.length) handleWin();
  }

  function plantFlag(hit) {
    setFlags((prev) => {
      if (prev.some((item) => item.name === hit.name)) return prev;
      return [...prev, hit];
    });
  }

  function handleHit(reticlePos) {
    const hit = waldos.find((waldo) => waldoIsHit(waldo, reticlePos));
    if (!hit) return;
    setGame((prev) => ({
      ...prev,
      targets: prev.targets.map((target) =>
        target.dbName === hit.name ? { ...target, found: true } : target
      ),
    }));
    plantFlag(hit);
    checkForWin(hit);
  }

  async function startGame() {
    if (user) {
      try {
        const response = await timeStampGameStart(paintingId);
        setTimerActive(true);
        if (response === 'time logged') {
          ranked.current = true;
        }
      } catch (err) {
        setError(err.message);
      }
    } else {
      setTimerActive(true);
    }
  }

  function resumeGame() {
    setError(null);
    setTimerActive(true);
  }

  function handleLoad() {
    setIsLoading(false);
    if (game) {
      startGame();
    }
  }

  return (
    <div className='game-container'>
      {gameWon && <WinScreen newRecord={newRecord} error={timeError} />}
      {error !== null && <FailScreen message={error} resume={resumeGame} />}
      <Viewer
        painting={paintingId}
        handleHit={handleHit}
        handleLoad={handleLoad}
        flags={flags}
        zoomWindowVisible={zoomWindowVisible}
      />
    </div>
  );
}
