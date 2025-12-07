import React from 'react'
import HeroSection from './WelcomeBanner'
import FeaturesSection from './ExploreOptions'
import DiscoverSection from './PlatformHighlights'
import CallToActionSection from './ActionSection'
import FooterSection from './SiteFooter'

// Use /landing-page to see in browser since that is the name of the folder
const LandingPage = () => {
  return (
    <main>
      <HeroSection />
      <FeaturesSection />
      <DiscoverSection />
      <CallToActionSection />
      <FooterSection />
    </main>
  )
}

export default LandingPage