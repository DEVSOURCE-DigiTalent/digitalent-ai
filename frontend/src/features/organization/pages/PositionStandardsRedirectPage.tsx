import { Navigate, useLocation } from 'react-router-dom';

/** Keep old bookmarks working while position standards live inside the course ceiling matrix. */
export function PositionStandardsRedirectPage() {
  const { search } = useLocation();
  const positionId = new URLSearchParams(search).get('positionId');
  const target = new URLSearchParams({ tab: 'ceilings' });
  if (positionId) target.set('positionId', positionId);
  return <Navigate to={`/enterprise/setup?${target.toString()}`} replace />;
}
