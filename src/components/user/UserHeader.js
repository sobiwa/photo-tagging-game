import { useRef } from 'react';
import LoginButton from './LoginButton';
import ProfileButton from './ProfileButton';
import LoginForm from './LoginForm';

export default function UserHeader({ user }) {
  const loginFormRef = useRef();

  function openLoginForm() {
    loginFormRef.current.showModal();
  }
  return (
    <div className='user-header'>
      <LoginForm ref={loginFormRef} />
      {user ? (
        <ProfileButton user={user} />
      ) : (
        <LoginButton handleClick={() => openLoginForm()} />
      )}
    </div>
  );
}
