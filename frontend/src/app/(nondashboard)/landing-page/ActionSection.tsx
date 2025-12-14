"use client"

import React from 'react'
import Image from 'next/image'
import Link from 'next/link'

import { motion } from 'framer-motion'


const ActionSection = () => {
  return (
    //OUTER WRAPPER
    //controls spacing around the entire CTA block
    //`relative required for background image layering
    <div className="relative py-24">

      {/* 
        BACKGROUND IMAGE
        -covers entire section using `fill`
        -image sits behind content due to wrapper `relative`
        - replace src if a new theme or mood is needed
      */}
      <Image
        src="/blue-night-sky-filled-with-star.jpg"
        alt="Call to Action Background"
        fill
        className="object-cover object-center"
      />

      {/*
        DARK OVERLAY
        -adds contrast to the text placed over the image
        -opacity and color adjustable via Tailwind classes
      */}
      <div className="absolute inset-0 bg-secondary-800 bg-opacity-70"></div>

      {/*
        MOTION WRAPPER
        -handles fade-in and upward animation.
        -triggers only once when the section scrolls into view.
      */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}     // starting animation state
        transition={{ duration: 0.5 }}       // animation timing
        whileInView={{ opacity: 1, y: 0 }}   // final visible state
        viewport={{ once: true }}            // animate only once
        className="relative mx-auto max-w-4xl px-6 py-12 sm:px-8 lg:px-16 xl:max-w-6xl"
      >

        {/* 
          CONTENT COLUMN
          -stacks headline, subtext, and buttons vertically.
          -`space-y-1` keeps spacing consistent and minimal.
        */}
        <div className="flex flex-col items-center justify-between space-y-1">

          {/* SECTION TITLE */}
          <div className="mb-6">
            <h2 className="text-center text-5xl font-bold text-white">
              Ready to find the perfect rental?
            </h2>
          </div>

          {/* SUBTEXT + BUTTON BLOCK */}
          <div>
            <p className="mb-3 text-xl text-white">
              Sign up today and start exploring our extensive listings!
            </p>

            {/* BUTTON ROW */}
            <div className="mt-6 flex items-center justify-center gap-4">

              {/* SEARCH BUTTON
                -scrolls user back to the top of the page smoothly.
                -uses primary color styling for emphasis.
              */}
              <button
                onClick={() =>
                  window.scrollTo({ top: 0, behavior: 'smooth' })
                }
                className="inline-block rounded-lg bg-white px-6 py-3 font-semibold text-primary-700 hover:bg-primary-500 hover:text-primary-50"
              >
                Search
              </button>

              {/* SIGN UP BUTTON
                -Next.js Link for client-side navigation.
                -styled with secondary color palette.
              */}
              <Link
                href="/signup"
                scroll={false}
                className="inline-block rounded-lg bg-secondary-500 px-6 py-3 font-semibold text-white hover:bg-secondary-700"
              >
                Sign Up
              </Link>

            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

export default ActionSection
