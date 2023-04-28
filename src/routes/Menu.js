import { useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import MenuCard from '../components/MenuCard';
import paintings from '../data/paintings';

export default function Menu() {
  const { setGame, setTimer } = useOutletContext();

  useEffect(() => {
    setGame(null);
    setTimer(null);
  }, []);

  return (
    <div className='menu-container'>
      <ol className='menu--instructions'>
        <li>Pick a painting</li>
        <li>Review the targets</li>
        <li>Find all the targets in the painting</li>
        <ul className='menu--advanced-instructions'>
          <li>Adjust lens zoom with +/↑ and -/↓</li>
        </ul>
      </ol>
      <div className='menu--card-container'>
        {paintings.map((item) => (
          <MenuCard key={item.id} painting={item} />
        ))}
      </div>
    </div>
  );
}
