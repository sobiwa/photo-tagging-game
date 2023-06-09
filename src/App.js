/* eslint-disable consistent-return */
import { Outlet, useNavigate, Link, useNavigation } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import { onIdTokenChanged } from 'firebase/auth';
import { auth, anonLogin, userVerificationComplete } from './firebase';
import Loading from './components/Loading';
import UserHeader from './components/UserHeader';
import waldoLogo from './assets/waldo.svg';
import Eye from './components/Eye';
import formatTimer from './helpers/formatTimer';
import targetIcon from './assets/icons/target.svg';

export default function App() {
  const navigation = useNavigation();
  const navigate = useNavigate();

  const alertRef = useRef();

  const [isLoading, setIsLoading] = useState(false);
  const [navigationLoad, setNavigationLoad] = useState(false);
  const [game, setGame] = useState(null);
  const [timer, setTimer] = useState(null);
  const [user, setUser] = useState(null);
  const [zoomWindowVisible, setZoomWindowVisible] = useState(true);
  const [showMobileTracker, setShowMobileTracker] = useState(false);

  useEffect(() => {
    async function authStateObserver(firebaseUser) {
      if (firebaseUser === null) {
        try {
          await anonLogin();
          return;
        } catch (err) {
          setUser(null);
          return;
        }
      }
      if (firebaseUser.isAnonymous) {
        setUser({
          firebase: firebaseUser,
          providerIsGoogle: false,
          verificationComplete: false,
        });
      } else {
        const verificationComplete = await userVerificationComplete();
        setUser({
          firebase: firebaseUser,
          providerIsGoogle: firebaseUser.providerData.some(
            (provider) => provider.providerId === 'google.com'
          ),
          verificationComplete,
        });
      }
    }
    onIdTokenChanged(auth, authStateObserver);
  }, []);

  useEffect(() => {
    if (navigation.state === 'idle' || isLoading) {
      setNavigationLoad(false);
      return;
    }
    let loadPending = true;
    const timeoutId = setTimeout(() => {
      loadPending = false;
      setNavigationLoad(true);
    }, 500);
    return () => {
      if (loadPending) {
        clearTimeout(timeoutId);
      }
    };
  }, [navigation.state]);

  function handleGameStart({ targets, id, title, artist, year }) {
    setGame({
      title,
      artist,
      year,
      targets: targets.map((target) => ({ ...target, found: false })),
    });
    setIsLoading(true);
    navigate(id);
  }

  function handleLogoClick() {
    if (game && game.ranked) {
      alertRef.current.showModal();
    } else {
      navigate('/');
    }
  }
  const time = timer ? formatTimer(timer.current - timer.start) : '00:00:00';

  return (
    <div className='root-container'>
      {isLoading && <Loading />}
      <div className='header'>
        <button
          type='button'
          className='logo-container'
          onClick={handleLogoClick}
        >
          <img src={waldoLogo} alt="Where's waldo?" />
        </button>
        <dialog ref={alertRef} className='alert'>
          <p>
            Are you sure you would like to return home? Game will be marked as
            incomplete and you will forfeit eligibility to appear on this
            painting&apos;s leaderboard.
          </p>
          <div className='form--button-container'>
            <Link to='/' onClick={() => alertRef.current.close()}>
              Home
            </Link>
            <button type='button' onClick={() => alertRef.current.close()}>
              Cancel
            </button>
          </div>
        </dialog>
        {!game && <UserHeader user={user?.firebase} />}
        {game && (
          <div className='game-header'>
            <Eye
              control={() => {
                setZoomWindowVisible((prev) => !prev);
              }}
              open={zoomWindowVisible}
            />
            <div className='timer'>{time}</div>
            {window.innerWidth < 450 ? (
              <div className='mobile--waldo-tracker'>
                <button
                  type='button'
                  aria-label='display targets'
                  onClick={() => setShowMobileTracker((prev) => !prev)}
                >
                  <img src={targetIcon} alt='target icon' />
                </button>
                <div
                  className={`drop-down-wrapper ${
                    showMobileTracker ? 'open' : ''
                  }`}
                >
                  <div className='drop-down'>
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
                </div>
              </div>
            ) : (
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
            )}
          </div>
        )}
      </div>
      {navigationLoad && <Loading />}
      <div className='main'>
        <Outlet
          context={{
            game,
            setGame,
            time,
            timer,
            setTimer,
            handleGameStart,
            zoomWindowVisible,
            setIsLoading,
            user,
          }}
        />
      </div>
    </div>
  );
}
