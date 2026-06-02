import { assets } from "@/assets/assets";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import { motion } from "motion/react";

const Header = () => {
  const [headerData, setHeaderData] = useState({
    name: "Sagar Kumar Sah",
    title: "Software Developer",
    bio: "I'm Sagar Kumar Sah, a full-stack software engineer and M.Tech. scholar at IIT Indore (HJBSS Scholar, Govt. of India). I hold a B.Tech. in Computer Science from Delhi Technological University (CGPA 8.49, ICCR Scholar). With hands-on internship experience at Innovaccer (health-tech, India) and M.N Software (Kathmandu), I specialize in the MERN stack, Python/Flask, and applied ML. My work spans production-grade API systems, AI-powered recommendation engines, and medical imaging classification using Vision Transformers. I'm actively seeking software engineering internship roles in tech industry.",
  });
  const [resumePath, setResumePath] = useState("/Sagar_Resume.pdf");

  useEffect(() => {
    const fetchHeaderContent = async () => {
      try {
        const response = await fetch("/api/content?section=header");
        if (response.ok) {
          const result = await response.json();
          setHeaderData(result.data);
        }
      } catch (error) {
        console.log("Using default header content");
      }
    };

    const fetchResumePath = async () => {
      try {
        const response = await fetch("/api/content?section=resume");
        if (response.ok) {
          const result = await response.json();
          if (result.data?.path) {
            setResumePath(result.data.path);
          }
        }
      } catch (error) {
        console.log("Using default resume path");
      }
    };

    fetchHeaderContent();
    fetchResumePath();
  }, []);

  return (
    <div className="w-11/12 max-w-3xl text-center mx-auto h-screen flex flex-col justify-center items-center gap-4">
      <motion.div
        initial={{ scale: 0 }}
        whileInView={{ scale: 1 }}
        transition={{ duration: 0.8, type: "spring", stiffness: 100 }}
      >
        <Image src={assets.profile_img} alt="" className="rounded-full w-32" />
      </motion.div>
      <motion.h3
        initial={{ y: -20, opacity: 0 }}
        whileInView={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.3 }}
        className="flex items-end gap-2 text-xl md:text-2xl mb-3 font-Ovo"
      >
        Hi! I'm {headerData.name}{" "}
        <Image src={assets.hand_icon} alt="" className="w-6" />
      </motion.h3>
      <motion.h1
        initial={{ y: -30, opacity: 0 }}
        whileInView={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.5 }}
        className="text-3xl sm:text-6xl lg:text-[66px}font-Ovo"
      >
        {headerData.title}
      </motion.h1>
      <motion.p
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.7 }}
        className="max-w-2xl mx-auto font-Ovo"
      >
        {headerData.bio}
      </motion.p>
      <div className="flex flex-col sm:flex-row items-center gap-4 mt-4">
        <motion.a
          initial={{ y: 30, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 1 }}
          href="#contact"
          className="px-10 py-3 border rounded-full bg-black text-white flex items-center gap-2 dark:bg-transparent"
        >
          contact me
          <Image src={assets.right_arrow_white} alt="" className="w-4" />
        </motion.a>
        <motion.a
          initial={{ y: 30, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 1.2 }}
          href={resumePath}
          download
          className="px-10 py-3 border rounded-full border-grey-500 flex items-center gap-2 bg-white dark:text-black"
        >
          my resume
          <Image src={assets.download_icon} alt="" className="w-4" />
        </motion.a>
      </div>
    </div>
  );
};

export default Header;
