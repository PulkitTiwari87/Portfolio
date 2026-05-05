import React from "react";
import { IconType } from "react-icons";
import { motion, Variants } from "framer-motion";
import { FaJava } from "react-icons/fa";
import {
    SiMongodb,
    SiHtml5,
    SiPython,
    SiMysql,
    SiExpress,
    SiJavascript,
    SiTailwindcss,
    SiPostgresql,
    SiNextdotjs,
    SiWordpress,
    SiElementor,
    SiBootstrap,
    SiC,
    SiTypescript,
    SiFirebase,
    SiFastapi,
    SiPlaywright,
    SiStrapi,
    SiGit,
    SiVite,
    SiLinux,
} from "react-icons/si";
import {
    TbBrandReact,
    TbBrandNodejs,
    TbBrandCss3,
    TbBrandAzure,
} from "react-icons/tb";

interface TechnologiesProps {
    isDarkMode: boolean;
}

const iconvariants = (duration: number): Variants => ({
    initial: { y: -10 },
    animate: {
        y: [10, -10],
        transition: {
            duration,
            ease: "linear",
            repeat: Infinity,
            repeatType: "reverse",
        },
    },
});

const Technologies: React.FC<TechnologiesProps> = ({ isDarkMode }) => {
    const icons: { component: IconType; color: string; duration: number }[] = [
        { component: SiMongodb, color: "text-green-500", duration: 12 },
        { component: SiTypescript, color: "text-blue-600", duration: 4 },
        { component: TbBrandReact, color: "text-blue-500", duration: 3 },
        { component: TbBrandNodejs, color: "text-green-500", duration: 5 },
        { component: TbBrandCss3, color: "text-blue-500", duration: 3 },
        { component: SiHtml5, color: "text-orange-500", duration: 6 },
        { component: SiPython, color: "text-yellow-500", duration: 9 },
        { component: SiMysql, color: "text-blue-500", duration: 7 },
        { component: SiExpress, color: "text-gray-500", duration: 5 },
        { component: SiJavascript, color: "text-yellow-500", duration: 7 },
        { component: SiTailwindcss, color: "text-blue-500", duration: 4 },
        { component: SiPostgresql, color: "text-blue-700", duration: 4 },
        { component: SiNextdotjs, color: "text-black dark:text-white", duration: 4 },
        { component: SiWordpress, color: "text-blue-600", duration: 5 },
        { component: SiElementor, color: "text-pink-600", duration: 5 },
        { component: SiBootstrap, color: "text-purple-600", duration: 5 },
        { component: SiC, color: "text-blue-600", duration: 4 },
        { component: FaJava, color: "text-orange-600", duration: 6 },
        // New Technologies from GitHub Projects
        { component: SiFirebase, color: "text-yellow-600", duration: 5 },
        { component: SiFastapi, color: "text-teal-500", duration: 6 },
        { component: SiPlaywright, color: "text-green-600", duration: 4 },
        { component: SiStrapi, color: "text-indigo-500", duration: 7 },
        { component: TbBrandAzure, color: "text-blue-400", duration: 8 },
        { component: SiGit, color: "text-orange-500", duration: 5 },
        { component: SiVite, color: "text-purple-500", duration: 4 },
        { component: SiLinux, color: "text-gray-400", duration: 6 },
    ];

    return (
        <div
            id="technologies"
            className="relative w-full min-h-screen px-4 sm:px-6 lg:px-12 text-center transition-all duration-500 flex flex-col justify-center items-center py-20"
        >
            {/* Section Heading */}
            <motion.h1
                whileInView={{ opacity: 1, y: 0 }}
                initial={{ opacity: 0, y: -100 }}
                transition={{ duration: 1.5 }}
                className={`text-4xl sm:text-5xl md:text-6xl lg:text-8xl font-black mb-20 tracking-tighter relative group inline-block transition-all ${
                    isDarkMode ? "text-white" : "text-black"
                }`}
            >
                Technologies
                <span
                    className={`absolute bottom-[-8px] left-1/2 transform -translate-x-1/2 w-1/4 h-1 transition-all duration-300 group-hover:w-full rounded-full ${
                        isDarkMode ? "bg-white" : "bg-black"
                    }`}
                ></span>
            </motion.h1>

            {/* Icon container wrapper */}
            <div
                className="w-full max-w-6xl px-6 py-6"
            >
                <motion.div
                    whileInView={{ opacity: 1, x: 0 }}
                    initial={{ opacity: 0, x: -100 }}
                    transition={{ duration: 1.5 }}
                    className="flex flex-wrap justify-center gap-x-10 gap-y-12"
                >
                    {icons.map(({ component: Icon, color, duration }, index) => (
                        <motion.div
                            key={index}
                            initial="initial"
                            animate="animate"
                            variants={iconvariants(duration)}
                            className={`flex justify-center items-center cursor-pointer transform transition-all hover:scale-125 hover:rotate-6 ${
                                isDarkMode ? "hover:shadow-[0_0_20px_rgba(255,255,255,0.2)]" : "hover:shadow-[0_0_20px_rgba(0,0,0,0.1)]"
                            }`}
                        >
                            <Icon
                                className={`text-6xl sm:text-7xl md:text-8xl ${color}`}
                            />
                        </motion.div>
                    ))}
                </motion.div>
            </div>
        </div>
    );
};

export default Technologies;