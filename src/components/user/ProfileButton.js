/* eslint-disable react/prop-types */
import { useEffect, useRef, useState } from 'react';
import { handleSignOut } from '../../firebase';
import defaultProfileIcon from '../../assets/icons/profile-jesus.png';

export default function ProfileButton({ user }) {
  const dialogRef = useRef(null);
  const buttonRef = useRef(null);
  // const [showDialog, setShowDialog] = useState(false);
  
  console.log(user);

  function handleClick(e) {
    e.stopPropagation();
    if (dialogRef.current.hasAttribute('open')) {
      dialogRef.current.close();
    } else {
      dialogRef.current.show();
    }
    // setShowDialog((prev) => !prev);
  }

  function closeOnClick(e) {
    if (!dialogRef.current.contains(e.target)) {
      console.log('hi');
      dialogRef.current.close();
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
        <img src={user.photoURL ?? defaultProfileIcon} referrerPolicy='no-referrer' alt='beautiful avatar' />
        <div className='user-name'>{user.displayName ?? user.email}</div>
      </button>
      <dialog
        ref={dialogRef}
        className='user-hud'
        // style={{ display: `${showDialog ? 'block' : 'none'}` }}
      >
        <div className='user-hud-contents'>
          <div className='user-hud-content-wrapper'>
            <button type='button' onClick={handleSignOut}>
              Sign out
            </button>
          </div>
        </div>
      </dialog>
    </div>
  );
}
