/* eslint-disable jsx-a11y/no-autofocus */
import { Form, Link, redirect, useActionData, useNavigation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { emailSignUp, updateUserInfo } from '../firebase';
import AvatarSelect from '../components/AvatarSelect';

export async function action({ request }) {
  console.log('action')
  const formData = await request.formData();
  const { avatar, username, email, password, confirmPassword } =
    Object.fromEntries(formData);
  if (password !== confirmPassword) {
    return 'passwords do not match';
  }
  try {
    await emailSignUp(email, password);
    await updateUserInfo(username, avatar);
    return redirect('/');
  } catch (error) {
    return error.code;
  }
}

export default function SignUp() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [error, setError] = useState({ handled: true, message: null });

  const actionResponse = useActionData();
  const navigation = useNavigation();

  function getNewError() {
    let newError = { handled: true, message: null };
    switch (actionResponse) {
      case 'passwords do not match':
        newError.message = actionResponse;
        break;
      case 'auth/email-already-in-use':
        newError.message = 'email already in use';
        break;
      case undefined:
        break;
      default:
        newError = { handled: false, message: actionResponse };
    }
    return newError;
  }

  useEffect(() => {
    if (navigation.state === 'submitting') {
      setError({handled: true, message: null})
    } else if (navigation.state === 'idle') {
      setError(getNewError());
    }
  }, [navigation.state])

  return (
    <Form className='sign-up-form' method='post'>
      <ul>
        <li>
          <AvatarSelect />
        </li>
        <li>
          <label htmlFor='username'>
            Username
            <input
              autoFocus
              id='username'
              type='text'
              name='username'
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </label>
        </li>
        <li>
          <label htmlFor='sign-up-email'>
            Email
            {error.message === 'email already in use' && (
              <span className='error'>{error.message}</span>
            )}
            <input
              required
              id='sign-up-email'
              type='email'
              name='email'
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </label>
        </li>
        <li>
          <label htmlFor='sign-up-password'>
            Password
            <input
              required
              minLength={6}
              id='sign-up-password'
              type='password'
              name='password'
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </label>
        </li>
        <li>
          <label htmlFor='confirm-password'>
            Confirm Password
            {error.message === 'passwords do not match' && (
              <span className='error'>{error.message}</span>
            )}
            <input
              required
              minLength={6}
              id='confirm-password'
              type='password'
              name='confirmPassword'
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </label>
        </li>
        <li className='form--button-container'>
          <Link to='/'>Cancel</Link>
          <button type='submit'>Submit</button>
        </li>
      </ul>
      {!error.handled && (
        <div className='unhandled-error'>{`Error:\n${error.message}`}</div>
      )}
    </Form>
  );
}
