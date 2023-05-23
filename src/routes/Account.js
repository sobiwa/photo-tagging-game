/* eslint-disable no-nested-ternary */
/* eslint-disable no-await-in-loop */
import { useState, useEffect, useRef } from 'react';
import {
  Form,
  Link,
  useActionData,
  useOutletContext,
  useNavigation,
} from 'react-router-dom';
import { updateUserInfo, deleteAccount, reauthEmail } from '../firebase';
import AvatarSelect from '../components/AvatarSelect';
import Reauth from '../components/Reauth';

export async function action({ request }) {
  const formData = await request.formData();
  const { intent, avatar, username, password } = Object.fromEntries(formData);
  if (intent === 'edit') {
    try {
      await updateUserInfo(username, avatar);
      return { message: 'Information updated' };
    } catch (error) {
      return { message: error.code };
    }
  } else if (intent === 'delete') {
    try {
      await deleteAccount();
      return { message: 'Account deleted' };
    } catch (error) {
      return { onDelete: true, message: error.code };
    }
  } else if (intent === 'reauth') {
    try {
      await reauthEmail(password);
      return { onDelete: true, message: 'Reauthorization successful' };
    } catch (error) {
      return { onDelete: true, message: error.code };
    }
  }
}

export default function Account() {
  const navigation = useNavigation();
  const { user } = useOutletContext();
  const actionResponse = useActionData();

  const deleteRef = useRef(null);

  const [username, setUsername] = useState(user?.displayName ?? '');
  const [update, setUpdate] = useState(null);

  // refreshes state regardless if actionResponse is unchanged
  useEffect(() => {
    if (navigation.state === 'submitting') {
      setUpdate(null);
    } else if (navigation.state === 'idle') {
      setUpdate(actionResponse ?? null);
    }
  }, [navigation.state]);

  useEffect(() => {
    setUsername(user?.displayName ?? '');
  }, [user]);

  if (update?.message === 'Account deleted') {
    return (
      <div className='account-deleted'>
        Account successfully deleted
        <Link to='/'>Return home</Link>
      </div>
    );
  }

  if (user === null) {
    return (
      <div className='error-page plaque'>
        Must be logged in to view account details
      </div>
    );
  }

  const providerAvatars = user.providerData
    .map((profile) => ({
      photoURL: profile.photoURL,
      id: profile.providerId,
    }))
    .filter((avatar) => avatar.photoURL && avatar.id !== 'password');

  return (
    <Form className='account-form' method='post' action='/account'>
      <ul>
        <li>
          <AvatarSelect
            currentAvatar={user.photoURL}
            providerAvatars={providerAvatars}
          />
        </li>
        <li>
          <label htmlFor='username'>
            Username
            <input
              id='username'
              type='text'
              name='username'
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              maxLength={28}
            />
          </label>
        </li>
        <li className='form--button-container'>
          <Link to='/'>Back</Link>
          <button type='submit' name='intent' value='edit'>
            Submit Changes
          </button>
        </li>
        <li className='delete-container'>
          <button
            className='delete'
            type='button'
            onClick={() => deleteRef.current.showModal()}
          >
            Delete Account
          </button>
          <dialog className='modal delete-account' ref={deleteRef}>
            <div className='modal-contents'>
              {update?.message === 'auth/requires-recent-login' ? (
                <Reauth
                  user={user}
                  setUpdate={setUpdate}
                  close={() => deleteRef.current.close()}
                />
              ) : (
                <>
                  Are you sure you want to delete your account?
                  <div className='form--button-container'>
                    <button
                      type='button'
                      onClick={() => deleteRef.current.close()}
                    >
                      Cancel
                    </button>
                    <button
                      className='final-delete'
                      type='submit'
                      name='intent'
                      value='delete'
                    >
                      Delete
                    </button>
                  </div>
                </>
              )}
              {update !== null && update.onDelete && (
                <div className='form-update-wrapper'>
                  <div className='form-update'>{update.message}</div>
                </div>
              )}
            </div>
          </dialog>
        </li>
      </ul>
      {update !== null && !update.onDelete && (
        <div className='form-update-wrapper'>
          <div className='form-update'>{update.message}</div>
        </div>
      )}
    </Form>
  );
}

// NOTE: leaving in for reference

/* const delay = (time) =>
  new Promise((res) => {
    setTimeout(res, time);
  });

export async function loader() {
  let userDetails = await getUserDetails();
  let attempts = 0;
  while (userDetails === null && attempts < 3) {
    userDetails = await getUserDetails();
    await delay(1500);
    attempts += 1;
  }
  if (userDetails === null && attempts === 3) {
    throw new Error('Must be logged in to view account details');
  }
  return userDetails;
} */
