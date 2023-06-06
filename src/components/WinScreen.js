import { Link, useOutletContext } from 'react-router-dom';
import { getPaintingInfo } from '../data/paintings';

export default function WinScreen({ paintingId, newRecord, error }) {
  const { highScore, isAnonymous, emailVerified } = newRecord;
  const { time, setGame } = useOutletContext();
  const paintingInfo = getPaintingInfo(paintingId);

  function clearGame() {
    setGame(null);
  }

  return (
    <div className='win-screen'>
      {highScore && (
        <div className='new-record plaque'>
          <strong>High Score! Congratulations!</strong>
          {isAnonymous || !emailVerified ? (
            <>
              <span className='login-warning'>
                only verified users appear on leaderboards
              </span>
              <Link
                to={`/account${isAnonymous ? '/sign-in' : ''}`}
                onClick={() => clearGame()}
              >
                {isAnonymous ? 'Create an account' : 'Manage account'}
              </Link>
            </>
          ) : (
            'You made it on the leaderboard!'
          )}
          <Link to={`/leaderboards/${paintingId}`} onClick={() => clearGame()}>
            Visit Leaderboard
          </Link>
        </div>
      )}
      <h2>{paintingInfo.title}</h2>
      <h3>{paintingInfo.artist}</h3>
      <h4>{paintingInfo.year}</h4>
      <p>{`${paintingInfo.targets.length} targets found in:`}</p>
      <h1>{time}</h1>
      <Link to='/'>Return Home</Link>
      {error !== null && <div className='error-page'>{error}</div>}
    </div>
  );
}
