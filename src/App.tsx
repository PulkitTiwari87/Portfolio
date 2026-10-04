import React, { useState, useEffect, lazy, Suspense } from "react";
import SidebarNavbar from "./components/Bar";
import AboutMe from "./components/Aboutme";
import Technologies from "./components/Technologies";
import Experience from "./components/Experience";
import Footer from "./components/ui/animated-footer";
import Hero from "./components/Hero";
import Hello from "./components/Hello";
import Background from "./components/Background"; // Your custom background component
import GitHubProjects from "./components/GitHubProjects"; // New component for live GitHub projects
import Activity from "./components/Activity"; // Last-30-days GitHub + LeetCode heatmaps
import Contact from "./components/Contact";
import { currentDesignId, goToDesign } from "./data/designs";

// Design pages are loaded on demand so the main site bundle stays small.
const AppleDesign = lazy(() => import("./components/AppleDesign"));
const FrameDesign = lazy(() => import("./components/FrameDesign"));
const NerdDesign = lazy(() => import("./components/NerdDesign"));
const BlahhhDesign = lazy(() => import("./components/BlahhhDesign"));

const App: React.FC = () => {
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);
  const [hash, setHash] = useState<string>(window.location.hash);

  useEffect(() => {
    const onHashChange = () => setHash(window.location.hash);
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  // Effect to apply/remove dark mode class on body and persist preference
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "dark") {
      setIsDarkMode(true);
      document.documentElement.classList.add("dark");
    } else {
      setIsDarkMode(false);
      document.documentElement.classList.remove("dark");
    }
  }, []);

  const toggleTheme = () => {
    setIsDarkMode((prevMode) => {
      const newMode = !prevMode;
      if (newMode) {
        document.documentElement.classList.add("dark");
        localStorage.setItem("theme", "dark");
      } else {
        document.documentElement.classList.remove("dark");
        localStorage.setItem("theme", "light");
      }
      return newMode;
    });
  };

  // Empty hash = Apple (main page); "#/designs/v1" = original site (Version 1).
  // Other hashes (e.g. "#contact" anchors on Version 1) keep the current design.
  const design = currentDesignId(hash);

  if (design === "apple") {
    return (
      <Suspense fallback={null}>
        <AppleDesign
          isDarkMode={isDarkMode}
          toggleTheme={toggleTheme}
        />
      </Suspense>
    );
  }

  if (design === "frame") {
    return (
      <Suspense fallback={null}>
        <FrameDesign
          isDarkMode={isDarkMode}
          toggleTheme={toggleTheme}
          onExit={() => goToDesign("")}
        />
      </Suspense>
    );
  }

  if (design === "nerd") {
    return (
      <Suspense fallback={null}>
        <NerdDesign
          isDarkMode={isDarkMode}
          toggleTheme={toggleTheme}
          onExit={() => goToDesign("")}
        />
      </Suspense>
    );
  }

  if (design === "blahhh") {
    return (
      <Suspense fallback={null}>
        <BlahhhDesign
          isDarkMode={isDarkMode}
          toggleTheme={toggleTheme}
          onExit={() => goToDesign("")}
        />
      </Suspense>
    );
  }

  const footerLeftLinks = [
    { href: "#Hero", label: "About" },
    { href: "#technologies", label: "Technologies" },
    { href: "#projects", label: "Projects" },
    { href: "#github", label: "GitHub" },
    { href: "#activity", label: "Activity" },
    { href: "#experience", label: "Experience" },
    { href: "#contact", label: "Contact" },
  ];

  const footerRightLinks = [
    { href: "#privacy", label: "Privacy Policy" },
    { href: "#terms", label: "Terms of Service" },
  ];

  return (
    <div className="relative min-h-screen transition-colors duration-500">
      {/* Background Component - Always rendered, handles its own theme */}
      <Background isDarkMode={isDarkMode} />

      {/* Main content layers */}
      <Hello isDarkMode={isDarkMode} />
      <SidebarNavbar toggleTheme={toggleTheme} isDarkMode={isDarkMode} />
      <main className="relative lg:ml-20 z-10"> {/* Add margin-left for sidebar, ensure content is above background */}
        <Hero isDarkMode={isDarkMode} />
        <AboutMe isDarkMode={isDarkMode} />
        <Technologies isDarkMode={isDarkMode} />
        <GitHubProjects isDarkMode={isDarkMode} /> {/* Live GitHub projects */}
        <div id="activity">
          <Activity variant="site" />
        </div>
        <Experience isDarkMode={isDarkMode} />
        <Contact isDarkMode={isDarkMode} />
      </main>
      <Footer
        leftLinks={footerLeftLinks}
        rightLinks={footerRightLinks}
        copyrightText={`© ${new Date().getFullYear()} Pulkit Tiwari. All rights reserved.`}
        isDarkMode={isDarkMode}
      />
    </div>
  );
};

export default App;