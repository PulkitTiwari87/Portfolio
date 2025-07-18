import React, { useState, useEffect } from "react";
import SidebarNavbar from "./components/Bar";
import AboutMe from "./components/Aboutme";
import Technologies from "./components/Technologies";
import Experience from "./components/Experience";
import Footer from "./components/ui/animated-footer";
import Hero from "./components/Hero";
import Hello from "./components/Hello";
import Background from "./components/Background"; // Your custom background component
import Project from "./components/Project"; // Import the Project component

const App: React.FC = () => {
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);

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

  const footerLeftLinks = [
    { href: "#Hero", label: "About" },
    { href: "#technologies", label: "Technologies" },
    { href: "#projects", label: "Projects" }, // Added this link for the Projects section
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
        <Project isDarkMode={isDarkMode} /> {/* Add the Project component here */}
        <Experience isDarkMode={isDarkMode} />
        {/* Add other sections here if needed */}
      </main>
      <Footer
        leftLinks={footerLeftLinks}
        rightLinks={footerRightLinks}
        copyrightText={`© ${new Date().getFullYear()} Pulkit Tiwari. All rights reserved.`}
      />
    </div>
  );
};

export default App;