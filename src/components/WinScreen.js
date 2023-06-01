import { Link, useOutletContext, useParams } from 'react-router-dom';
import { getPaintingInfo } from '../data/paintings';

export default function WinScreen({ newRecord, error }) {
  const { time } = useOutletContext();
  const { paintingId } = useParams();
  const paintingInfo = getPaintingInfo(paintingId);
  return (
    <div className='win-screen'>
      {newRecord.highScore && (
        <div className='new-record plaque'>
          <strong>High Score! Congratulations!</strong>
          {newRecord.isAnonymous ? (
            <>
              <span className='login-warning'>
                only signed in users appear on leaderboards
              </span>
              <Link to='/account/sign-in'>Create an account</Link>
            </>
          ) : (
            'You made it on the leaderboard!'
          )}
          <Link to={`/leaderboards/${newRecord.paintingId}`}>
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
