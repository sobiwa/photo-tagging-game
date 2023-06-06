/* eslint-disable jsx-a11y/no-autofocus */
import {
  Form,
  Link,
  redirect,
  useActionData,
  useNavigation,
  useOutletContext,
} from 'react-router-dom';
import { useEffect, useState } from 'react';
import { emailSignUp, updateUserInfo } from '../firebase';
import AvatarSelect from '../components/AvatarSelect';
import badWordsFilter from '../helpers/badWords';

export async function action({ request }) {
  const formData = await request.formData();
  const { avatar, username, email, password, confirmPassword } =
    Object.fromEntries(formData);
  if (password !== confirmPassword) {
    return 'passwords do not match';
  }
  if (username) {
    try {
      const badWord = await badWordsFilter(username);
      if (badWord['is-bad']) {
        return 'bad language not permitted';
      }
    } catch (err) {
      // bypass error - bad words allowed if error is encountered - in case API ever fails or limit is reached ¯\_(ツ)_/¯
      console.log(err.message);
      return 'bad language filter error';
    }
  }
  try {
    await emailSignUp(email, password);
  } catch (err) {
    return err.message;
  }
  try {
    await updateUserInfo(username, avatar);
    return redirect('/account');
  } catch (error) {
    return `Account created, but error updating info: ${error.code}. Manage details on the account page.`;
  }
}

export default function SignUp() {
  const { user } = useOutletContext();

  const [username, setUsername] = useState(user?.firebase.displayName ?? '');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [error, setError] = useState({ handled: true, message: null });

  const actionResponse = useActionData();
  const navigation = useNavigation();

  useEffect(() => {
    setUsername(user?.firebase.displayName ?? '');
  }, [user]);

  function getNewError() {
    let newError = { handled: true, message: null };
    switch (actionResponse) {
      case 'passwords do not match':
        newError.for = 'password';
        newError.message = actionResponse;
        break;
      case 'email':
        newError.for = 'email';
        newError.message = 'email already in use';
        break;
      case 'bad language not permitted':
        newError.for = 'username';
        newError.message = actionResponse;
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
      setError({ handled: true, message: null });
    } else if (navigation.state === 'idle') {
      setError(getNewError());
    }
  }, [navigation.state]);

  return (
    <Form className='sign-up-form' method='post'>
      <ul>
        <li>
          <AvatarSelect user={user?.firebase} />
        </li>
        <li>
          <label htmlFor='username1'>
            Username
            {error.for === 'username' && (
              <span className='error'>{error.message}</span>
            )}
            <input
              autoFocus
              required
              id='username1'
              type='text'
              name='username'
              value={username}
              maxLength={28}
              onChange={(e) => setUsername(e.target.value)}
            />
          </label>
        </li>
        <li>
          <label htmlFor='sign-up-email'>
            Email
            {error.for === 'email' && (
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
            {error.for === 'password' && (
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
