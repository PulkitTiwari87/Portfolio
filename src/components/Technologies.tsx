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
} from "react-icons/si";
import {
    TbBrandReact,
    TbBrandNodejs,
    TbBrandCss3,
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
    ];

    return (
        <div
            id="technologies"
            className="relative w-full h-screen px-4 sm:px-6 lg:px-12 text-center transition-all duration-500 flex flex-col justify-center items-center"
        >
            {/* Section Heading */}
            <motion.h1
                whileInView={{ opacity: 1, y: 0 }}
                initial={{ opacity: 0, y: -100 }}
                transition={{ duration: 1.5 }}
                className={`text-4xl sm:text-5xl md:text-6xl lg:text-[5.5rem] font-bold mb-12 relative group inline-block transition-all ${
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
                className="w-full px-6 md:px-60 py-6" // Adjusted padding for responsiveness
            >
                <motion.div
                    whileInView={{ opacity: 1, x: 0 }}
                    initial={{ opacity: 0, x: -100 }}
                    transition={{ duration: 1.5 }}
                    className="flex flex-wrap justify-center gap-x-6 gap-y-10"
                >
                    {icons.map(({ component: Icon, color, duration }, index) => (
                        <motion.div
                            key={index}
                            initial="initial"
                            animate="animate"
                            variants={iconvariants(duration)}
                            className={`flex justify-center items-center cursor-pointer transform transition-all hover:scale-110 hover:rotate-6 ${
                                isDarkMode ? "hover:shadow-white" : "hover:shadow-black"
                            }`}
                        >
                            <Icon
                                className={`text-5xl sm:text-6xl md:text-7xl lg:text-8xl ${color}`}
                            />
                        </motion.div>
                    ))}
                </motion.div>
            </div>
        </div>
    );
};

export default Technologies;