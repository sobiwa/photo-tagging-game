import { initializeApp } from 'firebase/app';
import { getFirestore, doc, getDoc, updateDoc } from 'firebase/firestore';
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

export async function updateHighScores(paintingId) {
  const paintingRef = doc(db, `paintings/${paintingId}`);
  let time = 600000 - 60000;
  const array = paintings.flatMap((painting) =>
    painting.targets.map((target) => {
      time += 60000;
      return {
        ms: time,
        uid: null,
        username: target.description,
        photoURL: target.img,
      };
    })
  );

  array.splice(15);
  console.log(array);
  try {
    await updateDoc(paintingRef, {
      highscores: array,
    });
  } catch (err) {
    console.log(err);
  }
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

export async function getWaldos(painting) {
  const docRef = doc(db, `paintings/${painting}`);
  const docSnap = await getDoc(docRef);
  return docSnap.data();
}

export async function handleSignOut() {
  await signOut(auth);
}

export { auth };
