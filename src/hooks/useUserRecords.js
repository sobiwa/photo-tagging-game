import { useEffect, useState } from 'react';
import { getUserData, fetchLeaderboard } from '../firebase';
import formatTimer from '../helpers/formatTimer';

export default function useUserRecords(user) {
  const [userRecords, setUserRecords] = useState({});

  async function getUserRecords() {
    if (!user) return;
    const { id, docs } = await getUserData();
    if (docs.length) {
      const correspondingLeaderboards = await Promise.all(
        docs.map((painting) =>
          painting.data().frontTime
            ? fetchLeaderboard(painting.id)
            : Promise.resolve('incomplete')
        )
      );
      const newUserRecords = {};
      docs.forEach((painting, index) => {
        const { frontTime } = painting.data();
        newUserRecords[painting.id] = frontTime
          ? {
              time: formatTimer(frontTime),
              recordHolder: correspondingLeaderboards[index].some(
                (rank) => rank.uid === id
              ),
            }
          : 'incomplete';
      });
      setUserRecords(newUserRecords);
    }
  }

  useEffect(() => {
    getUserRecords();
  }, [user]);

  return userRecords;
}
