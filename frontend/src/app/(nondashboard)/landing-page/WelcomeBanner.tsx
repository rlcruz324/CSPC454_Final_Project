"use client"

// 1. React
import React, {useState} from 'react'

// 2. Next.js framework imports
import Image from 'next/image'

// 3. Third-party libraries
import { motion } from 'framer-motion'
import { useDispatch } from "react-redux";
import { useRouter } from "next/navigation";
import { setFilters } from "@/state";

// 4. Internal UI components (shadcn/ui, custom shared components)
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'




const WelcomeBanner = () => {
  const dispatch = useDispatch();
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();

  const handleLocationSearch = async () => {
    try {
      const trimmedQuery = searchQuery.trim();
      if (!trimmedQuery) return;

      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
          trimmedQuery
        )}.json?access_token=${
          process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN
        }&fuzzyMatch=true`
      );
      const data = await response.json();
      if (data.features && data.features.length > 0) {
        const [lng, lat] = data.features[0].center;
        dispatch(
          setFilters({
            location: trimmedQuery,
            coordinates: [lat, lng],
          })
        );
        const params = new URLSearchParams({
          location: trimmedQuery,
          lat: lat.toString(),
          lng: lng,
        });
        router.push(`/search?${params.toString()}`);
      }
    } catch (error) {
      console.error("error search location:", error);
    }
  };


  return (
    // The outer container controls the hero height and positioning.
    // Change `h-screen` for a shorter or taller hero area.
    <div className='relative h-screen'>

      {/* 
        BACKGROUND IMAGE
        - Replace `src` with new image.
        - `fill` makes it cover the full container.
        - Adjust `object-cover` to contain, top, center, etc.
        - `priority` ensures the hero image loads ASAP on page load.
        - Swapped in background image (Carson Mansion).
      */}
      <Image
        src='/Carson-Mansion-Eureka-California.jpg'
        alt='Lucky Star Estates Hero Section'
        fill
        className='object-cover object-center'
        priority 
      />

      {/*
        DARK OVERLAY
        - Adjust color or opacity to change brightness. /60%
        - Added blur to make it more readable.
        - Opacity increased to /70 for darker effect.
        - Added backdrop-blur-sm for soft dreamy look.
      */}
      <div className='absolute inset-0 bg-secondary-800/70 backdrop-blur-sm'></div>

      {/* 
        ANIMATED CONTENT WRAPPER (text, search bar, etc.)
        - motion.div controls fade-in and slide-up animation.
        - Adjust initial/animate properties for a different animation style.
        - Positioned roughly in the upper-middle of the hero image.
        - Change the animation timing + values for a smoother fade
        - Cleaned up positioning so elements remain centered.
      */}
      <motion.div
        initial={{ opacity: 0, y: 20 }} // starting state
        animate={{ opacity: 1, y: 0 }}  // final state
        transition={{ duration: 0.8 }}  // animation timing
        className='absolute top-1/3 -translate-y-1/2 w-full text-center'
      >

        {/* 
          INNER CONTAINER
          - Controls max width, side padding, and responsive spacing.
          - Change px values to widen or tighten layout.
          - Increased px values
        */}
        <div className='mx-auto max-w-4xl px-6 sm:px-8 lg:px-12 xl:px-16'>

          {/* MAIN HEADLINE
            - Customize text, size, or color.
            - Increase mb-4 for more spacing above the subtext.
            - Added `font-josefin` custom Google font.
            - Added `drop-shadow-lg` for better readability on bright backgrounds. But honestly I don't see much difference.
          */}
          <h1 className='font-josefin text-4xl font-extrabold text-white drop-shadow-lg sm:text-5xl'>
            Let us be your lucky star in finding the perfect rental home!
          </h1>

          {/* SUBHEADLINE
            - Softer supporting text.
            - Adjust mb-8 to change spacing before the search bar.
          */}
          <p className='mb-8 text-xl text-white'>
            Discover your dream rental property with Lucky Star Estates - where luck meets comfort and convenience.
          </p>

          {/* 
            SEARCH BAR + BUTTON ROW
            - Wrapped in flex to center horizontally.
            - Could replace this with a larger search card or a dropdown if needed.
            - Cleaned up alignment + centered consistently.
          */}
          <div className='flex justify-center'>

            {/* SEARCH INPUT
              - Change placeholder to match brand voice.
              - `bg-secondary-100` sets the input background — easy to theme.
              - Rounded-left only so it attaches cleanly to the button.
              - Border removed for cleaner floating look.
            */}
            <Input 
              type='text'
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}  // replace with real search logic later
              placeholder='Search by dream address, city, or neighborhood'
              className='h-12 w-full max-w-lg rounded-none rounded-l-xl border-none bg-secondary-100 text-secondary-900'
            />

            {/* SEARCH BUTTON
              - Change text, colors, or hover styles freely.
              - Rounded-right only so it connects to the input.
              - Border removed for a more modern connected-input look.
              - Added hover transition color.
            */}
            <Button
              onClick={handleLocationSearch}  // add search functionality or routing later
              className='h-12 rounded-none rounded-r-xl border-none bg-secondary-500 text-white hover:bg-secondary-600'
            >
              Search
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

export default WelcomeBanner
