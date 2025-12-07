'use client';

// 1. React core
import React, { useEffect, useState } from 'react';

// 2. Next.js framework imports
import { usePathname, useRouter } from 'next/navigation';

// 3. Application-level state
import { useGetAuthUserQuery } from '@/state/api';

// 4. Internal components (layout and UI structure)
import Navbar from '@/components/NavigationBar';
import Sidebar from '@/components/AppSidebar';
import { SidebarProvider } from '@/components/ui/sidebar';

// 5. Project constants
import { NAVBAR_HEIGHT } from '@/lib/constants';

// Dashboard layout component: Wraps dashboard pages with navigation,
// sidebar, and role-based access control.
const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  // Authenticated user info retrieved from global API state
  const { data: authUser, isLoading: authLoading } = useGetAuthUserQuery();

  // Routing utilities for dashboard redirection
  const router = useRouter();
  const pathname = usePathname();

  // Loading state ensures UI waits for role validation
  const [isLoading, setIsLoading] = useState(true);

  // Role-based page protection:
  // Ensures managers cannot access tenant pages and tenants cannot access manager pages.
  useEffect(() => {
    if (authUser) {
      const userRole = authUser.userRole?.toLowerCase();

      const navigatingToTenantPage = pathname.startsWith('/tenants');
      const navigatingToManagerPage = pathname.startsWith('/managers');

      // Redirects to correct dashboard home depending on authenticated role
      if (
        (userRole === 'manager' && navigatingToTenantPage) ||
        (userRole === 'tenant' && navigatingToManagerPage)
      ) {
        router.push(
          userRole === 'manager'
            ? '/managers/properties'
            : '/tenants/favorites',
          { scroll: false }
        );
      } else {
        setIsLoading(false);
      }
    }
  }, [authUser, router, pathname]);

  // Loading fallback while verifying auth + role
  if (authLoading || isLoading) return <>Loading...</>;

  // Prevents layout from rendering without a valid user role
  if (!authUser?.userRole) return null;

  return (
    <SidebarProvider>
      {/* Base dashboard container */}
      <div className='min-h-screen w-full bg-primary-100'>
        <Navbar />

        {/* Offsets content to sit below the fixed navbar height */}
        <div style={{ marginTop: `${NAVBAR_HEIGHT}px` }}>
          <main className='flex'>
            {/* Sidebar changes based on user role (manager or tenant) */}
            <Sidebar userType={authUser.userRole.toLowerCase()} />

            {/* Primary dashboard content area */}
            <div className='flex-grow transition-all duration-300'>
              {children}
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default DashboardLayout;
