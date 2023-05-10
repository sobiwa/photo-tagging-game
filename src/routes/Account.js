/* eslint-disable no-await-in-loop */
import { useState, useEffect } from 'react';
import { Form, Link, useActionData, useOutletContext, useNavigation } from 'react-router-dom';
import { updateUserInfo } from '../firebase';
import AvatarSelect from '../components/AvatarSelect';

// const delay = (time) =>
//   new Promise((res) => {
//     setTimeout(res, time);
//   });

// export async function loader() {
//   let userDetails = await getUserDetails();
//   let attempts = 0;
//   while (userDetails === null && attempts < 3) {
//     userDetails = await getUserDetails();
//     await delay(1500);
//     attempts += 1;
//   }
//   if (userDetails === null && attempts === 3) {
//     throw new Error('Must be logged in to view account details');
//   }
//   return userDetails;
// }

export async function action({ request }) {
  const formData = await request.formData();
  const { avatar, username } = Object.fromEntries(formData);
  try {
    await updateUserInfo(username, avatar);
    return 'Information updated';
  } catch (error) {
    return error.code;
  }
}

export default function Account() {
  const navigation = useNavigation();
  const { user } = useOutletContext();

  if (user === null) {
    return (
      <div className='error-page'>
        Must be logged in to view account details
      </div>
    );
  }

  const [username, setUsername] = useState(user?.displayName ?? '');
  const [update, setUpdate] = useState(null);

  const actionResponse = useActionData();

  const providerAvatars = user.providerData.map((profile) => ({
    photoURL: profile.photoURL,
    id: profile.providerId,
  }));

  useEffect(() => {
    if (navigation.state === 'submitting') {
      setUpdate(null)
    } else if (navigation.state === 'idle') {
      setUpdate(actionResponse);
    }
  }, [navigation.state])

  return (
    <Form className='account-form' method='post'>
      <ul>
        <li>
          <AvatarSelect
            currentAvatar={user.photoURL}
            providerAvatars={providerAvatars}
          />
        </li>
        <li>
          <label htmlFor='username'>
            Username
            <input
              id='username'
              type='text'
              name='username'
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </label>
        </li>
        <li className='form--button-container'>
          <Link to='/'>Cancel</Link>
          <button type='submit'>Submit Changes</button>
        </li>
      </ul>
      {update && (
        <div className='form-update-wrapper'>
          <div className='form-update'>{actionResponse}</div>
        </div>
      )}
    </Form>
  );
}
