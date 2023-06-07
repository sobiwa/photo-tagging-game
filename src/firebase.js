/* eslint-disable no-restricted-syntax */
import { initializeApp } from 'firebase/app';
import {
  getFirestore,
  doc,
  getDoc,
  getDocsFromServer,
  setDoc,
  getDocs,
  serverTimestamp,
  collection,
  query,
  where,
} from 'firebase/firestore';
import {
  getAuth,
  signInAnonymously,
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
  linkWithCredential,
  linkWithPopup,
  sendEmailVerification,
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

const firebase = initializeApp(firebaseConfig);
const db = getFirestore(firebase);
const auth = getAuth();
const provider = new GoogleAuthProvider();

// for dev. firebase rules must be adjusted in order to function
export async function resetHighScores() {
  const promises = [];
  for (const painting of paintings) {
    let time = 600000 - 60000;
    const paintingRef = doc(db, `leaderboards/${painting.id}`);
    const array = paintings.flatMap((item) =>
      item.targets.map((target) => {
        time += 60000;
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

export function getVerificationStatus() {
  return auth.currentUser?.emailVerified;
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

export async function anonLogin() {
  try {
    const anon = await signInAnonymously(auth);
    return anon.user;
  } catch (err) {
    throw new Error(`Anonymous sign in failed: ${err.message}`);
  }
}

export async function emailLogin(email, password) {
  const userCredential = await signInWithEmailAndPassword(
    auth,
    email,
    password
  );
  return userCredential;
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

async function getUserScores() {
  const collectionRef = collection(
    db,
    `users/${auth.currentUser.uid}/paintings`
  );
  const q = query(collectionRef, where('frontTime', '!=', null));
  const querySnapshot = await getDocs(q);
  if (querySnapshot.empty) return null;
  return querySnapshot.docs;
}

export async function getUserData() {
  const collectionRef = collection(
    db,
    `users/${auth.currentUser.uid}/paintings`
  );
  const q = query(collectionRef);
  const querySnapshot = await getDocs(q);
  return { id: auth.currentUser.uid, docs: querySnapshot.docs };
}

async function evaluateTime(paintingId, userData, leaderboard) {
  const { start, end, frontTime } = userData;
  const timeInSeconds = frontTime / 1000;
  if (Math.abs(end - start - timeInSeconds) > 8)
    throw new Error('Application time and server time do not match');
  if (frontTime < leaderboard[leaderboard.length - 1].ms) {
    const { photoURL, displayName, uid, isAnonymous, emailVerified } =
      auth.currentUser;
    if (!isAnonymous && emailVerified) {
      leaderboard.pop();
      leaderboard.push({ ms: frontTime, photoURL, uid, username: displayName });
      leaderboard.sort((a, b) => a.ms - b.ms);
      const leaderboardRef = doc(db, `leaderboards/${paintingId}`);
      await setDoc(leaderboardRef, { leaderboard });
    }
    return { highScore: true, isAnonymous, emailVerified };
  }
  return { highScore: false };
}

export async function timeStampGameEnd(paintingId, time) {
  const docRef = doc(
    db,
    `users/${auth.currentUser.uid}/paintings/${paintingId}`
  );
  const docSnap = await getDoc(docRef);
  if (docSnap.data()?.end) return { highScore: false };
  await setDoc(
    docRef,
    { end: serverTimestamp(), frontTime: time },
    { merge: true }
  );
  const [userData, leaderboard] = await Promise.all([
    fetchUserData(paintingId),
    fetchLeaderboard(paintingId),
  ]);
  const scoreEvaluation = await evaluateTime(paintingId, userData, leaderboard);
  return scoreEvaluation;
}

async function postAnonScores(userScores) {
  let leaderboardData;
  try {
    leaderboardData = await Promise.all(
      userScores.map((item) => fetchLeaderboard(item.id))
    );
  } catch (err) {
    throw new Error('error fetching leaderboards');
  }
  try {
    await Promise.all(
      userScores.map((document, index) => {
        const userData = document.data();
        const leaderboard = leaderboardData[index];
        return evaluateTime(document.id, userData, leaderboard);
      })
    );
  } catch (err) {
    throw new Error(`error updating leaderboards${err.message}`);
  }
}

async function beginVerificationProcess() {
  await sendEmailVerification(auth.currentUser);
  const userRef = doc(db, `users/${auth.currentUser.uid}`);
  await setDoc(userRef, { verified: false }, { merge: true });
}

export async function resendVerificationEmail() {
  await sendEmailVerification(auth.currentUser);
}

// dev
export async function bypassVerification() {
  const userScores = await getUserScores();
  if (userScores) {
    try {
      // refresh token to reflect up-to-date verification status
      // and grant permission in firebase rules
      await auth.currentUser.getIdToken(true);

      console.log('posting scores');
      await postAnonScores(userScores);
    } catch (err) {
      throw new Error(`err posting scores: ${err.message}`);
    }
  }
}

export async function completeVerificationProcess() {
  // reload user to accurately read auth.currentUser.emailVerified
  await auth.currentUser.reload();

  if (!auth.currentUser.emailVerified) throw new Error('Verification failed');
  const userRef = doc(db, `users/${auth.currentUser.uid}`);

  // abort if process has already completed
  const userData = await getDoc(userRef);
  if (userData.exists()) {
    const { verified } = userData.data();
    if (verified) throw new Error('Records show email is already verified');
  }

  const userScores = await getUserScores();
  if (userScores) {
    try {
      // refresh token to reflect up-to-date verification status
      // and grant permission in firebase rules
      await auth.currentUser.getIdToken(true);

      console.log('posting scores');
      await postAnonScores(userScores);
    } catch (err) {
      throw new Error(`err posting scores: ${err.message}`);
    }
  }
  await setDoc(userRef, { verified: true }, { merge: true });
  await auth.currentUser.getIdToken(true);
}

export async function userVerificationComplete() {
  const userRef = doc(db, `users/${auth.currentUser.uid}`);
  const userData = await getDoc(userRef);
  return userData.exists() ? userData.data().verified : null;
}

export async function emailSignUp(email, password) {
  if (auth.currentUser && auth.currentUser.isAnonymous) {
    const credential = EmailAuthProvider.credential(email, password);
    try {
      // unlike google, sign in and sign up are separate,
      // therefore goes straight into linking
      await linkWithCredential(auth.currentUser, credential);
      await beginVerificationProcess();
      return 'Anonymous account successfully upgraded';
    } catch (err) {
      if (err.code === 'auth/email-already-in-use') {
        throw new Error('email');
      }
      throw new Error(`Error upgrading anonymous account: ${err.code}`);
    }
  } else {
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      return 'Account successfully created';
    } catch (err) {
      if (err.code === 'auth/email-already-in-use') {
        throw new Error('email');
      }
      throw new Error(`Error creating account: ${err.code}`);
    }
  }
}

export async function googleLogin() {
  if (auth.currentUser && auth.currentUser.isAnonymous) {
    const userScores = await getUserScores();

    // attempts link only if there is anything worth linking
    // avoids additional UI if account already exists
    if (userScores) {
      try {
        await linkWithPopup(auth.currentUser, provider);
        await postAnonScores(userScores);
        return 'Anonymous account successfully upgraded';
      } catch (err) {
        throw new Error(err.code);
      }
    }
  }
  try {
    await signInWithPopup(auth, provider);
    return 'Account successfully created';
  } catch (err) {
    throw new Error(err.message);
  }
}

// for when user has scores under anon and also a google account
// already with the app. User interaction required to prompt another
// google popup after attempt at linking (see above function)
export async function googleBypass() {
  await signInWithPopup(auth, provider);
}

export async function getUserTime(paintingId) {
  const userData = await fetchUserData(paintingId);
  return userData?.frontTime;
}

export { auth };
