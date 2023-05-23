import { Link, useOutletContext } from 'react-router-dom';

export default function WinScreen({ newRecord, error }) {
  const { game, time } = useOutletContext();
  return (
    <div className='win-screen'>
      {newRecord !== false && (
        <div className='new-record plaque'>
          <strong>Congratulations!</strong> You made it on the leaderboard!
          <Link to={`/leaderboards/${newRecord}`} >
            Visit Leaderboard
          </Link>
        </div>
      )}
      <h2>{game.title}</h2>
      <h3>{game.artist}</h3>
      <h4>{game.year}</h4>
      <p>{`${game.targets.length} targets found in:`}</p>
      <h1>{time}</h1>
      <Link to='/'>Return Home</Link>
      {error !== null && <div className='error-page'>{error}</div>}
    </div>
  );
}
