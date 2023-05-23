import { useEffect } from 'react';
import { Link, Outlet, useOutletContext } from 'react-router-dom';
import paintings from '../data/paintings';

export default function LeaderboardMenu() {
  const { setGame, setTimer } = useOutletContext();
  useEffect(() => {
    setGame(null);
    setTimer(null);
  }, []);
  return (
    <div className='leaderboard-menu'>
      <div className='high-score-link-container'>
        {paintings.map((painting) => (
          <Link key={painting.id} to={painting.id} className='high-score-link'>
            <div className='cube'>
              <div className='face'>
                <img src={painting.thumbnail} alt={painting.title} />
              </div>
              <div className='right side' />
              <div className='top side' />
              <div className='back side' />
            </div>
          </Link>
        ))}
      </div>
      <Outlet />
    </div>
  );
}
