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
    <div className="item" key={title} style={style}>
      <div className="image-container">
        <Link to={`/post/${id}`} onClick={onClick}>
          {loading && <div className="skeleton" />}
          <img
            src={thumbnailImage}
            onLoad={handleOnLoad}
            alt={`${title} thumbnail image`}
          />
        </Link>
      </div>
      <div className="item-title">
        <Link className="link" to={`/post/${id}`} onClick={onClick}>
          {title}
        </Link>
        <p className="date">{datePosted}</p>
      </div>
    </div>
  );
};

export default Item;
