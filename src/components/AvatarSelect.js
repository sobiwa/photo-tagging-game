/* eslint-disable jsx-a11y/no-noninteractive-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import { useState, useRef } from 'react';
import paintings from '../data/paintings';
import defaultAvatar from '../assets/icons/profile-jesus.png';
import AvatarButton from './AvatarButton';

export default function AvatarSelect({ currentAvatar, providerAvatars }) {
  const selectBox = useRef(null);
  const [avatarOption, setAvatarOption] = useState(
    currentAvatar ?? defaultAvatar
  );

  function showSelectBox() {
    selectBox.current.showModal();
  }

  function closeOnClick(e) {
    const dialogDimensions = selectBox?.current.getBoundingClientRect();
    if (
      dialogDimensions &&
      e.clientX &&
      e.clientY &&
      (e.clientX < dialogDimensions.left ||
        e.clientX > dialogDimensions.right ||
        e.clientY < dialogDimensions.top ||
        e.clientY > dialogDimensions.bottom)
    ) {
      selectBox.current.close();
    }
  }

  function selectAvatar(img) {
    setAvatarOption(img);
    if (selectBox?.current) {
      selectBox.current.close();
    }
  }

  const extraAvatars = providerAvatars?.length > 0;

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
            {extraAvatars &&
              providerAvatars.map((avatar) => (
                <option key={`option-${avatar.id}`} value={avatar.photoURL}>
                  {avatar.id}
                </option>
              ))}
          </select>
          <AvatarButton
            img={avatarOption}
            description='avatar select'
            handleClick={() => showSelectBox()}
          />
        </div>
      </label>
      <dialog ref={selectBox} className='select-box' onClick={closeOnClick}>
        <div className='select-box-options-container'>
          <AvatarButton
            img={defaultAvatar}
            description='default avatar - jesus from earthly delights'
            handleClick={() => selectAvatar(defaultAvatar)}
          />
          {paintings.map((painting) =>
            painting.targets.map((target) => (
              <AvatarButton
                key={target.dbName}
                img={target.img}
                description={target.description}
                handleClick={() => selectAvatar(target.img)}
              />
            ))
          )}
          {extraAvatars &&
            providerAvatars.map((avatar) => (
              <AvatarButton
                key={avatar.id}
                img={avatar.photoURL}
                description={avatar.id}
                handleClick={() => selectAvatar(avatar.photoURL)}
              />
            ))}
        </div>
      </dialog>
    </>
  );
}
