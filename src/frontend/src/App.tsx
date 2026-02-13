import { RouterProvider, createRouter, createRoute, createRootRoute } from '@tanstack/react-router';
import AppLayout from './components/layout/AppLayout';
import SignInPage from './pages/SignInPage';
import DashboardPage from './pages/DashboardPage';
import CreatePaymentPage from './pages/CreatePaymentPage';
import PaymentDetailsPage from './pages/PaymentDetailsPage';
import PaymentHistoryPage from './pages/PaymentHistoryPage';
import IntegrationsPage from './pages/IntegrationsPage';
import PersonalAccountPage from './pages/PersonalAccountPage';
import PublicPaymentPage from './pages/PublicPaymentPage';
import AdminPanelPage from './pages/AdminPanelPage';
import NotFoundPage from './pages/NotFoundPage';
import { ThemeProvider } from 'next-themes';
import { Toaster } from '@/components/ui/sonner';
import { useServiceWorker } from './hooks/useServiceWorker';

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

const personalAccountRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/personal-account',
  component: PersonalAccountPage,
});

const adminPanelRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/admin',
  component: AdminPanelPage,
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
  personalAccountRoute,
  adminPanelRoute,
  publicPaymentRoute,
  notFoundRoute,
]);

const router = createRouter({ routeTree });

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

function AppWithServiceWorker() {
  useServiceWorker();
  
  return (
    <>
      <RouterProvider router={router} />
      <Toaster />
    </>
  );
}

export default function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
      <AppWithServiceWorker />
    </ThemeProvider>
  );
}
