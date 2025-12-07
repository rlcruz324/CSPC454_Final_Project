"use client"

// 1. React (always at top)
import React from 'react'

// 2. Next.js framework imports
import Image from 'next/image'
import Link from 'next/link'

// 3. Third-party libraries
import { motion } from 'framer-motion'

// 4. Internal UI components (none used here)



// Motion variants for staggered fade-in animation.
// Container controls timing and sequencing of children.
const containerVariants = {
  hidden: { opacity: 0, y: 50 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      staggerChildren: 0.2,
    }
  }
}

// Each item fades in individually.
// Used for cards + heading.
const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
}



// Main Explore Options section.
// Includes a headline and three feature cards.
// Animates into view using Framer Motion.
const ExploreOptions = () => {
  return (

    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}    // triggers animation only once
      variants={containerVariants}
      className="bg-white px-6 py-24 sm:px-8 lg:px-12 xl:px-16"
    >

      {/* 
        INNER WRAPPER
        - Controls max width for the content.
        - Centers everything horizontally.
      */}
      <div className="mx-auto max-w-4xl xl:max-w-6xl">

        {/* SECTION TITLE
          - Animated heading above the cards.
          - Centered for clear visual hierarchy.
        */}
        <motion.h2
          variants={itemVariants}
          className="mx-auto mb-12 w-full text-center text-3xl font-bold sm:w-2/3"
        >
          Find the perfect rental home with Lucky Star Estates using our advanced
          search features and personalized recommendations
        </motion.h2>

        {/* 
          CARD GRID
          - Switches from 1 column → 3 columns at md breakpoint.
          - Uses gap utilities for responsive spacing.
        */}
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3 lg:gap-12 xl:gap-16">

          {/* 
            CARD LOOP
            - Renders three feature cards.
            - Uses index to select title, description, and image.
          */}
          {[0, 1, 2].map((index) => (
            <motion.div key={index} variants={itemVariants}>
              <FeatureCard
                imageSrc={`/landing-search${3 - index}.png`}
                title={[
                  'Trusted Listings',
                  'Browse Thousands of Rentals',
                  'Use Advanced Search Filters to Simplify Your Search'
                ][index]}
                description={[
                  'All our rental listings are verified for accuracy and reliability, ensuring you find a home you can trust.',
                  'Explore a vast selection of rental properties across various locations, sizes, and price ranges to find your ideal home.',
                  'Narrow down your search with our advanced filters, allowing you to find properties that match your specific needs and preferences.'
                ][index]}
                linkText={['Explore', 'Search', 'Discover'][index]}
                linkHref={['/explore', '/search', '/discover'][index]}
              />
            </motion.div>
          ))}

        </div>
      </div>
    </motion.div>
  )
}



// Card component used in the ExploreOptions grid.
// Displays an image, title, description, and CTA button.
const FeatureCard = ({
  imageSrc,
  title,
  description,
  linkText,
  linkHref,
}: {
  imageSrc: string
  title: string
  description: string
  linkText: string
  linkHref: string
}) => {
  return (

    // WRAPPER
    // Centers card content and controls spacing.
    <div className="text-center">

      {/* 
        IMAGE BLOCK
        - Contains the feature illustration.
        - Uses object-contain to avoid cropping.
      */}
      <div className="mb-4 flex h-48 items-center justify-center rounded-lg p-4">
        <Image
          src={imageSrc}
          width={400}
          height={400}
          alt={title}
          className="h-full w-full object-contain"
        />
      </div>

      {/* CARD TITLE */}
      <h3 className="mb-2 text-xl font-semibold">{title}</h3>

      {/* CARD DESCRIPTION */}
      <p className="mb-4">{description}</p>

      {/* CTA BUTTON */}
      <Link
        href={linkHref}
        scroll={false}
        className="inline-block rounded border border-gray-300 px-4 py-2 hover:bg-gray-100"
      >
        {linkText}
      </Link>

    </div>
  )
}



export default ExploreOptions
