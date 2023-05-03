import defaultProfileIcon from '../../assets/icons/profile-jesus.png';

export default function UserLoginButton({handleClick}) {

  return (
    <div className='height-100'>
      <button
        className='user-button'
        type='button'
        onClick={handleClick}
      >
        <img src={defaultProfileIcon} alt='profile jesus' />
        Sign in
      </button>
    </div>
  );
}
