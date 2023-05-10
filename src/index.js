import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { createHashRouter, RouterProvider } from 'react-router-dom';

import App from './App';
import Menu from './routes/Menu';
import ErrorPage from './routes/ErrorPage';
import Game, { loader as gameLoader } from './routes/Game';
import SignUp, { action as signUpAction } from './routes/SignUp';
import Account, { action as accountAction, loader as accountLoader } from './routes/Account';
import { action as emailLoginAction } from './components/user/LoginForm';
import './style.css';

const router = createHashRouter([
  {
    path: '/',
    element: <App />,
    action: emailLoginAction,
    children: [
      {
        errorElement: <ErrorPage />,
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
            action: signUpAction,
          },
          {
            path: 'account',
            element: <Account />,
            // loader: accountLoader,
            action: accountAction,
          },
        ],
      },
    ],
  },
]);

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>
);
