import { Navigate, useSearchParams } from 'react-router-dom';

/** Legacy entry URLs now lead directly into the enterprise journey. */
export function PortalSelectorPage() {
  const [searchParams] = useSearchParams();
  return <Navigate to={searchParams.get('intent') === 'register' ? '/business/try' : '/business'} replace />;
}

export function RootRoute() {
  return <Navigate to="/business" replace />;
}
