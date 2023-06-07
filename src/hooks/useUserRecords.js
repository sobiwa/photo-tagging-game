import { useEffect, useState } from 'react';
import { getUserData, fetchLeaderboard } from '../firebase';
import formatTimer from '../helpers/formatTimer';

export default function useUserRecords(user) {
  const [userRecords, setUserRecords] = useState({});

  useEffect(() => {
    async function getUserRecords() {
      if (!user) return;
      try {
        const { id, docs } = await getUserData();
        if (docs.length) {
          let correspondingLeaderboards;
          try {
            correspondingLeaderboards = await Promise.all(
              docs.map((painting) =>
                painting.data().frontTime
                  ? fetchLeaderboard(painting.id)
                  : Promise.resolve('incomplete')
              )
            );
          } catch (err) {
            throw new Error(`Problem fetching leaderboards: ${err.message}`);
          }
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
      } catch (err) {
        console.log(err.message);
      }
    }
    getUserRecords();
  }, [user]);

  return userRecords;
}
