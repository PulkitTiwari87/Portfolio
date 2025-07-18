import React, { useEffect, useRef, useState } from 'react';
import Default from "../assets/Default.jpg";
import VKJ from "../assets/VKJ.jpg";
import Portfolio from "../assets/Portfolio.jpg";

// Define the interface for a single project
interface Project {
  id: string;
  name: string;
  date: string;
  githubLink: string;
  imageUrl: string;
  category: string; // Added category for filtering
}

// Dummy project data
const projectsData: Project[] = [
  {
    id: '1',
    name: 'Web Crawler',
    date: '2023', // Simplified date for UI consistency
    githubLink: 'https://github.com/PulkitTiwari51/webcrawler',
    imageUrl: Default,
    category: 'Utility',
  },
  {
    id: '2',
    name: 'VKJ Projects',
    date: '2025',
    githubLink: 'https://github.com/PulkitTiwari51/VKJ',
    imageUrl: VKJ,
    category: 'Web Development',
  },
  {
    id: '3',
    name: 'Personal Portfolio vs.1',
    date: '2023',
    githubLink: 'https://github.com/PulkitTiwari51/Portfolio',
    imageUrl: Portfolio,
    category: 'Web Development', // Category for Web Design
  },
  {
    id: '4',
    name: 'Amazon.com Clone',
    date: '2023',
    githubLink: 'https://github.com/PulkitTiwari51/Amazon_Clone_Frontend',
    imageUrl: Default,
    category: 'Web Development',
  },
  {
    id: '5',
    name: 'Capstone Project Java',
    date: '2025',
    githubLink: 'https://github.com/PulkitTiwari51/Capstone-Project-2',
    imageUrl: Default,
    category: 'Web Development',
  },

];

// ProjectItem Component: Represents a single project row
const ProjectItem: React.FC<{ project: Project; index: number; isDarkMode: boolean }> = ({ project, index, isDarkMode }) => {
  const itemRef = useRef<HTMLDivElement>(null);
  const [showImage, setShowImage] = useState(false);
  const [imagePosition, setImagePosition] = useState({ x: 0, y: 0 });

  // Handle mouse movement to update image position
  const handleMouseMove = (e: React.MouseEvent) => {
    // Get the position relative to the viewport
    setImagePosition({ x: e.clientX, y: e.clientY });
  };

  return (
    <a
      href={project.githubLink}
      target="_blank"
      rel="noopener noreferrer"
      ref={itemRef}
      className={`project-item relative flex items-center py-6 border-b cursor-pointer overflow-hidden group
        ${isDarkMode ? 'border-gray-700' : 'border-gray-300'}`}
      onMouseEnter={() => setShowImage(true)}
      onMouseLeave={() => setShowImage(false)}
      onMouseMove={handleMouseMove}
    >
      {/* Project Number */}
      <div className={`flex-shrink-0 text-3xl font-bold mr-8 opacity-50 group-hover:opacity-100 transition-opacity duration-300
        ${isDarkMode ? 'text-white' : 'text-gray-700'}`}>
        {index + 1}
      </div>

      {/* Project Name */}
      <div className="flex-1">
        <h3 className={`text-4xl md:text-5xl font-extrabold transition-colors duration-300
          ${isDarkMode ? 'text-gray-375 group-hover:text-white' : 'text-gray-700 group-hover:text-black'}`} >
          {project.name}
        </h3>
      </div>

      {/* Project Date */}
      <div className={`flex-shrink-0 text-lg md:text-xl
        ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
        {project.date}
      </div>

      {/* Project Image on Hover */}
      {showImage && (
        <img
          src={project.imageUrl}
          alt={project.name}
          className="fixed z-50 w-52 h-52 object-cover rounded-xl shadow-2xl pointer-events-none transform -translate-x-1/2 -translate-y-1/2 transition-opacity duration-100 ease-out"
          style={{ left: imagePosition.x, top: imagePosition.y }}
          // Fallback for broken images
          onError={(e: React.SyntheticEvent<HTMLImageElement, Event>) => {
            e.currentTarget.src = `https://placehold.co/200x200/CCCCCC/000000?text=Image+Error`;
          }}
        />
      )}
    </a>
  );
};

// Projects Component: Main container for all projects
interface ProjectProps {
  isDarkMode: boolean;
}

const Project: React.FC<ProjectProps> = ({ isDarkMode }) => {
  const projectsContainerRef = useRef<HTMLDivElement>(null);
  const [activeFilter, setActiveFilter] = useState<string>('All');

  // Dynamically get categories from projectsData
  const categories = Array.from(new Set(projectsData.map(project => project.category)));

  // Filter projects based on the active filter
  const filteredProjects = projectsData.filter(project =>
    activeFilter === 'All' ? true : project.category === activeFilter
  );

  useEffect(() => {
    // Access gsap and ScrollTrigger from the window object, assuming they are loaded via CDN.
    const gsap = (window as any).gsap;
    const ScrollTrigger = (window as any).ScrollTrigger;

    if (!gsap || !ScrollTrigger) {
      console.error('GSAP or ScrollTrigger not found. Please ensure they are loaded via CDN.');
      return;
    }

    // Register ScrollTrigger plugin with GSAP
    gsap.registerPlugin(ScrollTrigger);

    // Get all project items
    const projectItems = gsap.utils.toArray('.project-item');

    // Animate each project item
    projectItems.forEach((item: HTMLElement) => {
      gsap.fromTo(
        item,
        { y: 100, opacity: 0 }, // Start state: 100px down, invisible
        {
          y: 0, // End state: original position
          opacity: 1, // End state: fully visible
          duration: 1,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: item,
            start: 'top 85%', // Start animation when the top of the item is 85% from the top of the viewport
            toggleActions: 'play none none none', // Play once when entering viewport
          },
        }
      );
    });

    // Cleanup ScrollTriggers on component unmount
    return () => {
      ScrollTrigger.getAll().forEach((trigger: any) => trigger.kill());
    };
  }, [activeFilter, filteredProjects.length]); // Re-run effect when activeFilter changes or project count changes to re-apply animations

  return (
    <div
      id="projects" // Added ID for navigation
      className={`w-full min-h-screen bg-transparent font-inter flex flex-col items-center
        ${isDarkMode ? 'text-white' : 'text-black'}`}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 max-w-4xl">
        {/* Heading */}
        <h1 className="text-5xl md:text-6xl font-extrabold mb-8 text-center">
          Recent Projects
        </h1>

        {/* Filter Buttons */}
        <div className="flex flex-wrap justify-center items-center mb-12 space-x-2 sm:space-x-4">
          <div className="flex flex-wrap justify-center space-x-2 sm:space-x-4 mb-4 sm:mb-0">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setActiveFilter(category)}
                className={`text-lg font-medium px-4 py-2 rounded-full transition-colors duration-300 whitespace-nowrap
                  ${activeFilter === category
                    ? (isDarkMode ? 'bg-gray-700 text-white' : 'bg-blue-600 text-white') // Active button color based on theme
                    : (isDarkMode ? 'text-gray-400 hover:text-white hover:bg-stone-900' : 'text-gray-600 hover:text-black hover:bg-gray-200')
                  }`}
              >
                {category}
              </button>
            ))}
          </div>
          <button
            onClick={() => setActiveFilter('All')}
            className={`text-lg font-medium hover:underline mt-4 sm:mt-0 whitespace-nowrap
              ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}
          >
            All Projects
          </button>
        </div>

        {/* Project List */}
        <div ref={projectsContainerRef} className="grid grid-cols-1">
          {filteredProjects.length > 0 ? (
            filteredProjects.map((project, index) => (
              <ProjectItem key={project.id} project={project} index={index} isDarkMode={isDarkMode} />
            ))
          ) : (
            <p className={`text-center text-xl py-10 ${isDarkMode ? 'text-gray-500' : 'text-gray-600'}`}>
              No projects found for this category.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Project;