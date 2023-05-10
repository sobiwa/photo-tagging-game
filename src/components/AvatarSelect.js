import { useState, useRef } from 'react';
import paintings from '../data/paintings';
import defaultAvatar from '../assets/icons/profile-jesus.png';

function styleBackgroundImage(src) {
  const image = new Image();
  image.src = src;
  const { naturalHeight, naturalWidth } = image;
  return {
    backgroundImage: `url(${src})`,
    backgroundSize: naturalHeight > naturalWidth ? 'auto 80%' : '80% auto',
  };
}

export default function AvatarSelect({ currentAvatar, providerAvatars }) {
  const selectBox = useRef();
  const [avatarOption, setAvatarOption] = useState(
    currentAvatar ?? defaultAvatar
  );

  function showSelectBox() {
    selectBox.current.showModal();
  }

  return (
    <>
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
                <option key={target.dbName} value={target.img}>
                  {target.description}
                </option>
              ))
            )}
            {providerAvatars?.length &&
              providerAvatars.map((avatar) => (
                <option key={`option-${avatar.id}`} value={avatar.photoURL}>
                  {avatar.id}
                </option>
              ))}
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
          {providerAvatars?.length &&
            providerAvatars.map((avatar) => (
              <button
                key={avatar.id}
                type='button'
                className='select-box-button'
                aria-label={avatar.id}
                onClick={() => {
                  setAvatarOption(avatar.photoURL);
                  selectBox.current.close();
                }}
                style={styleBackgroundImage(avatar.photoURL)}
              />
            ))}
        </div>
      </dialog>
    </>
  );
}
