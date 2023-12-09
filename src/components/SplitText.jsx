import React from "react";

const SplitText = ({ children, delay = 20 }) => {
  return (
    <span aria-label={children} role="heading" aria-level="2">
      {children.split("").map(function (char, index) {
        let style = { animationDelay: 0.1 + index / delay + "s" };
        return (
          <span aria-hidden="true" key={index} style={style}>
            {char}
          </span>
        );
      })}
    </span>
  );
};

export default SplitText;
