import { lazy, Suspense } from 'react';
import type { RouteObject } from 'react-router-dom';
import { PublicLayout } from '../layouts/PublicLayout';
import { LandingPage } from '../../features/public/pages/LandingPage';
import { CareerCatalogPage } from '../../features/public/pages/CareerCatalogPage';
import { CertificateVerificationPage } from '../../features/public/pages/CertificateVerificationPage';

const ExperienceRoute = lazy(() => import('../../features/experience/pages/ExperienceRoute').then(module => ({ default: module.ExperienceRoute })));

export const publicRoutes: RouteObject[] = [
  { path: '/experience', element: <Suspense fallback={<div>Đang tải giao diện mẫu…</div>}><ExperienceRoute /></Suspense> },
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
