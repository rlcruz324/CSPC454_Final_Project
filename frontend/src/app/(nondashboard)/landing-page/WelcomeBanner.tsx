"use client"

import React, {useState} from 'react'

import Image from 'next/image'

import { motion } from 'framer-motion'
import { useDispatch } from "react-redux";
import { useRouter } from "next/navigation";
import { setFilters } from "@/state";

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
    //the outer container controls the hero height and positioning
    //change `h-screen` for a shorter or taller hero area
    <div className='relative h-screen'>

      {/* 
        background image
        - replace `src` with new image
        - `fill` makes it cover the full container
        - adjust `object-cover` to contain, top, center, etc
        - `priority` ensures the hero image loads ASAP on page load
        - swapped in background image (Carson Mansion
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
        -adjust color or opacity to change brightness /60%
        -added blur to make it more readable
        -apacity increased to /70 for darker effect
        -added backdrop-blur-sm for soft dreamy look
      */}
      <div className='absolute inset-0 bg-secondary-800/70 backdrop-blur-sm'></div>

      {/* 
        ANIMATED CONTENT WRAPPER  text, search bar, etc.
        - motion.div controls fade-in and slide-up animation
        - adjust initial/animate properties for a different animation style
        - positioned roughly in the upper-middle of the hero image
        - change the animation timing + values for a smoother fade
        - cleaned up positioning so elements remain centered
      */}
      <motion.div
        initial={{ opacity: 0, y: 20 }} // starting state
        animate={{ opacity: 1, y: 0 }}  // final state
        transition={{ duration: 0.8 }}  // animation timing
        className='absolute top-1/3 -translate-y-1/2 w-full text-center'
      >

        {/* 
          INNER CONTAINER
          - controls max width, side padding, and responsive spacing
          - change px values to widen or tighten layout
          - increased px values
        */}
        <div className='mx-auto max-w-4xl px-6 sm:px-8 lg:px-12 xl:px-16'>

          {/* MAIN HEADLINE
            - customize text, size, or color
            - increase mb-4 for more spacing above the subtext
            - added `font-josefin` custom Google font
            - added `drop-shadow-lg` for better readability on bright backgrounds. But honestly I don't see much difference.
          */}
          <h1 className='font-josefin text-4xl font-extrabold text-white drop-shadow-lg sm:text-5xl'>
            Let us be your lucky star in finding the perfect rental home!
          </h1>

          {/* SUBHEADLINE
            - softer supporting text
            - adjust mb-8 to change spacing before the search bar
          */}
          <p className='mb-8 text-xl text-white'>
            Discover your dream rental property with Lucky Star Estates - where luck meets comfort and convenience.
          </p>

          {/* 
            SEARCH BAR + BUTTON ROW
            - wrapped in flex to center horizontally
            - could replace this with a larger search card or a dropdown if needed
            - cleaned up alignment + centered consistently
          */}
          <div className='flex justify-center'>

            {/* SEARCH INPUT
              - change placeholder to match brand voice
              - `bg-secondary-100` sets the input background — easy to theme
              - rounded-left only so it attaches cleanly to the button
              - border removed for cleaner floating look
            */}
            <Input 
              type='text'
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}  // replace with real search logic later
              placeholder='Search by dream address, city, or neighborhood'
              className='h-12 w-full max-w-lg rounded-none rounded-l-xl border-none bg-secondary-100 text-secondary-900'
            />

            {/* SEARCH BUTTON
              - change text, colors, or hover styles freely
              - rounded-right only so it connects to the input
              - border removed for a more modern connected-input look
              - added hover transition color
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
