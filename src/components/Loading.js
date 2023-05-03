import unicorn from '../assets/paintings/targets/final-judgment/unicorn-rider.png';

export default function Loading() {
  return (
    <div className='red-fade'>
      <div className='loading-animation'>
        <img src={unicorn} alt='loading...' />
      </div>
      <div className='loading-text'>
        Loading
        <div className='dot' />
        <div className='dot' />
        <div className='dot' />
      </div>
    </div>
  );
}
