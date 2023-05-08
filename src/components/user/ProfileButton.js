/* eslint-disable no-nested-ternary */
/* eslint-disable react/prop-types */
import { useState, useEffect, useRef } from 'react';
import { handleSignOut } from '../../firebase';
import defaultProfileIcon from '../../assets/icons/profile-jesus.png';

export default function ProfileButton({ user }) {
  const dialogRef = useRef(null);
  const buttonRef = useRef(null);
  const [hudIsClosing, setHudIsClosing] = useState(false);

  function handleClick(e) {
    e.stopPropagation();
    if (dialogRef.current.hasAttribute('open')) {
      setHudIsClosing(true);
    } else {
      dialogRef.current.show();
    }
  }

  function closeOnClick(e) {
    if (!dialogRef.current.contains(e.target)) {
      setHudIsClosing(true);
    }
  }

  function handleAnimationEnd() {
    console.log('animation-end')
    if (hudIsClosing) {
      dialogRef.current.close();
      setHudIsClosing(false);
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
      <button
        ref={buttonRef}
        className='user-button'
        type='button'
        onClick={handleClick}
      >
        <div className='user-button--img'>
          <img
            src={user.photoURL ?? defaultProfileIcon}
            referrerPolicy='no-referrer'
            alt='beautiful avatar'
          />
        </div>
        <div className='user-name'>{user.displayName ?? user.email}</div>
      </button>
      <dialog ref={dialogRef} className='user-hud'>
        <div
          className={`user-hud-contents ${hudIsClosing ? 'closing' : ''}`}
          onAnimationEnd={handleAnimationEnd}
        >
          <div className='user-hud-content-wrapper'>
            <button type='button'>Account</button>
            <button type='button' onClick={handleSignOut}>
              Sign out
            </button>
          </div>
        </div>
      </dialog>
    </div>
  );
}
