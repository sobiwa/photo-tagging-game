import uniqid from 'uniqid';
import { useLoaderData } from 'react-router-dom';
import { fetchLeaderboard } from '../firebase';
import formatTimer from '../helpers/formatTimer';
import paintings, { findAvatar } from '../data/paintings';
import defaultProfileIcon from '../assets/icons/profile-jesus.png';
import MenuCard from '../components/MenuCard';

const delay = (time) =>
  new Promise((res) => {
    setTimeout(res, time);
  });

export async function loader({ params }) {
  const { paintingId } = params;
  const leaderboard = await fetchLeaderboard(paintingId);
  const paintingInfo = paintings.find((item) => item.id === paintingId);
  return { paintingInfo, leaderboard };
}

export default function Leaderboard() {
  const { paintingInfo, leaderboard } = useLoaderData();
  return (
    <div className='leaderboard-container'>
      <MenuCard painting={paintingInfo} />
      <div className='leaderboard-wrapper'>
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
              const { ms, photoURL, username, computer } = entry;
              const time = formatTimer(ms);
              const photo = computer ? findAvatar(username) : photoURL;
              const key = uniqid();
              return (
                <tr key={key}>
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
          </tbody>
        </table>
      </div>
    </div>
  );
}
