/* eslint-disable jsx-a11y/no-noninteractive-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import { useState, forwardRef } from 'react';
import { useActionData, Form, Link } from 'react-router-dom';
import { emailLogin } from '../../firebase';

export async function action({ request }) {
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

  const response = useActionData();

  if (response === 'success') {
    ref.current.close();
  }

  const incorrectPassword = response === 'auth/wrong-password';
  const invalidEmail = response === 'auth/invalid-email';
  const userNotFound = response === 'auth/user-not-found';

  function closeOnClick(e) {
    const dialogDimensions = ref.current.getBoundingClientRect();
    if (
      e.clientX < dialogDimensions.left ||
      e.clientX > dialogDimensions.right ||
      e.clientY < dialogDimensions.top ||
      e.clientY > dialogDimensions.bottom
    ) {
      ref.current.close();
    }
  }

  return (
    <dialog ref={ref} className='login-form-wrapper' onClick={closeOnClick}>
      <Form className='login-form' method='post'>
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
        <button type='submit'>Sign in</button>
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
    </dialog>
  );
});

export default LoginForm;
