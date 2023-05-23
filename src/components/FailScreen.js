import { Link } from 'react-router-dom';

export default function FailScreen({ message, resume }) {
  return (
    <div className='red-fade'>
      <div className='fail-screen-container'>
        <div className='fail-screen-message'>{`Server Error:\n${message}`}</div>
        Return to main menu and try again or continue without registering score
        to server...
        <div className='form--button-container'>
          <Link to='/'>Return</Link>
          <button type='button' onClick={resume}>
            Continue
          </button>
        </div>
      </div>
    </div>
  );
}
