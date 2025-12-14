import React from "react";

import Link from "next/link";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import {
  faFacebook,
  faInstagram,
  faTwitter,
  faLinkedin,
  faYoutube,
} from "@fortawesome/free-brands-svg-icons";


//footer component displayed across the site
const SiteFooter = () => {
  return (
    //footer wrapper with border separation and vertical padding
    <footer className="border-t border-gray-200 py-10">
      <div className="mx-auto max-w-4xl px-6 sm:px-8">
        {/* top section with logo, navigation, and social icons */}
        <div className="flex flex-col items-center justify-between md:flex-row">
          
          {/* logo section */}
          <div className="mb-4">
            <Link href="/" className="text-xl font-bold" scroll={false}>
              Lucky⭐Star
            </Link>
          </div>

          {/* navigation links */}
          <nav className="mb-4">
            <ul className="flex space-x-6">
              <li>
                <Link href="/about">About Us</Link>
              </li>
              <li>
                <Link href="/contact">Contact Us</Link>
              </li>
              <li>
                <Link href="/faq">FAQ</Link>
              </li>
              <li>
                <Link href="/terms">Terms</Link>
              </li>
              <li>
                <Link href="/privacy">Privacy</Link>
              </li>
            </ul>
          </nav>

          {/* social media icons */}
          <div className="mb-4 flex space-x-4">
            <a
              href="#"
              aria-label="Facebook"
              className="hover:text-primary-600"
            >
              <FontAwesomeIcon icon={faFacebook} className="h-6 w-6" />
            </a>

            <a
              href="#"
              aria-label="Instagram"
              className="hover:text-primary-600"
            >
              <FontAwesomeIcon icon={faInstagram} className="h-6 w-6" />
            </a>

            <a
              href="#"
              aria-label="Twitter"
              className="hover:text-primary-600"
            >
              <FontAwesomeIcon icon={faTwitter} className="h-6 w-6" />
            </a>

            <a
              href="#"
              aria-label="Linkedin"
              className="hover:text-primary-600"
            >
              <FontAwesomeIcon icon={faLinkedin} className="h-6 w-6" />
            </a>

            <a
              href="#"
              aria-label="Youtube"
              className="hover:text-primary-600"
            >
              <FontAwesomeIcon icon={faYoutube} className="h-6 w-6" />
            </a>
          </div>
        </div>

        {/* bottom legal + extra links */}
        <div className="mt-8 flex justify-center space-x-4 text-center text-sm text-gray-500">
          <span>© Lucky⭐Star. All rights reserved.</span>
          <Link href="/privacy">Privacy Policy</Link>
          <Link href="/terms">Terms of Service</Link>
          <Link href="/cookies">Cookie Policy</Link>
        </div>
      </div>
    </footer>
  );
};

export default SiteFooter;
