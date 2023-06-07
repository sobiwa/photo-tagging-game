/* eslint-disable no-nested-ternary */
/* eslint-disable no-await-in-loop */
import { useState, useEffect, useRef } from 'react';
import {
  Form,
  Link,
  useActionData,
  useOutletContext,
  useNavigation,
  Outlet,
  useLocation,
} from 'react-router-dom';
import {
  updateUserInfo,
  deleteAccount,
  reauthEmail,
  updateLeaderboardUser,
  completeVerificationProcess,
  resendVerificationEmail,
  reauthGoogle,
} from '../firebase';
import AvatarSelect from '../components/AvatarSelect';
import Reauth from '../components/Reauth';
import badWordsFilter from '../helpers/badWords';

export async function action({ request }) {
  const formData = await request.formData();
  const { intent, avatar, username, password } = Object.fromEntries(formData);
  if (intent === 'edit') {
    if (username) {
      try {
        const badWord = await badWordsFilter(username);
        if (badWord['is-bad']) {
          return { message: 'bad language not permitted' };
        }
      } catch (err) {
        // bypass error - bad words allowed if error is encountered - in case API ever fails or limit is reached ¯\_(ツ)_/¯
        console.log(err.message);
      }
    }
    try {
      await updateUserInfo(username, avatar);
    } catch (error) {
      return { message: `Error updating user info: ${error.code}` };
    }
    try {
      await updateLeaderboardUser();
      return { message: 'Information updated' };
    } catch (error) {
      return { message: `Error updating leaderboards: ${error.code}` };
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
      console.log(error);
      return { onReauth: true, message: error.code };
    }
  } else if (intent === 'reauth-google') {
    try {
      await reauthGoogle();
      return { onDelete: true, message: 'Reauthorization successful' };
    } catch (error) {
      return { onReauth: true, message: error.message };
    }
  } else if (intent === 'verify') {
    try {
      await completeVerificationProcess();
      return { message: 'Verification complete' };
    } catch (error) {
      return { message: error.message };
    }
  } else if (intent === 'resend') {
    try {
      await resendVerificationEmail();
      return { message: 'Verification email sent' };
    } catch (error) {
      return { message: error.message };
    }
  }
  return {};
}

export default function Account() {
  const navigation = useNavigation();
  const { user } = useOutletContext();
  const actionResponse = useActionData();
  const { pathname } = useLocation();

  const loggingIn = pathname.split('/').includes('sign-in');

  const deleteRef = useRef(null);
  const reauthRef = useRef(null);

  const [username, setUsername] = useState(user?.firebase.displayName ?? '');
  const [update, setUpdate] = useState(null);

  // refreshes state regardless if actionResponse is unchanged
  useEffect(() => {
    if (loggingIn) return;
    if (navigation.state === 'submitting' && !actionResponse?.onReauth) {
      setUpdate(null);
    } else if (navigation.state === 'idle') {
      setUpdate(actionResponse ?? null);
    }
  }, [navigation.state]);

  useEffect(() => {
    if (
      actionResponse?.message === 'auth/requires-recent-login' &&
      reauthRef?.current &&
      !reauthRef.current.hasAttribute('open')
    ) {
      reauthRef.current.showModal();
    } else if (
      actionResponse?.message === 'Reauthorization successful' &&
      reauthRef?.current &&
      reauthRef.current.hasAttribute('open')
    ) {
      reauthRef.current.close();
    }
  }, [actionResponse]);

  useEffect(() => {
    setUsername(user?.firebase.displayName ?? '');
  }, [user]);

  if (update?.message === 'Account deleted') {
    return (
      <div className='account-deleted'>
        Account successfully deleted
        <Link to='/'>Return home</Link>
      </div>
    );
  }

  if (!user && !loggingIn) {
    return (
      <div className='error-page plaque'>
        Must be logged in to view account details
      </div>
    );
  }

  let providerAvatars;

  if (!!user && !user.firebase.isAnonymous) {
    providerAvatars = user.firebase.providerData
      .map((profile) => ({
        photoURL: profile.photoURL,
        id: profile.providerId,
      }))
      .filter((avatar) => avatar.photoURL && avatar.id !== 'password');
  }

  return (
    <div className='account-form'>
      {!!user && (
        <>
          <Form method='post' action='/account'>
            <ul>
              <li>
                <AvatarSelect
                  user={user.firebase}
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
                <Link to='/'>Home</Link>
                <button
                  type='submit'
                  name='intent'
                  value='edit'
                  className='min-content'
                >
                  Submit Changes
                </button>
              </li>
            </ul>
          </Form>
          {!!update && !update.onDelete && !update.onReauth && (
            <div className='form-update-wrapper'>
              <div className='form-update'>{update.message}</div>
            </div>
          )}

          {user.firebase.isAnonymous && (
            <div className='login-warning'>
              Your current information is temporary and anonymous.{' '}
              <Link to='sign-in'>sign in or create an account</Link> to appear
              on leaderboards.
            </div>
          )}
          {!user.firebase.isAnonymous &&
            !user.providerIsGoogle &&
            !user.verificationComplete && (
              <Form className='login-warning' method='post' action='/account'>
                Email verification incomplete. Once link is clicked in
                verification email, complete verification here.
                <div className='form--button-container'>
                  <button type='submit' name='intent' value='verify'>
                    Verify
                  </button>
                  <button type='submit' name='intent' value='resend'>
                    Resend email
                  </button>
                </div>
              </Form>
            )}
          {!user.firebase.isAnonymous && (
            <div className='delete-container'>
              <button
                className='delete'
                type='button'
                onClick={() => deleteRef.current.showModal()}
              >
                Delete Account
              </button>
              <dialog className='modal delete-account' ref={deleteRef}>
                <Form
                  className='modal-contents'
                  method='post'
                  action='/account'
                >
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
                  {update !== null && update.onDelete && (
                    <div className='form-update-wrapper'>
                      <div className='form-update'>{update.message}</div>
                    </div>
                  )}
                </Form>
              </dialog>
            </div>
          )}
          <dialog className='modal delete-account' ref={reauthRef}>
            <Reauth
              googleUser={user.providerIsGoogle}
              setUpdate={setUpdate}
              close={() => {
                reauthRef.current.close();
                deleteRef.current.close();
              }}
            />
            {update?.onReauth && (
              <div className='form-update-wrapper'>
                <div className='form-update'>{update.message}</div>
              </div>
            )}
          </dialog>
        </>
      )}
      <Outlet />
    </div>
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
