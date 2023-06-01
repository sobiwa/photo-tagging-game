import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { createHashRouter, RouterProvider } from 'react-router-dom';

import App from './App';
import Menu from './routes/Menu';
import ErrorPage from './routes/ErrorPage';
import Game, { loader as gameLoader } from './routes/Game';
import SignUp, { action as signUpAction } from './routes/SignUp';
import Account, { action as accountAction } from './routes/Account';
// import { action as emailLoginAction } from './components/user/LoginForm';
import SignIn, { action as signInAction } from './routes/SignIn';
import LeaderboardMenu from './routes/LeaderboardMenu';
import Leaderboard, { loader as leaderboardLoader } from './routes/Leaderboard';
import './style.css';

const router = createHashRouter([
  {
    path: '/',
    element: <App />,
    // action: emailLoginAction,
    errorElement: <ErrorPage />,
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
            children: [
              { path: 'sign-in', element: <SignIn />, action: signInAction },
            ],
          },
          {
            path: 'leaderboards',
            element: <LeaderboardMenu />,
            children: [
              {
                path: ':paintingId',
                element: <Leaderboard />,
                loader: leaderboardLoader,
              },
            ],
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
