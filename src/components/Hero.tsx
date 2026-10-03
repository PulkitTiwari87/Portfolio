import React from "react";
import { motion } from "framer-motion"; // Assuming framer-motion is available in the user's environment

import Profile from "../assets/profile-portrait.jpg";
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
      className={`hero-shine bg-clip-text inline-block ${className}`}
      style={{
        backgroundImage: 'linear-gradient(120deg, rgba(255, 255, 255, 0) 40%, rgba(255, 255, 255, 0.8) 50%, rgba(255, 255, 255, 0) 60%)',
        backgroundSize: '200% 100%',
        WebkitBackgroundClip: 'text',
        // `animate-shine` was never generated (Tailwind v4 ignores tailwind.config.js), so animate directly.
        animation: disabled ? undefined : `hero-shine ${animationDuration} linear infinite`,
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
  return (
    <div id="Hero" className="mt-10 mb-10 px-4 sm:px-6 md:px-10 lg:px-30">
      <style>{`@keyframes hero-shine { 0% { background-position: 100%; } 100% { background-position: -100%; } } @media (prefers-reduced-motion: reduce) { .hero-shine { animation: none !important; } }`}</style>
      <div className="flex flex-col lg:flex-row">
        {/* Empty div for spacing on larger screens */}

        <div className="w-full px-4 sm:px-10 md:px-16 lg:px-24 xl:px-40">
          <div id="intro" className="pb-4 lg:mb-36">
            <div className="flex flex-col-reverse lg:flex-row items-center gap-8">

              {/* Text Section */}
              <div className="w-full lg:w-2/3 text-center lg:text-left">

                {/* Name */}
                <div className="text-[1.875rem] sm:text-[2.25rem] md:text-[3rem] lg:text-[5rem] font-semibold type-display">
                  <h1
                    className={`${isDarkMode ? "text-white" : "text-black"}`}
                    style={{ display: "inline-block" }}
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
                  <div className="text-[1.25rem] sm:text-[1.5rem] md:text-[1.875rem] lg:text-[2.25rem] font-semibold type-headline mt-2">
                    <motion.span
                      variants={childVariants}
                      className={`bg-gradient-to-r ${isDarkMode
                        ? "from-stone-300 to-stone-600"
                        : "from-black to-gray-700"
                        } bg-clip-text text-transparent`}
                    >
                      <ShinyText text="Software Engineer" className={isDarkMode ? "text-[#b5b5b5a4]" : "text-gray-700"} />
                    </motion.span>
                  </div>

                  {/* Paragraph */}
                  <div className="text-[1rem] sm:text-[1.125rem] md:text-[1.25rem] font-normal leading-[1.47] mt-3 px-2 sm:px-0">
                    <motion.p
                      variants={childVariants}
                      className={isDarkMode ? "text-stone-300" : "text-gray-700"}
                    >
                      I’m a final-year <strong className={isDarkMode ? "text-blue-400" : "text-blue-700"}>Software Engineering</strong> student who likes building things
                      that are useful, scalable, and occasionally make me question why I
                      started debugging at 2 AM.
                    </motion.p>

                    <motion.p
                      variants={childVariants}
                      className={`${isDarkMode ? "text-stone-300" : "text-gray-700"} mt-2`}
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
                      className={`${isDarkMode ? "text-stone-300" : "text-gray-700"} mt-2`}
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
                  onContactClick={() => document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" })}
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
