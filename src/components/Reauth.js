import { useState } from 'react';
import { Form } from 'react-router-dom';
import googleIcon from '../assets/icons/google-btn.svg';

export default function Reauth({ googleUser, setUpdate, close }) {
  const [password, setPassword] = useState('');

  return (
    <>
      <div className='modal-heading'>Reauthentication required</div>
      <Form method='post' action='/account'>
        {googleUser ? (
          <button
            type='submit'
            className='google-button'
            name='intent'
            value='reauth-google'
          >
            <img src={googleIcon} alt='google reauthentication' />
            Reauthenticate with Google
          </button>
        ) : (
          <>
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
              <button type='submit' name='intent' value='reauth'>
                Submit
              </button>
            </div>
          </>
        )}
      </Form>
    </>
  );
}
