import { useRouteError } from 'react-router-dom';

export default function ErrorPage() {
  const error = useRouteError();
  return <div className='error-page'>{error?.message ?? 'page not found'}</div>;
}
