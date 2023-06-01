import { useRef, useState } from 'react';
import { flushSync } from 'react-dom';
import ProfileButton from './ProfileButton';
import LoginForm from './LoginForm';
import defaultProfileIcon from '../../assets/icons/profile-jesus.png';
import { Link } from 'react-router-dom';

export default function UserHeader({ user }) {
  const loginFormRef = useRef();
  const [loginFormOpen, setLoginFormOpen] = useState(false);

  // need useState because LoginForm exists in background otherwise
  // it then attempts renders with useActionData of other forms causing error
  function openLoginForm() {
    flushSync(() => {
      setLoginFormOpen(true);
    });
    loginFormRef.current.showModal();
  }

  function closeLoginForm() {
    loginFormRef.current.close();
    setLoginFormOpen(false);
  }
  return (
    <div className='user-header'>
      {loginFormOpen && (
        <LoginForm ref={loginFormRef} close={() => closeLoginForm()} />
      )}
      {user !== null ? (
        <ProfileButton user={user} />
      ) : (
        <div className='height-100'>
          {/* <button
            className='user-button sign-in'
            type='button'
            onClick={openLoginForm}
          > */}
          <Link className='user-button sign-in' to='/account/sign-in'>
            <img src={defaultProfileIcon} alt='profile jesus' />
            <div className='sign-in-text'>Sign in</div>
          </Link>
          {/* </button> */}
        </div>
      )}
    </div>
  );
}
