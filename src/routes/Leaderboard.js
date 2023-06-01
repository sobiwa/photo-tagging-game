import uniqid from 'uniqid';
import { useLoaderData, useOutletContext } from 'react-router-dom';
import { fetchLeaderboard, getUid, getUserTime } from '../firebase';
import formatTimer from '../helpers/formatTimer';
import paintings, { findAvatar } from '../data/paintings';
import defaultProfileIcon from '../assets/icons/profile-jesus.png';
import MenuCard from '../components/MenuCard';

export async function loader({ params }) {
  const { paintingId } = params;
  const leaderboard = await fetchLeaderboard(paintingId);
  const paintingInfo = paintings.find((item) => item.id === paintingId);
  const uid = getUid();
  const response = {
    paintingInfo,
    leaderboard,
    uid,
  };
  if (uid && !leaderboard.some((user) => user.uid === uid)) {
    try {
      const userTime = await getUserTime(paintingId);
      console.log(userTime);
      response.userTime = userTime;
    } catch (err) {
      console.log(err.message);
    }
  }
  return response;
}

export default function Leaderboard() {
  const { paintingInfo, leaderboard, uid, userTime } = useLoaderData();
  const { user } = useOutletContext();
  return (
    <div className='leaderboard-container'>
      <MenuCard painting={paintingInfo} />
      <div className='leaderboard-wrapper plaque'>
        <table className='leaderboard'>
          <thead>
            <tr>
              <th scope='col' colSpan={2}>
                User
              </th>
              <th scope='col'>Time</th>
            </tr>
          </thead>
          <tbody>
            {leaderboard.map((entry, index) => {
              const {
                ms,
                photoURL,
                username,
                computer,
                uid: leaderboardUid,
              } = entry;
              const time = formatTimer(ms);
              const photo = computer ? findAvatar(username) : photoURL;
              const key = uniqid();
              return (
                <tr
                  key={key}
                  className={
                    leaderboardUid === uid ? 'leaderboard--current-user' : ''
                  }
                >
                  <td className='leaderboard--ranking'>{index + 1}</td>
                  <td className='leaderboard--user-info'>
                    <div className='leaderboard--user-avatar'>
                      <img src={photo ?? defaultProfileIcon} alt='user' />
                    </div>
                    {username}
                  </td>
                  <td className='leaderboard--time'>{time}</td>
                </tr>
              );
            })}
            {userTime !== undefined && (
              <tr className='leaderboard--current-user'>
                <td className='leaderboard--ranking'>...</td>
                <td className='leaderboard--user-info'>
                  <div className='leaderboard--user-avatar'>
                    <img
                      src={user?.photoURL ?? defaultProfileIcon}
                      alt='user'
                    />
                  </div>
                  {user?.displayName ?? user?.email}
                </td>
                <td className='leaderboard--time'>{formatTimer(userTime)}</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
