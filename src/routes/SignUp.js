/* eslint-disable jsx-a11y/no-autofocus */
import { Form, Link, redirect, useActionData } from 'react-router-dom';
import { useState, useRef } from 'react';
import { updateProfile } from 'firebase/auth';
import { emailSignUp, auth } from '../firebase';
import paintings from '../data/paintings';
import defaultAvatar from '../assets/icons/profile-jesus.png';

function styleBackgroundImage(src) {
  if (src === defaultAvatar) {
    return {
      backgroundImage: `url(${defaultAvatar})`,
      backgroundSize: 'contain',
    };
  }
  const image = new Image();
  image.src = src;
  const { naturalHeight, naturalWidth } = image;
  return {
    backgroundImage: `url(${src})`,
    backgroundSize: naturalHeight > naturalWidth ? 'auto 80%' : '80% auto',
  };
}

export async function action({ request }) {
  const formData = await request.formData();
  const { avatar, username, email, password, confirmPassword } =
    Object.fromEntries(formData);
  if (password !== confirmPassword) {
    return { error: 'passwords do not match' };
  }
  try {
    const userCredential = await emailSignUp(email, password);
    await updateProfile(auth.currentUser, {
      displayName: username || null,
      photoURL: avatar,
    });
    return redirect('/');
  } catch (error) {
    return error.message;
  }
}

export default function SignUp() {
  const selectBox = useRef();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [avatarOption, setAvatarOption] = useState(defaultAvatar);

  const actionResponse = useActionData();
  console.log(actionResponse);

  function showSelectBox() {
    selectBox.current.showModal();
  }

  return (
    <div className='sign-up-page'>
      <Form className='sign-up-form' method='post'>
        <ul>
          <li>
            {/*  eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-noninteractive-element-interactions */}
            <label className='avatar-select' htmlFor='avatar'>
              Avatar
              <div className='custom-select' style={{ width: '200px' }}>
                <select
                  id='avatar'
                  name='avatar'
                  value={avatarOption}
                  readOnly
                  onClick={showSelectBox}
                >
                  <option value={defaultAvatar}>default</option>
                  {paintings.map((painting) =>
                    painting.targets.map((target) => (
                      <option value={target.img}>{target.description}</option>
                    ))
                  )}
                </select>
                <button
                  onClick={showSelectBox}
                  type='button'
                  aria-label='avatar select'
                  className='select-box-button'
                  style={styleBackgroundImage(avatarOption)}
                />
              </div>
            </label>
            <dialog ref={selectBox} className='select-box'>
              <div className='select-box-options-container'>
                <button
                  type='button'
                  className='select-box-button'
                  aria-label='default avatar - jesus from earthly delights'
                  onClick={() => {
                    setAvatarOption(defaultAvatar);
                    selectBox.current.close();
                  }}
                  style={styleBackgroundImage(defaultAvatar)}
                />
                {paintings.map((painting) =>
                  painting.targets.map((target) => (
                    <button
                      key={target.dbName}
                      type='button'
                      className='select-box-button'
                      aria-label={target.description}
                      onClick={() => {
                        setAvatarOption(target.img);
                        selectBox.current.close();
                      }}
                      style={styleBackgroundImage(target.img)}
                    />
                  ))
                )}
              </div>
            </dialog>
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
              {actionResponse?.error &&
                actionResponse.error === 'passwords do not match' && (
                  <span className='error'>{actionResponse.error}</span>
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
      </Form>
    </div>
  );
}
