"use client"

import React from 'react'

import Image from 'next/image'

import { motion } from 'framer-motion'




//motion variants for staggered fade-in animation
//container controls timing and sequencing of child elements
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.5,
      staggerChildren: 0.2,
    }
  }
}

//each item fades upward into place
//applied to the section title and each card
const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
}



//main highlights section.
//introduces key platform features with animated cards
const PlatformHighlights = () => {
  return (

    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.8 }}  // triggers earlier for smoother reveal
      variants={containerVariants}
      className="mb-16 bg-secondary-100 py-12"
    >

      {/* INNER WRAPPER
        -centers content and manages responsive padding
        -expands to larger max width on big screens
      */}
      <div className="mx-auto max-w-6xl px-6 sm:px-8 lg:px-12 xl:max-w-7xl xl:px-16">

        {/* SECTION HEADER
          -title + supporting paragraph
          -animated together using itemVariants
        */}
        <motion.div
          variants={itemVariants}
          className="my-12 text-center"
        >
          <h2 className="text-3xl font-semibold leading-tight text-gray-800">
            Discover More with Lucky Star Estates!!
          </h2>

          <p className="mt-4 text-lg text-gray-600">
            Find your dream home is just a few clicks away. Explore our extensive
            listings and advanced search features to locate the perfect rental property
            that suits your needs.
          </p>
        </motion.div>

        {/* CARD GRID
          -1 column on mobile, 3 columns on medium screens
          -large gaps on wider layouts for clean spacing
        */}
        <div className="grid grid-cols-1 gap-8 text-center md:grid-cols-3 lg:gap-12 xl:gap-16">

          {/* CARD LOOP
            - generates three DiscoverCard elements
            - each wrapped in a motion.div for staggered animation
          */}
          {[
            {
              imageSrc: '/landing-icon-wand.png',
              title: 'Comprehensive Listings',
              description:
                'Access a wide range of homes with high-quality images, and virtual tours!',
            },
            {
              imageSrc: '/landing-icon-calendar.png',
              title: 'Once you find it, book a tour!',
              description:
                'Schedule property tours directly through our platform at your convenience.',
            },
            {
              imageSrc: '/landing-icon-heart.png',
              title: 'Love your new home',
              description:
                'Move into a rental that feels just right for you, with the support of our dedicated team to ensure a smooth transition.',
            },
          ].map((card, index) => (
            <motion.div key={index} variants={itemVariants}>
              <DiscoverCard {...card} />
            </motion.div>
          ))}

        </div>
      </div>
    </motion.div>
  )
}



// individual highlight card
// displays an icon, title, and short description
const DiscoverCard = ({
  imageSrc,
  title,
  description,
}: {
  imageSrc: string
  title: string
  description: string
}) => {
  return (

    // CARD WRAPPER
    // includes shadow, rounded corners, and consistent padding
    <div className="rounded-lg bg-primary-50 px-4 py-12 shadow-lg md:h-72">

      {/* ICON WRAPPER
        -small circle with brand color background
        -centers the icon visually within the card
      */}
      <div className="mx-auto mb-4 h-10 w-10 rounded-full bg-primary-700 p-[0.6rem]">
        <Image
          src={imageSrc}
          width={30}
          height={30}
          className="h-full w-full"
          alt={title}
        />
      </div>

      {/* CARD TITLE */}
      <h3 className="mt-4 text-xl font-medium text-gray-800">{title}</h3>

      {/* CARD DESCRIPTION */}
      <p className="mt-2 text-base text-gray-500">{description}</p>

    </div>
  )
}

export default PlatformHighlights
