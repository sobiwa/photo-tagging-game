import { useEffect } from 'react';
import { useOutletContext, useRouteError } from 'react-router-dom';

export default function ErrorPage() {
  const error = useRouteError();
  const { setIsLoading } = useOutletContext();
  useEffect(() => {
    setIsLoading(false);
  }, []);
  return <div className='error-page plaque'>{error?.message ?? 'page not found'}</div>;
}
