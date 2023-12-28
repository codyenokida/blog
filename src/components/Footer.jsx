import React from "react";

import { ReactComponent as Light } from "../images/sideBar/light.svg";

import "../styles/_footer.scss";

const Footer = ({ toggleTheme }) => {
  return (
    <div className="footer">
      <p>
        Made by Kota Cody Enokida using{" "}
        <a href="https://react.dev/" target="_blank" rel="noopener noreferrer">
          React👨‍💻
        </a>
        &nbsp;&&nbsp;
        <a
          href="https://firebase.google.com/"
          target="_blank"
          rel="noopener noreferrer"
        >
          Firebase🔥
        </a>
      </p>
      <button className="lights" onClick={toggleTheme}>
        <Light />
      </button>
    </div>
  );
};

export default Footer;
