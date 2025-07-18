//@ts-nocheck
"use client";
import React, { useCallback, useEffect, useRef } from "react";
import { Link } from "react-scroll"; // Import the Link component from react-scroll

// Define a simple 'cn' utility function if you don't want to use an external library
// This is a common pattern for conditionally joining class names.
function cn(...classNames: (string | boolean | undefined | null)[]): string {
  return classNames.filter(Boolean).join(' ');
}

// Placeholder for SplashCursor component as it was not provided.
// In a real application, you would import your actual SplashCursor component here.
const SplashCursor = () => {
  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      {/* Placeholder for custom cursor effects */}
    </div>
  );
};

// --- MorphingText Component and its related hooks/components ---

const morphTime = 1.5;
const cooldownTime = 0.5;

const useMorphingText = (texts: string[]) => {
  const textIndexRef = useRef(0);
  const morphRef = useRef(0);
  const cooldownRef = useRef(0);
  const timeRef = useRef(new Date());

  const text1Ref = useRef<HTMLSpanElement>(null);
  const text2Ref = useRef<HTMLSpanElement>(null);

  const setStyles = useCallback(
    (fraction: number) => {
      const [current1, current2] = [text1Ref.current, text2Ref.current];
      if (!current1 || !current2 || !texts || texts.length === 0) return;

      current2.style.filter = `blur(${Math.min(8 / fraction - 8, 100)}px)`;
      current2.style.opacity = `${Math.pow(fraction, 0.4) * 100}%`;

      const invertedFraction = 1 - fraction;
      current1.style.filter = `blur(${Math.min(8 / invertedFraction - 8, 100)}px)`;
      current1.style.opacity = `${Math.pow(invertedFraction, 0.4) * 100}%`;

      current1.textContent = texts[textIndexRef.current % texts.length];
      current2.textContent = texts[(textIndexRef.current + 1) % texts.length];
    },
    [texts],
  );

  const doMorph = useCallback(() => {
    morphRef.current -= cooldownRef.current;
    cooldownRef.current = 0;

    let fraction = morphRef.current / morphTime;

    if (fraction > 1) {
      cooldownRef.current = cooldownTime;
      fraction = 1;
    }

    setStyles(fraction);

    if (fraction === 1) {
      textIndexRef.current++;
    }
  }, [setStyles]);

  const doCooldown = useCallback(() => {
    morphRef.current = 0;
    const [current1, current2] = [text1Ref.current, text2Ref.current];
    if (current1 && current2) {
      current2.style.filter = "none";
      current2.style.opacity = "100%";
      current1.style.filter = "none";
      current1.style.opacity = "0%";
    }
  }, []);

  useEffect(() => {
    let animationFrameId: number;

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      const newTime = new Date();
      const dt = (newTime.getTime() - timeRef.current.getTime()) / 1000;
      timeRef.current = newTime;

      cooldownRef.current -= dt;

      if (cooldownRef.current <= 0) doMorph();
      else doCooldown();
    };

    animate();
    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [doMorph, doCooldown]);

  return { text1Ref, text2Ref };
};

interface MorphingTextProps {
  className?: string;
  texts: string[];
}

const Texts: React.FC<Pick<MorphingTextProps, "texts">> = ({ texts }) => {
  const { text1Ref, text2Ref } = useMorphingText(texts);
  return (
    <>
      <span
        className="absolute inset-x-0 top-0 m-auto inline-block w-full"
        ref={text1Ref}
      />
      <span
        className="absolute inset-x-0 top-0 m-auto inline-block w-full"
        ref={text2Ref}
      />
    </>
  );
};

const SvgFilters: React.FC = () => (
  <svg id="filters" className="hidden" preserveAspectRatio="xMidYMid slice">
    <defs>
      <filter id="threshold">
        <feColorMatrix
          in="SourceGraphic"
          type="matrix"
          values="1 0 0 0 0
                  0 1 0 0 0
                  0 0 1 0 0
                  0 0 0 255 -140"
        />
      </filter>
    </defs>
  </svg>
);

const MorphingText: React.FC<MorphingTextProps> = ({ texts, className }) => (
  <div
    className={cn( // This `cn` now refers to the locally defined one
      "relative mx-auto h-16 w-full text-center font-sans text-[40pt] font-bold leading-none [filter:url(#threshold)_blur(0.6px)] md:h-24 lg:text-[6rem]",
      className,
    )}
  >
    <Texts texts={texts} />
    <SvgFilters />
  </div>
);

// --- Hello Component ---

interface HelloProps {
  isDarkMode: boolean;
}

const Hello: React.FC<HelloProps> = ({ isDarkMode }) => {
  // Array of greetings in different languages
  const greetings: string[] = [
    "Hello", // English
    "Hola", // Spanish
    "Bonjour", // French
    "こんにちは", // Japanese
    "नमस्ते", // Hindi
    "مرحبا", // Arabic
    "Hallo", // German
    "Ciao", // Italian
    "안녕하세요", // Korean
    "Привет", // Russian
  ];

  return (
    // Main container for the Hello component, ensuring it takes full screen height and centers content
    <div className="w-full min-h-[100vh] flex items-center justify-center">
      {/* Splash cursor component for custom cursor effects */}
      <SplashCursor />

      {/* New 3-column layout container (30/40/30) */}
      {/* On small screens, it will be a single column. On medium screens and above, it will be 3 columns. */}
      <div className="container mx-auto grid grid-cols-1 md:grid-cols-[30%_40%_30%] h-full">
        {/* Left column (30%) - hidden on small screens */}
        <div className="hidden md:block col-span-1">
          {/* Content for the left column can go here if needed */}
        </div>

        {/* Middle column (40%) - will contain the greetings, centered vertically */}
        <div className="col-span-1 flex items-center justify-center h-full">
          <div className="w-full"> {/* Inner container to ensure MorphingText takes full width of this column */}
            {/* Link component from react-scroll for smooth scrolling to the "Hero" section */}
            <Link
              to="Hero" // ID of the section to scroll to (e.g., <section id="Hero">)
              smooth={true} // Enable smooth scroll animation
              duration={500} // Duration of the scroll animation in milliseconds
            >
              <div className="text-container">
                <MorphingText
                  texts={greetings} // Pass the array of greetings to MorphingText
                  className={`text-6xl font-bold transition-all duration-500 text-center cursor-pointer whitespace-nowrap ${
                    isDarkMode ? "text-white" : "text-black" // Apply text color based on dark mode state
                  }`}
                />
              </div>
            </Link>
          </div>
        </div>

        {/* Right column (30%) - hidden on small screens */}
        <div className="hidden md:block col-span-1">
          {/* Content for the right column can go here if needed */}
        </div>
      </div>
    </div>
  );
};

export default Hello;
