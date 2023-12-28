import React, { useState } from "react";
import { Link } from "react-router-dom";

const Item = ({ thumbnailImage, title, datePosted, index, onClick, id }) => {
  const [loading, setLoading] = useState(true);
  const style = { animationDelay: 0.25 + index / 20 + "s" };

  const handleOnLoad = () => {
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  };

  return (
    <Link
      className="item"
      key={title}
      style={style}
      to={`/post/${id}`}
      onClick={onClick}
    >
      <div className="image-container">
        {loading && <div className="skeleton" />}
        <img
          src={thumbnailImage}
          onLoad={handleOnLoad}
          alt={`${title} thumbnail`}
        />
      </div>
      <div className="item-title">
        <div className="title">{title}</div>
        <div className="read-here">Read here ↦</div>
      </div>
    </Link>
  );
};

export default Item;
