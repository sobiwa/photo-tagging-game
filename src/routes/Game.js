/* eslint-disable consistent-return */
/* eslint-disable react/jsx-no-bind */
import { useState } from 'react';
import { useLoaderData, useOutletContext } from 'react-router-dom';
import { getWaldos } from '..';
import useTimer from '../hooks/useTimer';
import Viewer from '../components/Viewer';
import Loading from '../components/Loading';
import WinScreen from '../components/WinScreen';

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
  const waldos = await getWaldos(paintingId);
  return {paintingId, waldos};
}

export default function Game() {
  const { paintingId, waldos: {waldos} } = useLoaderData();
  const { game, setGame, setTimer } = useOutletContext();
  const [isLoading, setIsLoading] = useState(true);
  const [timerActive, setTimerActive] = useState(false);
  const [gameWon, setGameWon] = useState(false);

  useTimer(setTimer, timerActive);

  function handleWin() {
    setTimerActive(false);
    setGameWon(true);
  }

  function checkForWin(hit) {
    const remainingTargets = game.targets.filter(
      (target) => !target.found && target.dbName !== hit.name
    );
    if (!remainingTargets.length) handleWin();
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
    checkForWin(hit);
  }

  function handleLoad() {
    setIsLoading(false);
    setTimerActive(true);
  }

  return (
    <div className='game-container'>
      {isLoading && <Loading />}
      {gameWon && <WinScreen />}
      <Viewer
        painting={paintingId}
        handleHit={handleHit}
        handleLoad={handleLoad}
      />
    </div>
  );
}
