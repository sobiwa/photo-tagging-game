import { useState, useEffect } from 'react';

export default function AvatarButton({ img, description, handleClick }) {
  const [style, setStyle] = useState({});

  useEffect(() => {
    const image = new Image();
    image.src = img;
    image.onload = () => {
      setStyle({
        backgroundImage: `url(${img})`,
        backgroundSize:
          image.naturalHeight > image.naturalWidth ? 'auto 80%' : '80% auto',
      });
    };
  }, [img]);

  return (
    <button
      type='button'
      className='select-box-button'
      aria-label={description}
      onClick={handleClick}
      style={style}
    />
  );
}
