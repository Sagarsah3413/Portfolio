import { assets, certificationsData } from "@/assets/assets";
import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";
const Certifications = ({ isDarkMode }) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      transition={{ duration: 1 }}
      id="certifications"
      className="w-full px-[12%] py-10 scroll-mt-20"
    >
      <motion.h4
        initial={{ opacity: 0, y: -20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="text-center mb-2 text-lg font-Ovo"
      >
        Professional growth through continuous learning
      </motion.h4>
      <motion.h2
        initial={{ opacity: 0, y: -20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.5 }}
        className="text-center text-5xl font-Ovo"
      >
        My Certifications
      </motion.h2>
      <motion.p
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.7 }}
        className="text-center max-w-2xl mx-auto mb-12 font-Ovo"
      >
        Explore a curated list of certifications I've earned to sharpen my
        technical skills and stay current with industry standards.
      </motion.p>
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.9 }}
        className="grid grid-cols-auto gap-5 my-10 dark:text-black"
      >
        {certificationsData.map((certificate, index) => (
          <motion.div
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.3 }}
            className="w-full rounded-lg relative cursor-pointer group overflow-hidden shadow-lg"
            key={index}
            // style={{ backgroundImage: `url(${certificate.bgImage})` }}
          >
            <div className="rounded-lg overflow-hidden shadow-md  bg-white">
              <img
                src={certificate.bgImage}
                alt={certificate.title}
                className="w-full h-full object-contain p-4 bg-white"
              />
            </div>
            <div className="bg-slate-50 w-10/12 rounded-md absolute bottom-5 left-1/2 -translate-x-1/2 py-1 px-3 flex items-center justify-between gap-4  transition-all duration-500 group-hover:bottom-7">
              <p className=" text-sm ">{certificate.title}</p>
              <div className="border rounded-full border-black w-9 aspect-square flex items-center justify-center shadow-[2px_2px_0_#000] group-hover:bg-lime-300 transition">
                <a href={certificate.link}>
                  <Image
                    src={assets.send_icon}
                    alt="send icon"
                    className="w-5"
                  />
                </a>
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>
      <motion.a
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 1.1 }}
        href=""
        className="w-max flex items-center justify-center gap-2 text-grey-700 border-[0.5px] border-grey-700 rounded-full py-3 px-10 mx-auto my-20 hover:bg-lightHover duration-500 dark:text-white dark:hover:bg-darkHover"
      >
        Show more{" "}
        <Image
          src={
            isDarkMode ? assets.right_arrow_bold_dark : assets.right_arrow_bold
          }
          alt="Right arrow"
          className="w-4"
        />{" "}
      </motion.a>
    </motion.div>
  );
};

export default Certifications;
