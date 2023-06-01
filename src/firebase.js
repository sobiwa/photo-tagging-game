/* eslint-disable no-restricted-syntax */
import { initializeApp } from 'firebase/app';
import {
  getFirestore,
  doc,
  getDoc,
  getDocsFromServer,
  setDoc,
  serverTimestamp,
  collection,
} from 'firebase/firestore';
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  updateProfile,
  deleteUser,
  reauthenticateWithPopup,
  EmailAuthProvider,
  reauthenticateWithCredential,
} from 'firebase/auth';
import paintings from './data/paintings';

const firebaseConfig = {
  apiKey: 'AIzaSyCixKLpkY5XFfHtR1pw7OAAHanyDYxnljE',
  authDomain: 'photo-tagging-game-dbb54.firebaseapp.com',
  projectId: 'photo-tagging-game-dbb54',
  storageBucket: 'photo-tagging-game-dbb54.appspot.com',
  messagingSenderId: '237365986258',
  appId: '1:237365986258:web:4f043cc50753f9e5363e0b',
};

// Initialize Firebase
const firebase = initializeApp(firebaseConfig);
const db = getFirestore(firebase);
const auth = getAuth();
const provider = new GoogleAuthProvider();

export async function resetHighScores() {
  const promises = [];
  for (const painting of paintings) {
    let time = 6000 - 600;
    const paintingRef = doc(db, `leaderboards/${painting.id}`);
    const array = paintings.flatMap((item) =>
      item.targets.map((target) => {
        time += 600;
        return {
          computer: true,
          ms: time,
          uid: null,
          username: target.description,
          photoURL: null,
        };
      })
    );

    array.splice(15);
    promises.push(() => setDoc(paintingRef, { leaderboard: array }));
  }
  try {
    await Promise.all(promises.map((promise) => promise()));
  } catch (err) {
    console.log(err);
  }
}

export function getUid() {
  return auth.currentUser?.uid;
}

export async function fetchLeaderboard(paintingId) {
  const paintingRef = doc(db, `leaderboards/${paintingId}`);
  const docSnap = await getDoc(paintingRef);
  const { leaderboard } = docSnap.data();
  return leaderboard;
}

export async function deleteAccount() {
  const user = auth.currentUser;
  await deleteUser(user);
}

export async function reauthGoogle() {
  await reauthenticateWithPopup(auth.currentUser, provider);
}

export async function reauthEmail(password) {
  const user = auth.currentUser;
  const credential = EmailAuthProvider.credential(user.email, password);
  await reauthenticateWithCredential(user, credential);
}

export async function emailSignUp(email, password) {
  const userCredential = await createUserWithEmailAndPassword(
    auth,
    email,
    password
  );
  return userCredential;
}

export async function emailLogin(email, password) {
  const userCredential = await signInWithEmailAndPassword(
    auth,
    email,
    password
  );
  return userCredential;
}

export async function googleLogin() {
  await signInWithPopup(auth, provider);
  // const credential = GoogleAuthProvider.credentialFromResult(result);
  // const token = credential.accessToken;
}

export async function updateUserInfo(username, avatar) {
  await updateProfile(auth.currentUser, {
    displayName: username || null,
    photoURL: avatar,
  });
}

export async function updateLeaderboardUser() {
  const updates = [];
  const { displayName, photoURL, uid } = auth.currentUser;
  const leaderboardsRef = collection(db, 'leaderboards');
  const docsSnap = await getDocsFromServer(leaderboardsRef);
  docsSnap.forEach((item) => {
    const data = item.data();
    const array = data.leaderboard;
    if (array.some((rank) => rank.uid === uid)) {
      const newArray = array.map((rank) =>
        rank.uid === uid ? { ...rank, username: displayName, photoURL } : rank
      );
      updates.push({ newArray, id: item.id });
    }
  });
  if (updates.length) {
    await Promise.all(
      updates.map((update) =>
        setDoc(doc(db, `leaderboards/${update.id}`), {
          leaderboard: update.newArray,
        })
      )
    );
  }
}

export async function getWaldos(painting) {
  const docRef = doc(db, `paintings/${painting}`);
  const docSnap = await getDoc(docRef);
  return docSnap.data();
}

export async function handleSignOut() {
  await signOut(auth);
}

async function fetchUserData(paintingId) {
  const userRef = doc(
    db,
    `users/${auth.currentUser.uid}/paintings/${paintingId}`
  );
  const userSnap = await getDoc(userRef);
  return userSnap.exists() ? userSnap.data() : null;
}

export async function timeStampGameStart(paintingId) {
  const docRef = doc(
    db,
    `users/${auth.currentUser.uid}/paintings/${paintingId}`
  );
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) return 'data exists';
  await setDoc(docRef, { start: serverTimestamp() }, { merge: true });
  return 'time logged';
}

async function evaluateTime(paintingId) {
  const [userData, leaderboard] = await Promise.all([
    fetchUserData(paintingId),
    fetchLeaderboard(paintingId),
  ]);
  const { start, end, frontTime } = userData;
  const timeInSeconds = frontTime / 1000;
  if (Math.abs(end - start - timeInSeconds) > 8)
    throw new Error('Application time and server time do not match');
  if (frontTime < leaderboard[leaderboard.length - 1].ms) {
    const { photoURL, displayName, uid } = auth.currentUser;
    leaderboard.pop();
    leaderboard.push({ ms: frontTime, photoURL, uid, username: displayName });
    leaderboard.sort((a, b) => a.ms - b.ms);
    const leaderboardRef = doc(db, `leaderboards/${paintingId}`);
    await setDoc(leaderboardRef, { leaderboard });
    return 'new high score';
  }
  return null;
}

export async function timeStampGameEnd(paintingId, time) {
  const docRef = doc(db, `users/${auth.currentUser.uid}/paintings/${paintingId}`);
  const docSnap = await getDoc(docRef);
  if (docSnap.data()?.end) return 'data exists';
  await setDoc(
    docRef,
    { end: serverTimestamp(), frontTime: time },
    { merge: true }
  );
  const scoreEvaluation = await evaluateTime(paintingId);
  return scoreEvaluation;
}

export async function getUserTime(paintingId) {
  const userData = await fetchUserData(paintingId);
  return userData?.frontTime;
}

// export async function timeStampGameStart(paintingId) {
//   const docRef = doc(db, `users/${auth.currentUser.uid}`);
//   const docSnap = await getDoc(docRef);
//   if (docSnap.exists()) {
//     if (docSnap.data()[paintingId]) return 'data exists';
//     await updateDoc(docRef, {
//       [`${paintingId}.start`]: serverTimestamp(),
//     });
//     return 'time logged';
//   }
//   await setDoc(docRef, { [paintingId]: { start: serverTimestamp() } });
//   return 'time logged';
// }

export { auth };
