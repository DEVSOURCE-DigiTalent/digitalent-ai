import type { RouteObject } from 'react-router-dom';
import { PublicLayout } from '../layouts/PublicLayout';
import { LandingPage } from '../../features/public/landing/LandingPage';
import { CareerCatalogPage } from '../../features/public/career-catalog/CareerCatalogPage';
import { CertificateVerificationPage } from '../../features/certificate/pages/CertificateVerificationPage';

export const publicRoutes: RouteObject[] = [
  {
    path: '/',
    element: <PublicLayout />,
    children: [
      { index: true, element: <LandingPage /> },
      { path: 'careers', element: <CareerCatalogPage /> },
      { path: 'careers/:slug', element: <CareerCatalogPage /> },
      { path: 'verify', element: <CertificateVerificationPage /> },
    ],
  },
];
