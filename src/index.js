import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { createHashRouter, RouterProvider } from 'react-router-dom';

import App from './App';
import Menu from './routes/Menu';
import Game, { loader as gameLoader } from './routes/Game';
import SignUp, {action as signUpAction} from './routes/SignUp';
import { action as emailLoginAction } from './components/user/LoginForm';
import './style.css';

const router = createHashRouter([
  {
    path: '/',
    element: <App />,
    action: emailLoginAction,
    children: [
      { index: true, element: <Menu /> },
      {
        path: ':paintingId',
        element: <Game />,
        loader: gameLoader,
      },
      {
        path: 'sign-up',
        element: <SignUp />,
        action: signUpAction
      }
    ],
  },
]);

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>
);
