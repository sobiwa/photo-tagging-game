/* eslint-disable consistent-return */
import { Outlet, useNavigate, Link, useNavigation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { onIdTokenChanged } from 'firebase/auth';
import {
  auth,
  anonLogin,
  userVerificationComplete,
} from './firebase';
import Loading from './components/Loading';
import UserHeader from './components/UserHeader';
import waldoLogo from './assets/waldo.svg';
import Eye from './components/Eye';
import formatTimer from './helpers/formatTimer';

export default function App() {
  const navigation = useNavigation();
  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState(false);
  const [navigationLoad, setNavigationLoad] = useState(false);
  const [game, setGame] = useState(null);
  const [timer, setTimer] = useState(null);
  const [user, setUser] = useState(null);
  const [zoomWindowVisible, setZoomWindowVisible] = useState(true);

  useEffect(() => {
    async function authStateObserver(firebaseUser) {
      if (firebaseUser === null) {
        anonLogin();
        return;
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
  const time = timer ? formatTimer(timer.current - timer.start) : '00:00:00';

  return (
    <div className='root-container'>
      {isLoading && <Loading />}
      <div className='header'>
        <Link to='/' className='logo-container'>
          <img src={waldoLogo} alt="Where's waldo?" />
        </Link>
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
