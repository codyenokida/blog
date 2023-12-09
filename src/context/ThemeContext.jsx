import React, { createContext, useEffect, useState } from "react";

const ThemeContext = createContext();

const ThemeContextProvider = (props) => {
  const [darkTheme, setDarkTheme] = useState(false);

  useEffect(() => {
    const storedTheme = localStorage.getItem("theme");
    if (storedTheme) return setDarkTheme(storedTheme === "dark");
    localStorage.setItem("theme", "light");
  }, []);

  const toggleTheme = () => {
    setDarkTheme(!darkTheme);
    const themeString = darkTheme ? "light" : "dark";
    localStorage.setItem("theme", themeString);
  };

  return (
    <ThemeContext.Provider value={{ darkTheme, toggleTheme }}>
      {props.children}
    </ThemeContext.Provider>
  );
};

export { ThemeContext, ThemeContextProvider };
