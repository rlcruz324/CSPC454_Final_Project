'use client';

import Navbar from '@/components/NavigationBar';

import { NAVBAR_HEIGHT } from '@/lib/constants'

import { useGetAuthUserQuery } from '@/state/api'

import { usePathname, useRouter } from 'next/navigation'

import React, { useEffect, useState } from 'react'



/*
  layout Component (Non-Dashboard)
  - wraps public-facing pages or simplified authenticated views.
  - applies top navigation and consistent spacing.
  - redirects managers away from tenant-facing or public routes.
*/
const Layout = ({ children }: { children: React.ReactNode }) => {
  // auth Query: Retrieves the authenticated user (if logged in).
  const { data: authUser, isLoading: authLoading } = useGetAuthUserQuery()

  // router & Pathname: Used for navigation and identifying the current route.
  const router = useRouter()
  const pathname = usePathname()

  // loading Flag: Prevents the UI from rendering before redirect/check logic completes.
  const [isLoading, setIsLoading] = useState(true)

  /*
    access-Control Side Effect:
    - runs whenever authUser or pathname changes.
    - if the user is a manager, block access to:
        • he public home page ('/')
        • the search page ('/search')
    - redirects managers to their dashboard's main page.
  */
  useEffect(() => {
    if (authUser) {
      const userRole = authUser.userRole?.toLowerCase()

      //manager-specific redirect rules
      if (
        (userRole === 'manager' && pathname.startsWith('/search')) ||
        (userRole === 'manager' && pathname === '/')
      ) {
        router.push('/managers/properties', { scroll: false })
      } else {
        //allow content to load if no redirect was needed.
        setIsLoading(false)
      }
    }
  }, [authUser, router, pathname])

  // block UI until both the auth lookup and redirect logic are done.
  if (authLoading || isLoading) return <>Loading...</>



  return (
    //top-level layout wrapper: ensures full-height and full-width page structure.
    <div className='h-full w-full'>
      <Navbar />

      {/* 
        main content area:
        - uses NAVBAR_HEIGHT to prevent overlap with the navigation bar.
        - flex column layout ensures children stack naturally.
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
