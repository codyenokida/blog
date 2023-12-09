import React, { useContext } from "react";
import { ThemeContext } from "../context/ThemeContext";

import "../styles/_errors.scss";
import { Link } from "react-router-dom";

const ErrorPage = () => {
  const { darkTheme } = useContext(ThemeContext);

  const themeClassName = darkTheme ? "dark" : "light";

  return (
    <div className={`error-container ${themeClassName}`}>
      <h1>Oops!</h1>
      <p>You've reached somewhere you aren't supposed to be.</p>
      <Link to="/">Go back!!</Link>
    </div>
  );
};

export default ErrorPage;
