import React, { useState } from "react";
import { motion } from "framer-motion";
import { FaLinkedinIn, FaGithub, FaInstagram } from "react-icons/fa";

interface ContactProps {
    isDarkMode: boolean;
}

const Contact: React.FC<ContactProps> = ({ isDarkMode }) => {
    const [result, setResult] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const form = e.currentTarget;
        setLoading(true);
        setResult("Sending...");
        const formData = new FormData(form);

        // Using Web3Forms for submission
        const accessKey = import.meta.env.VITE_WEB3FORMS_ACCESS_KEY || "7bae02d0-5ae2-4090-9fd1-674ecb31fdf6";
        formData.append("access_key", accessKey);

        try {
            const response = await fetch("https://api.web3forms.com/submit", {
                method: "POST",
                body: formData,
            });
            const data = await response.json();
            if (data.success) {
                setResult("Message Sent Successfully!");
                form.reset();
            } else {
                setResult(data.message || "Something went wrong.");
            }
        } catch (err) {
            console.error(err);
            setResult("Failed to send message.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <section
            id="contact"
            className={`w-full min-h-screen flex flex-col items-center justify-center px-4 sm:px-6 lg:px-12 py-32 overflow-x-clip transition-colors duration-500
                ${isDarkMode ? "bg-transparent text-white" : "bg-transparent text-black"}`}
        >
            <div className="container mx-auto max-w-6xl">
                {/* Heading */}
                <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="mb-20 text-center lg:text-left"
                >
                    <h2 className="text-6xl md:text-8xl font-semibold type-display mb-4">
                        GET IN TOUCH
                    </h2>
                    <p className={`text-lg md:text-xl max-w-2xl ${isDarkMode ? "text-stone-400" : "text-gray-500"}`}>
                        Have a project in mind? Let's build something extraordinary together.
                        Reach out through the form or via my social channels.
                    </p>
                </motion.div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24">
                    {/* Left Side: Info & Socials */}
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        className="space-y-12"
                    >
                        <div>
                            <h3 className={`text-sm font-semibold type-label mb-6 ${isDarkMode ? "text-stone-400" : "text-gray-600"}`}>
                                Contact Details
                            </h3>
                            <a
                                href="mailto:tpulkit87@gmail.com"
                                className={`text-2xl md:text-3xl font-bold hover:underline transition-all ${isDarkMode ? "text-white" : "text-black"}`}
                            >
                                tpulkit87@gmail.com
                            </a>
                        </div>

                        <div>
                            <h3 className={`text-sm font-semibold type-label mb-6 ${isDarkMode ? "text-stone-400" : "text-gray-600"}`}>
                                Socials
                            </h3>
                            <div className="flex flex-wrap gap-6">
                                {[
                                    { icon: <FaLinkedinIn />, href: "https://linkedin.com/in/pulkittiwari51", label: "LinkedIn" },
                                    { icon: <FaGithub />, href: "https://github.com/PulkitTiwari87", label: "GitHub" },
                                    { icon: <FaInstagram />, href: "https://instagram.com/_pulkittiwari", label: "Instagram" },
                                ].map((social, idx) => (
                                    <a
                                        key={idx}
                                        href={social.href}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className={`text-2xl p-4 rounded-full border transition-all duration-300
                                            ${isDarkMode
                                                ? "border-stone-800 text-stone-400 hover:text-white hover:bg-stone-900 hover:border-stone-700"
                                                : "border-gray-300 text-gray-600 hover:text-black hover:bg-gray-100 hover:border-gray-400"}`}
                                        aria-label={social.label}
                                    >
                                        {social.icon}
                                    </a>
                                ))}
                            </div>
                        </div>

                        <div className={`p-8 rounded-2xl border ${isDarkMode ? "border-stone-800 bg-stone-900/30" : "border-gray-100 bg-gray-50/50"}`}>
                            <p className="text-sm italic opacity-70">
                                "Code is like humor. When you have to explain it, it’s bad."
                            </p>
                        </div>
                    </motion.div>

                    {/* Right Side: Form */}
                    <motion.div
                        initial={{ opacity: 0, x: 50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                    >
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label htmlFor="contact-name" className="block text-xs font-medium type-label opacity-60">Name</label>
                                    <input
                                        type="text"
                                        name="name"
                                        id="contact-name"
                                        autoComplete="name"
                                        required
                                        placeholder="John Doe"
                                        className={`w-full px-6 py-4 rounded-xl border transition-all duration-300 outline-none
                                            ${isDarkMode
                                                ? "bg-stone-900/50 border-stone-800 text-white focus:border-white"
                                                : "bg-white border-gray-200 text-black focus:border-black"}`}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label htmlFor="contact-email" className="block text-xs font-medium type-label opacity-60">Email</label>
                                    <input
                                        type="email"
                                        name="email"
                                        id="contact-email"
                                        autoComplete="email"
                                        required
                                        placeholder="john@example.com"
                                        className={`w-full px-6 py-4 rounded-xl border transition-all duration-300 outline-none
                                            ${isDarkMode
                                                ? "bg-stone-900/50 border-stone-800 text-white focus:border-white"
                                                : "bg-white border-gray-200 text-black focus:border-black"}`}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label htmlFor="contact-subject" className="block text-xs font-medium type-label opacity-60">Subject</label>
                                <input
                                    type="text"
                                    name="subject"
                                    id="contact-subject"
                                    required
                                    placeholder="Project Inquiry"
                                    className={`w-full px-6 py-4 rounded-xl border transition-all duration-300 outline-none
                                        ${isDarkMode
                                            ? "bg-stone-900/50 border-stone-800 text-white focus:border-white"
                                            : "bg-white border-gray-200 text-black focus:border-black"}`}
                                />
                            </div>

                            <div className="space-y-2">
                                <label htmlFor="contact-message" className="block text-xs font-medium type-label opacity-60">Message</label>
                                <textarea
                                    name="message"
                                    id="contact-message"
                                    required
                                    rows={5}
                                    placeholder="Tell me about your project..."
                                    className={`w-full px-6 py-4 rounded-xl border transition-all duration-300 outline-none resize-none
                                        ${isDarkMode
                                            ? "bg-stone-900/50 border-stone-800 text-white focus:border-white"
                                            : "bg-white border-gray-200 text-black focus:border-black"}`}
                                ></textarea>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className={`w-full py-5 rounded-xl font-medium tracking-normal text-lg transition-all duration-300
                                    ${isDarkMode
                                        ? "bg-white text-black hover:bg-stone-200 disabled:bg-stone-500"
                                        : "bg-black text-white hover:bg-stone-800 disabled:bg-gray-400"}`}
                            >
                                {loading ? "SENDING..." : "SEND MESSAGE"}
                            </button>

                            {result && (
                                <motion.p
                                    role="status"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className={`text-center font-medium ${result.includes("Successfully") ? "text-green-500" : "text-red-500"}`}
                                >
                                    {result}
                                </motion.p>
                            )}
                        </form>
                    </motion.div>
                </div>
            </div>
        </section>
    );
};

export default Contact;
