import { Link, useOutletContext } from 'react-router-dom';

export default function WinScreen() {
  const {game, time} = useOutletContext();
  return (
    <div className='win-screen'>
      <h2>{game.title}</h2>
      <h3>{game.artist}</h3>
      <h4>{game.year}</h4>
      <p>{`${game.targets.length} targets found in:`}</p>
      <h1>{time}</h1>
      <Link to='/'>Return Home</Link>
    </div>
  )


}
