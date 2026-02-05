import { RouterProvider, createRouter, createRoute, createRootRoute, redirect } from '@tanstack/react-router';
import { useInternetIdentity } from './hooks/useInternetIdentity';
import AppLayout from './components/layout/AppLayout';
import SignInPage from './pages/SignInPage';
import DashboardPage from './pages/DashboardPage';
import CreatePaymentPage from './pages/CreatePaymentPage';
import PaymentDetailsPage from './pages/PaymentDetailsPage';
import PaymentHistoryPage from './pages/PaymentHistoryPage';
import IntegrationsPage from './pages/IntegrationsPage';
import PublicPaymentPage from './pages/PublicPaymentPage';
import NotFoundPage from './pages/NotFoundPage';
import { ThemeProvider } from 'next-themes';
import { Toaster } from '@/components/ui/sonner';

const rootRoute = createRootRoute({
  component: AppLayout,
});

const signInRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: SignInPage,
});

const dashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/dashboard',
  component: DashboardPage,
});

const createPaymentRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/create-payment',
  component: CreatePaymentPage,
});

const paymentDetailsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/payment/$id',
  component: PaymentDetailsPage,
});

const paymentHistoryRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/history',
  component: PaymentHistoryPage,
});

const integrationsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/integrations',
  component: IntegrationsPage,
});

const publicPaymentRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/pay/$id',
  component: PublicPaymentPage,
});

const notFoundRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '*',
  component: NotFoundPage,
});

const routeTree = rootRoute.addChildren([
  signInRoute,
  dashboardRoute,
  createPaymentRoute,
  paymentDetailsRoute,
  paymentHistoryRoute,
  integrationsRoute,
  publicPaymentRoute,
  notFoundRoute,
]);

const router = createRouter({ routeTree });

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
      <RouterProvider router={router} />
      <Toaster />
    </ThemeProvider>
  );
}
