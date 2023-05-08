/* eslint-disable jsx-a11y/no-noninteractive-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import { useState, forwardRef } from 'react';
import { useActionData, Form, Link } from 'react-router-dom';
import { emailLogin, googleLogin } from '../../firebase';
import googleIcon from '../../assets/icons/google-btn.svg';

export async function action({ request }) {
  console.log('login action');
  const formData = await request.formData();
  const email = formData.get('email');
  const password = formData.get('password');
  try {
    const user = await emailLogin(email, password);
    return 'success';
  } catch (error) {
    return error.code;
  }
}

const LoginForm = forwardRef((props, ref) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [googleError, setGoogleError] = useState(null);

  const response = useActionData();

  async function handleGoogle() {
    try {
      await googleLogin();
      ref.current.close();
    } catch (error) {
      setGoogleError(error);
    }
  }

  if (response === 'success') {
    ref.current.close();
  }

  const incorrectPassword = response === 'auth/wrong-password';
  const invalidEmail = response === 'auth/invalid-email';
  const userNotFound = response === 'auth/user-not-found';

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
      ref.current.close();
    }
  }

  return (
    <dialog ref={ref} className='login-form-container' onClick={closeOnClick}>
      <Form className='login-form' method='post' action='/'>
        <ul>
          <li>
            <label htmlFor='email'>
              Email
              {(invalidEmail || userNotFound) && (
                <span className='error'>
                  {invalidEmail ? 'invalid email' : 'user not found'}
                </span>
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
              {incorrectPassword && (
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
            ref.current.close();
          }}
        >
          Create Account
        </Link>
      </div>
      <div className='or'>OR</div>
      <button type='button' className='google-button' onClick={handleGoogle}>
        <img src={googleIcon} alt='google sign in' />
        Sign in with Google
        {googleError && <span className='error'>{googleError.message}</span>}
      </button>
    </dialog>
  );
});

export default LoginForm;
