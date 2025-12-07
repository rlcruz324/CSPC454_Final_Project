'use client';

// Navigation Bar Component: Persistent top navigation UI shared across all pages.
import Navbar from '@/components/NavigationBar';

// Layout Constants: Used to offset the main content below the navigation bar height.
import { NAVBAR_HEIGHT } from '@/lib/constants'

// API Hooks: Retrieves authenticated user information and loading state.
import { useGetAuthUserQuery } from '@/state/api'

// Next.js Navigation: Used for routing and detecting the current page path.
import { usePathname, useRouter } from 'next/navigation'

// React Core: Enables hooks and component rendering.
import React, { useEffect, useState } from 'react'



/*
  Layout Component (Non-Dashboard)
  - Wraps public-facing pages or simplified authenticated views.
  - Applies top navigation and consistent spacing.
  - Redirects managers away from tenant-facing or public routes.
*/
const Layout = ({ children }: { children: React.ReactNode }) => {
  // Auth Query: Retrieves the authenticated user (if logged in).
  const { data: authUser, isLoading: authLoading } = useGetAuthUserQuery()

  // Router & Pathname: Used for navigation and identifying the current route.
  const router = useRouter()
  const pathname = usePathname()

  // Loading Flag: Prevents the UI from rendering before redirect/check logic completes.
  const [isLoading, setIsLoading] = useState(true)

  /*
    Access-Control Side Effect:
    - Runs whenever authUser or pathname changes.
    - If the user is a manager, block access to:
        • The public home page ('/')
        • The search page ('/search')
    - Redirects managers to their dashboard's main page.
  */
  useEffect(() => {
    if (authUser) {
      const userRole = authUser.userRole?.toLowerCase()

      // Manager-Specific Redirect Rules
      if (
        (userRole === 'manager' && pathname.startsWith('/search')) ||
        (userRole === 'manager' && pathname === '/')
      ) {
        router.push('/managers/properties', { scroll: false })
      } else {
        // Allow content to load if no redirect was needed.
        setIsLoading(false)
      }
    }
  }, [authUser, router, pathname])

  // Block UI until both the auth lookup and redirect logic are done.
  if (authLoading || isLoading) return <>Loading...</>



  return (
    // Top-Level Layout Wrapper: Ensures full-height and full-width page structure.
    <div className='h-full w-full'>
      <Navbar />

      {/* 
        Main Content Area:
        - Uses NAVBAR_HEIGHT to prevent overlap with the navigation bar.
        - Flex column layout ensures children stack naturally.
      */}
      <main
        className='h-full flex w-full flex-col'
        style={{ paddingTop: `${NAVBAR_HEIGHT}px` }}
      >
        {children}
      </main>
    </div>
  )
}

export default Layout
