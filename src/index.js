import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import Viewer from './components/Viewer.js';
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { createHashRouter, RouterProvider } from 'react-router-dom';
import './style.css';

const firebaseConfig = {
  apiKey: 'AIzaSyCixKLpkY5XFfHtR1pw7OAAHanyDYxnljE',
  authDomain: 'photo-tagging-game-dbb54.firebaseapp.com',
  projectId: 'photo-tagging-game-dbb54',
  storageBucket: 'photo-tagging-game-dbb54.appspot.com',
  messagingSenderId: '237365986258',
  appId: '1:237365986258:web:4f043cc50753f9e5363e0b',
};

// Initialize Firebase
// const firebase = initializeApp(firebaseConfig);
// const db = getFirestore(firebase);

const router = createHashRouter([
  {
    path: '/',
    element: <Viewer />,
  },
]);

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>
);
