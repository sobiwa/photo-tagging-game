/* eslint-disable no-nested-ternary */
/* eslint-disable react/prop-types */
import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { handleSignOut } from '../../firebase';
import defaultProfileIcon from '../../assets/icons/profile-jesus.png';
import closeIcon from '../../assets/icons/close.svg';

export default function ProfileButton({ user }) {
  const dialogRef = useRef(null);
  const [hudIsOpen, setHudIsOpen] = useState(false);
  const [error, setError] = useState({});

  function handleClick(e) {
    e.stopPropagation();
    setHudIsOpen((prev) => !prev);
  }

  function closeOnClick(e) {
    if (!dialogRef.current.contains(e.target)) {
      setHudIsOpen(false);
    }
  }

  function closeHud() {
    setHudIsOpen(false);
  }

  async function signOut() {
    try {
      await handleSignOut();
    } catch (err) {
      setError({ for: 'sign out', message: err.message });
    }
  }

  useEffect(() => {
    window.addEventListener('click', closeOnClick);
    return () => {
      window.removeEventListener('click', closeOnClick);
    };
  }, []);

  return (
    <div className='height-100 user-button-container'>
      {error.for === 'sign out' && (
        <div className='sign-out-error'>
          {error.message}
          <button
            className='close-button'
            type='button'
            onClick={() => setError({})}
          >
            <img src={closeIcon} alt='close' />
          </button>
        </div>
      )}
      <button className='user-button' type='button' onClick={handleClick}>
        <div className='user-button--img'>
          <img
            src={user.photoURL ?? defaultProfileIcon}
            referrerPolicy='no-referrer'
            alt='beautiful avatar'
          />
        </div>
        <div className='user-name'>
          {user.isAnonymous && !user.displayName
            ? 'anon'
            : user.displayName ?? user.email}
        </div>
      </button>
      <div ref={dialogRef} className='user-hud'>
        <div className={`user-hud-contents ${hudIsOpen ? 'open' : ''}`}>
          <div className='user-hud-content-wrapper'>
            <Link
              className='user-hud-button'
              to='/'
              onClick={() => setHudIsOpen(false)}
            >
              Home
            </Link>
            {user.isAnonymous && (
              <Link
                className='user-hud-button'
                to='account/sign-in'
                onClick={() => closeHud()}
              >
                Sign in
              </Link>
            )}
            <Link
              className='user-hud-button'
              to='account'
              onClick={() => closeHud()}
            >
              Account
            </Link>
            <Link
              className='user-hud-button'
              to='leaderboards/earthly-delights'
              onClick={() => closeHud()}
            >
              Leaderboards
            </Link>
            {!user.isAnonymous && (
              <button
                className='user-hud-button'
                type='button'
                onClick={signOut}
              >
                Sign out
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
