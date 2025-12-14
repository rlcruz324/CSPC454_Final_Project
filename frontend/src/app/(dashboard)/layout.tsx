'use client';

import React, { useEffect, useState } from 'react';

import { usePathname, useRouter } from 'next/navigation';

import { useGetAuthUserQuery } from '@/state/api';

import Navbar from '@/components/NavigationBar';
import Sidebar from '@/components/RoleSidebar';
import { SidebarProvider } from '@/components/ui/sidebar';

import { NAVBAR_HEIGHT } from '@/lib/constants';

//dashboard layout component: Wraps dashboard pages with navigation,
//sidebar, and role-based access control.
const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  //authenticated user info retrieved from global API state
  const { data: authenticatedUser, isLoading: isAuthLoading } = useGetAuthUserQuery();

  //routing utilities for dashboard redirection
  const routerInstance = useRouter();
  const currentPath = usePathname();

  //loading state ensures UI waits for role validation
  const [isRoleLoading, setIsLoading] = useState(true);

  //role-based page protection:
  //ensures managers cannot access tenant pages and tenants cannot access manager pages.
  useEffect(() => {
    if (authenticatedUser) {
      const userRole = authenticatedUser.userRole?.toLowerCase();

      const navigatingToTenantPageRoute = currentPath.startsWith('/tenants');
      const navigatingToManagerPageRoute = currentPath.startsWith('/managers');

      //redirects to correct dashboard home depending on authenticated role
      if (
        (userRole === 'manager' && navigatingToTenantPageRoute) ||
        (userRole === 'tenant' && navigatingToManagerPageRoute)
      ) {
        routerInstance.push(
          userRole === 'manager'
            ? '/managers/properties'
            : '/tenants/favorites',
          { scroll: false }
        );
      } else {
        setIsLoading(false);
      }
    }
  }, [authenticatedUser, routerInstance, currentPath]);

  //loading fallback while verifying auth + role
  if (isAuthLoading || isRoleLoading) return <>Loading...</>;

  //prevents layout from rendering without a valid user role
  if (!authenticatedUser?.userRole) return null;

  return (
    <SidebarProvider>
      {/* base dashboard container */}
      <div className='min-h-screen w-full bg-primary-100'>
        <Navbar />

        {/* offsets content to sit below the fixed navbar height */}
        <div style={{ marginTop: `${NAVBAR_HEIGHT}px` }}>
          <main className='flex'>
            {/* sidebar changes based on user role (manager or tenant) */}
            <Sidebar userType={authenticatedUser.userRole.toLowerCase()} />

            {/* primary dashboard content area */}
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
