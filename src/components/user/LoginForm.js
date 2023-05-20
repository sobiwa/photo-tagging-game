/* eslint-disable jsx-a11y/no-noninteractive-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import { useState, useEffect, forwardRef } from 'react';
import {
  useActionData,
  Form,
  Link,
  useNavigate,
  useNavigation,
} from 'react-router-dom';
import { emailLogin, googleLogin } from '../../firebase';
import googleIcon from '../../assets/icons/google-btn.svg';

export async function action({ request }) {
  const formData = await request.formData();
  const email = formData.get('email');
  const password = formData.get('password');
  try {
    await emailLogin(email, password);
    return 'success';
  } catch (error) {
    return error.code;
  }
}

const LoginForm = forwardRef(({close}, ref) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState({});
  const [googleError, setGoogleError] = useState(null);

  const navigate = useNavigate();
  const navigation = useNavigation();
  const response = useActionData();

  // if (response === 'success') {
  // }

  function getNewError() {
    switch (response) {
      case undefined:
        return {};
      case 'success':
        close();
        return {};
      case 'auth/wrong-password':
        return {
          handled: true,
          for: 'password',
          message: 'incorrect password',
        };
      case 'auth/invalid-email':
        return { handled: true, for: 'email', message: 'invalid email' };
      case 'auth/user-not-found':
        return { handled: true, for: 'email', message: 'user not found' };
      default:
        return { handled: false, message: response };
    }
  }

  useEffect(() => {
    if (navigation.state === 'submitting') {
      setError({ handled: true, message: null });
    } else if (navigation.state === 'idle') {
      setError(getNewError());
    }
  }, [navigation.state, response]);

  async function handleGoogle() {
    try {
      await googleLogin();
      close();
      navigate('/');
    } catch (err) {
      setGoogleError(err);
    }
  }

  function closeOnClick(e) {
    const dialogDimensions = ref.current.getBoundingClientRect();
    if (
      e.clientX &&
      e.clientY &&
      (e.clientX < dialogDimensions.left ||
        e.clientX > dialogDimensions.right ||
        e.clientY < dialogDimensions.top ||
        e.clientY > dialogDimensions.bottom)
    ) {
      close();
    }
  }

  return (
    <dialog ref={ref} className='modal' onClick={closeOnClick}>
      <Form className='login-form' method='post' action='/'>
        <ul>
          <li>
            <label htmlFor='email'>
              Email
              {error.for === 'email' && (
                <span className='error'>{error.message}</span>
              )}
              <input
                required
                type='email'
                id='email'
                name='email'
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </label>
          </li>
          <li>
            <label htmlFor='password'>
              Password
              {error.for === 'password' && (
                <span className='error'>incorrect password</span>
              )}
              <input
                required
                type='password'
                id='password'
                name='password'
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </label>
          </li>
        </ul>
        <div className='form--button-container'>
          <button type='button' onClick={() => ref.current.close()}>
            Cancel
          </button>
          <button type='submit'>Sign in</button>
        </div>
      </Form>
      <div className='sign-up-link'>
        <Link
          to='/sign-up'
          onClick={() => {
            close();
          }}
        >
          Create Account
        </Link>
      </div>
      <div className='or'>OR</div>
      <button type='button' className='google-button' onClick={handleGoogle}>
        <img src={googleIcon} alt='google sign in' />
        Sign in with Google
      </button>
      {!error.handled && (error.message !== undefined) && <div className='error'>{error.message}</div>}
      {googleError && <div className='error'>{googleError.message}</div>}
    </dialog>
  );
});

export default LoginForm;
