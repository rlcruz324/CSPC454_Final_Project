"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { NAVBAR_HEIGHT } from "@/lib/constants";
import { Button } from "./ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "./ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { SidebarTrigger } from "./ui/sidebar";
import { useGetAuthUserQuery } from "@/state/api";
import { signOut } from "aws-amplify/auth";

//ucons (used for dashboard actions)
import { Bell, MessageCircle, Plus, Search } from "lucide-react";

//navigation Bar component: Renders the site header, including branding, authentication controls, and dashboard utilities.
const NavigationBar = () => {
  //authenticated user info from global API state
  const { data: authenticatedUser } = useGetAuthUserQuery();

  //routing helpers
  const router = useRouter();
  const pathname = usePathname();

  //dashboard detection logic for conditional UI (e.g., managers or tenants areas)
  const isDashboardPage =
    pathname.includes("/managers") || pathname.includes("/tenants");

  //sign-out handler: Calls AWS Amplify sign out and returns user to the home page
  const signOutUser = async () => {
    await signOut();
    window.location.href = "/";
  };

  return (
    <div
      className="fixed top-0 left-0 z-50 w-full shadow-xl"
      //inline height ensures the header stays tied to the design constant
      style={{ height: `${NAVBAR_HEIGHT}px` }}
    >
      <div className="flex w-full items-center justify-between bg-background-600 px-8 py-3 text-white">
        {/* Left section: Branding and mobile sidebar trigger */}
        <div className="flex items-center gap-4 md:gap-6">
          {/* Sidebar button for dashboard pages (mobile only) */}
          {isDashboardPage && (
            <div className="md:hidden">
              <SidebarTrigger />
            </div>
          )}

          {/* logo + brand identity */}
          <Link
            href="/"
            scroll={false}
            className="cursor-pointer hover:!text-primary-300"
          >
            <div className="flex items-center gap-3">
              <Image
                src="/stars.svg"
                alt="Lucky Star Logo"
                width={30}
                height={30}
                className="h-15 w-15"
              />
              <div className="text-xl font-bold text-secondary-500">
                Lucky
                <span className="text-tertiary-400 text-xl font-bold hover:!text-primary-300">
                  ⭐Star
                </span>
              </div>
            </div>
          </Link>

          {/* dashboard action button: New Property for managers OR Search for tenants */}
          {isDashboardPage && authenticatedUser && (
            <Button
              variant="secondary"
              className="bg-primary-50 text-primary-700 hover:bg-secondary-500 hover:text-primary-50 md:ml-4"
              onClick={() =>
                router.push(
                  authenticatedUser.userRole?.toLowerCase() === "manager"
                    ? "/managers/newproperty"
                    : "/search"
                )
              }
            >
              {authenticatedUser.userRole?.toLowerCase() === "manager" ? (
                <>
                  <Plus className="h-4 w-4" />
                  <span className="hidden md:block ml-2">Add New Property</span>
                </>
              ) : (
                <>
                  <Search className="h-4 w-4" />
                  <span className="hidden md:block ml-2">
                    Search Properties
                  </span>
                </>
              )}
            </Button>
          )}
        </div>

        {/* tagline shown only on non-dashboard pages */}
        {!isDashboardPage && (
          <p className="hidden text-primary-200 md:block">
            Your lucky rental platform :D
          </p>
        )}

        {/* authentication + user controls (right side) */}
        <div className="flex items-center gap-5">
          {authenticatedUser ? (
            <>
              {/* notification icons: Shown only on medium screens and above */}
              <div className="relative hidden md:block">
                <MessageCircle className="w-6 h-6 cursor-pointer text-primary-200 hover:text-primary-400" />
                <span className="absolute top-0 right-0 h-2 w-2 rounded-full bg-secondary-700"></span>
              </div>

              <div className="relative hidden md:block">
                <Bell className="w-6 h-6 cursor-pointer text-primary-200 hover:text-primary-400" />
                <span className="absolute top-0 right-0 h-2 w-2 rounded-full bg-secondary-700"></span>
              </div>

              {/* user avatar + dropdown menu */}
              <DropdownMenu>
                <DropdownMenuTrigger className="flex items-center gap-2 focus:outline-none">
                  <Avatar>
                    <AvatarImage src={authenticatedUser.userInfo?.image} />
                    <AvatarFallback className="bg-primary-600">
                      {authenticatedUser.userRole?.[0].toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <p className="hidden text-primary-200 md:block">
                    {authenticatedUser.userInfo?.name}
                  </p>
                </DropdownMenuTrigger>

                <DropdownMenuContent className="bg-white text-primary-700">
                  {/* dashboard redirect */}
                  <DropdownMenuItem
                    className="cursor-pointer font-bold hover:!bg-primary-700 hover:!text-primary-100"
                    onClick={() =>
                      router.push(
                        authenticatedUser.userRole?.toLowerCase() === "manager"
                          ? "/managers/properties"
                          : "/tenants/favorites",
                        { scroll: false }
                      )
                    }
                  >
                    Go to Dashboard
                  </DropdownMenuItem>

                  <DropdownMenuSeparator className="bg-primary-200" />

                  {/* settings page */}
                  <DropdownMenuItem
                    className="cursor-pointer hover:!bg-primary-700 hover:!text-primary-100"
                    onClick={() =>
                      router.push(
                        `/${authenticatedUser.userRole?.toLowerCase()}s/settings`,
                        { scroll: false }
                      )
                    }
                  >
                    Settings
                  </DropdownMenuItem>

                  {/* log out */}
                  <DropdownMenuItem
                    className="cursor-pointer hover:!bg-primary-700 hover:!text-primary-100"
                    onClick={signOutUser}
                  >
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            //unauthenticated state: Sign In /Sign Up buttons
            <>
              <Link href="/signin">
                <Button
                  variant="outline"
                  className="rounded-lg border-white bg-transparent text-white hover:bg-white hover:text-primary-700"
                >
                  Sign In
                </Button>
              </Link>

              <Link href="/signup">
                <Button
                  variant="secondary"
                  className="rounded-lg bg-secondary-600 text-white hover:bg-white hover:text-primary-700"
                >
                  Sign Up
                </Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default NavigationBar;






