import React, { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion"; // Assuming framer-motion is available in the user's environment

// Placeholder image for the profile avatar
const PLACEHOLDER_AVATAR = "https://placehold.co/200x200/FF5733/FFFFFF?text=Profile";
import Profile from "../assets/Profile.jpg";
// Résumé PDF (served from /public)
const RESUME_PDF = "/Pulkit_Tiwari_SDE.pdf";

import ProfileCard from "./ui/ProfileCard";

// --- ShinyText Component ---
// This component applies a shine effect to its text content.
interface ShinyTextProps {
  text: string;
  disabled?: boolean;
  speed?: number;
  className?: string;
}

const ShinyText: React.FC<ShinyTextProps> = ({ text, disabled = false, speed = 5, className = '' }) => {
  const animationDuration = `${speed}s`;
  return (
    <div
      className={`text-[#b5b5b5a4] bg-clip-text inline-block ${disabled ? '' : 'animate-shine'} ${className}`}
      style={{
        backgroundImage: 'linear-gradient(120deg, rgba(255, 255, 255, 0) 40%, rgba(255, 255, 255, 0.8) 50%, rgba(255, 255, 255, 0) 60%)',
        backgroundSize: '200% 100%',
        WebkitBackgroundClip: 'text',
        animationDuration: animationDuration,
      }}
    >
      {text}
    </div>
  );
};


// --- Hero Component ---
interface HeroProps {
  isDarkMode: boolean;
}

// Define variants for framer-motion animations
const containerVariants = {
  hidden: { opacity: 0, x: -100 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 1.5, staggerChildren: 0.5 },
  },
};

const childVariants = {
  hidden: { opacity: 0, x: -100 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.5 },
  },
};

const Hero: React.FC<HeroProps> = ({ isDarkMode }) => {
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://platform.linkedin.com/badges/js/profile.js";
    script.async = true;
    script.defer = true;
    script.type = "text/javascript";
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  return (
    <div id="Hero" className="mt-10 mb-10 px-4 sm:px-6 md:px-10 lg:px-30">
      <div className="flex flex-col lg:flex-row">
        {/* Empty div for spacing on larger screens */}

        <div className="w-full px-4 sm:px-10 md:px-16 lg:px-24 xl:px-40">
          <div id="intro" className="pb-4 lg:mb-36">
            <div className="flex flex-col-reverse lg:flex-row items-center gap-8" style={{ fontFamily: 'Outfit' }}>

              {/* Text Section */}
              <div className="w-full lg:w-2/3 text-center lg:text-left">

                {/* Name */}
                <div className="text-[1.875rem] sm:text-[2.25rem] md:text-[3rem] lg:text-[5rem] font-bold">
                  <h1
                    className={`${isDarkMode ? "text-white" : "text-black"}`}
                    style={{ display: "inline-block", fontFamily: "Raleway" }}
                  >
                    Pulkit Tiwari
                  </h1>
                </div>

                <motion.div
                  initial="hidden"
                  whileInView="visible"
                  variants={containerVariants}
                  viewport={{ once: true }}
                >
                  {/* Title */}
                  <div className="text-[1.25rem] sm:text-[1.5rem] md:text-[1.875rem] lg:text-[2.25rem] font-semibold mt-2">
                    <motion.span
                      variants={childVariants}
                      className={`bg-gradient-to-r ${isDarkMode
                        ? "from-stone-300 to-stone-600"
                        : "from-black to-gray-700"
                        } bg-clip-text text-transparent`}
                    >
                      <ShinyText text="Software Engineer" />
                    </motion.span>
                  </div>

                  {/* Paragraph */}
                  <div className="text-[1rem] sm:text-[1.125rem] md:text-[1.25rem] font-light mt-3 px-2 sm:px-0">
                    <motion.p
                      variants={childVariants}
                      className={`${isDarkMode ? "text-stone-300" : "text-gray-700"} font-outfit`}
                    >
                      I’m a final-year <strong className={isDarkMode ? "text-blue-400" : "text-blue-700"}>Software Engineering</strong> student who likes building things
                      that are useful, scalable, and occasionally make me question why I
                      started debugging at 2 AM.
                    </motion.p>

                    <motion.p
                      variants={childVariants}
                      className={`${isDarkMode ? "text-stone-300" : "text-gray-700"} mt-2 font-outfit`}
                    >
                      My work sits somewhere between{" "}
                      <strong className={isDarkMode ? "text-blue-400" : "text-blue-700"}>
                        Software Development, AI, and Cybersecurity
                      </strong>
                      {" "}— from building web applications and AI agents to designing
                      systems that are a little harder to break.
                    </motion.p>

                    <motion.p
                      variants={childVariants}
                      className={`${isDarkMode ? "text-stone-300" : "text-gray-700"} mt-2 font-outfit`}
                    >
                      I’m always learning, shipping, breaking things, fixing them, and
                      pretending the last bug was “expected behavior.” 🔗
                    </motion.p>
                  </div>

                  {/* Resume Button */}
                  <div className="mt-5">
                    <motion.a
                      variants={childVariants}
                      href={RESUME_PDF}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`px-4 py-2 font-semibold rounded-md transition-all ${isDarkMode
                        ? "bg-stone-300 text-black hover:bg-stone-400"
                        : "bg-black text-white hover:bg-gray-800"
                        }`}
                    >
                      View Resume
                    </motion.a>
                  </div>

                  {/* LinkedIn Profile Badge */}
                  <motion.div variants={childVariants} className="mt-6 flex justify-center lg:justify-start">
                    <div
                      className="badge-base LI-profile-badge"
                      data-locale="en_US"
                      data-size="large"
                      data-theme={isDarkMode ? "dark" : "light"}
                      data-type="HORIZONTAL"
                      data-vanity="pulkittiwari51"
                      data-version="v1"
                    >
                      <a
                        className="badge-base__link LI-simple-link"
                        href="https://in.linkedin.com/in/pulkittiwari51?trk=profile-badge"
                      >
                        Pulkit Tiwari
                      </a>
                    </div>
                  </motion.div>
                </motion.div>
              </div>

              {/* Profile Section */}
              <div className="w-full h-full lg:w-1/3 flex justify-center">
                <ProfileCard
                  avatarUrl={Profile}
                  miniAvatarUrl="https://img.icons8.com/?size=100&id=BrU2BBoRXiWq&format=png&color=000000"
                  name="Pulkit Tiwari"
                  title="Software Engineer"
                  handle="_pulkittiwari"
                  status="Available"
                  contactText="Let's Talk"
                  onContactClick={() => console.log("Contact button clicked!")}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

  );
};

export default Hero;
