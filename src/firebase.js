import { initializeApp } from 'firebase/app';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
} from 'firebase/auth';

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

export async function getWaldos(painting) {
  const docRef = doc(db, `paintings/${painting}`);
  const docSnap = await getDoc(docRef);
  return docSnap.data();
}

export function handleSignOut() {
  signOut(auth);
}

export { auth };
