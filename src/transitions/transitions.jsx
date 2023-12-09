import React, { useContext } from "react";
import { motion } from "framer-motion";

import { ThemeContext } from "../context/ThemeContext";

import "../styles/_transitions.scss";

const transition = (Component) => {
  return () => {
    const { darkTheme } = useContext(ThemeContext);

    const themeClassName = darkTheme ? "dark" : "light";

    return (
      <>
        <Component />
        <motion.div
          className={`slide-in ${themeClassName}`}
          initial={{ scaleY: 1 }}
          animate={{ scaleY: 0 }}
          exit={{ scaleY: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        />
        <motion.div
          className={`slide-out ${themeClassName}`}
          initial={{ scaleY: 0 }}
          animate={{ scaleY: 0 }}
          exit={{ scaleY: 1 }}
          transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
        />
      </>
    );
  };
};

export default transition;
