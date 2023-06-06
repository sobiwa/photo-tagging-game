import { useState } from 'react';
import { Form } from 'react-router-dom';
import { reauthGoogle } from '../firebase';
import googleIcon from '../assets/icons/google-btn.svg';

export default function Reauth({ googleUser, setUpdate, close }) {
  const [googleError, setGoogleError] = useState(null);
  const [password, setPassword] = useState('');

  async function handleGoogle() {
    try {
      await reauthGoogle();
      setUpdate({ onDelete: true, message: 'Reauthorization successful' });
    } catch (error) {
      setGoogleError(error);
    }
  }

  return (
    <>
      <div className='modal-heading'>Reauthentication required</div>
      {googleUser ? (
        <button type='button' className='google-button' onClick={handleGoogle}>
          <img src={googleIcon} alt='google reauthentication' />
          Reauthenticate with Google
          {googleError && <span className='error'>{googleError.message}</span>}
        </button>
      ) : (
        <Form method='post' action='/account'>
          <label htmlFor='reauth-password'>
            Password
            <input
              id='reauth-password'
              name='password'
              type='password'
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </label>
          <div className='form--button-container'>
            <button
              type='button'
              onClick={() => {
                close();
                setUpdate(null);
              }}
            >
              Cancel
            </button>
            <button
              type='submit'
              name='intent'
              value='reauth'
              onClick={() => console.log('hit reauth button')}
            >
              Submit
            </button>
          </div>
        </Form>
      )}
    </>
  );
}
