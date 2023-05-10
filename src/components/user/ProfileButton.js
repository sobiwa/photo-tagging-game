/* eslint-disable no-nested-ternary */
/* eslint-disable react/prop-types */
import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { handleSignOut } from '../../firebase';
import defaultProfileIcon from '../../assets/icons/profile-jesus.png';

export default function ProfileButton({ user }) {
  const dialogRef = useRef(null);
  const [hudIsOpen, setHudIsOpen] = useState(false);

  function handleClick(e) {
    e.stopPropagation();
    setHudIsOpen((prev) => !prev);
  }

  function closeOnClick(e) {
    if (!dialogRef.current.contains(e.target)) {
      setHudIsOpen(false);
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
      <button className='user-button' type='button' onClick={handleClick}>
        <div className='user-button--img'>
          <img
            src={user.photoURL ?? defaultProfileIcon}
            referrerPolicy='no-referrer'
            alt='beautiful avatar'
          />
        </div>
        <div className='user-name'>{user.displayName ?? user.email}</div>
      </button>
      <div ref={dialogRef} className='user-hud'>
        <div className={`user-hud-contents ${hudIsOpen ? 'open' : ''}`}>
          <div className='user-hud-content-wrapper'>
            <Link
              className='user-hud-button'
              to='account'
              onClick={() => setHudIsOpen(false)}
            >
              Account
            </Link>
            <button
              className='user-hud-button'
              type='button'
              onClick={handleSignOut}
            >
              Sign out
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
