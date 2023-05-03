/* eslint-disable jsx-a11y/no-noninteractive-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import { Outlet, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './firebase';
import UserHeader from './components/user/UserHeader';
import waldoLogo from './assets/waldo.svg';
import Eye from './components/Eye';

function formatTimer(start, current) {
  if (!start || !current) return '00:00:00';
  function addZeroes(num) {
    if (!num) return '00';
    const newNum = Math.round(num);
    if (newNum < 10) return `0${newNum}`;
    return `${newNum}`;
  }
  const totalSeconds = (current - start) / 1000;
  const totalMinutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${addZeroes(hours)}:${addZeroes(minutes)}:${addZeroes(seconds)}`;
}

export default function App() {
  const [game, setGame] = useState(null);
  const [timer, setTimer] = useState(null);
  const [user, setUser] = useState(null);
  const [zoomWindowVisible, setZoomWindowVisible] = useState(true);

  const navigate = useNavigate();

  useEffect(() => {
    function authStateObserver(firebaseUser) {
      setUser(firebaseUser ?? null);
    }

    onAuthStateChanged(auth, authStateObserver);
  }, []);

  function handleGameStart({ targets, id, title, artist, year }) {
    setGame({
      title,
      artist,
      year,
      targets: targets.map((target) => ({ ...target, found: false })),
    });
    navigate(id);
  }
  const time = timer ? formatTimer(timer.start, timer.current) : '00:00:00';

  return (
    <div className='root-container'>
      <div className='header'>
        <div className='logo-container'>
          <img
            src={waldoLogo}
            alt="Where's waldo?"
            onClick={() => navigate('/')}
          />
        </div>
        {!game && <UserHeader user={user} />}
        {game && (
          <div className='game-header'>
            <Eye
              control={() => {
                setZoomWindowVisible((prev) => !prev);
              }}
              open={zoomWindowVisible}
            />
            <div className='timer'>{time}</div>
            <div className='waldo-tracker'>
              {game.targets.map((target) => (
                <div
                  className='header--target'
                  key={target.dbName}
                  style={{ opacity: target.found ? 0.3 : 1 }}
                >
                  <div className='target-img'>
                    <img src={target.img} alt={target.description} />
                    <span className='header--target-description'>
                      {target.description}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      <Outlet
        context={{
          game,
          setGame,
          setTimer,
          time,
          handleGameStart,
          zoomWindowVisible,
        }}
      />
    </div>
  );
}
