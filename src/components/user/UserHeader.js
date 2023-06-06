import { Link } from 'react-router-dom';
import ProfileButton from './ProfileButton';
import defaultProfileIcon from '../../assets/icons/profile-jesus.png';

export default function UserHeader({ user }) {
  return (
    <div className='user-header'>
      {user ? (
        <ProfileButton user={user} />
      ) : (
        <div className='height-100'>
          <Link className='user-button sign-in' to='/account/sign-in'>
            <img src={defaultProfileIcon} alt='profile jesus' />
            <div className='sign-in-text'>Sign in</div>
          </Link>
        </div>
      )}
    </div>
  );
}
