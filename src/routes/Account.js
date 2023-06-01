/* eslint-disable no-nested-ternary */
/* eslint-disable no-await-in-loop */
import { useState, useEffect, useRef } from 'react';
import { flushSync } from 'react-dom';
import {
  Form,
  Link,
  useActionData,
  useOutletContext,
  useNavigation,
  Outlet,
  useLocation,
  useNavigate,
} from 'react-router-dom';
import {
  updateUserInfo,
  deleteAccount,
  reauthEmail,
  updateLeaderboardUser,
  emailLogin,
} from '../firebase';
import AvatarSelect from '../components/AvatarSelect';
import Reauth from '../components/Reauth';
import badWordsFilter from '../helpers/badWords';
import LoginForm from '../components/user/LoginForm';

export async function action({ request }) {
  const formData = await request.formData();
  const { intent, avatar, username, password, email } =
    Object.fromEntries(formData);
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
      await updateLeaderboardUser();
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
  const navigate = useNavigate();
  const { user } = useOutletContext();
  const actionResponse = useActionData();
  const { pathname } = useLocation();

  const loggingIn = pathname.split('/').includes('sign-in');

  const deleteRef = useRef(null);

  const [username, setUsername] = useState(user?.displayName ?? '');
  const [update, setUpdate] = useState(null);

  // refreshes state regardless if actionResponse is unchanged
  useEffect(() => {
    if (loggingIn) return;
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

  if (user === null && !loggingIn) {
    return (
      <div className='error-page plaque'>
        Must be logged in to view account details
      </div>
    );
  }

  let providerAvatars;

  if (user && !user.isAnonymous) {
    providerAvatars = user.providerData
      .map((profile) => ({
        photoURL: profile.photoURL,
        id: profile.providerId,
      }))
      .filter((avatar) => avatar.photoURL && avatar.id !== 'password');
  }

  // function openLoginForm() {
  //   flushSync(() => {
  //     setShowLogin(true);
  //   });
  //   loginFormRef.current.showModal();
  // }

  // function closeLoginForm() {
  //   loginFormRef.current.close();
  //   setShowLogin(false);
  // }

  return (
    <>
      {user !== null && (
        <Form className='account-form' method='post' action='/account'>
          {/* {showLogin && (
        <LoginForm ref={loginFormRef} close={() => closeLoginForm()} />
      )} */}
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
              <button type='button' onClick={() => navigate(-1)}>
                Back
              </button>
              <button type='submit' name='intent' value='edit'>
                Submit Changes
              </button>
            </li>
            {user.isAnonymous && (
              <li className='login-warning'>
                Your current information is temporary and anonymous.{' '}
                <Link to='sign-in'>sign in or create an account</Link> to appear
                on leaderboards.
              </li>
            )}
            {!user.isAnonymous && (
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
            )}
          </ul>
          {update !== null && !update.onDelete && (
            <div className='form-update-wrapper'>
              <div className='form-update'>{update.message}</div>
            </div>
          )}
        </Form>
      )}
      <Outlet />
    </>
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
