import React from "react";

const ItemSkeleton = ({ id, index }) => {
  const style = { animationDelay: 0.25 + index / 20 + "s" };

  return (
    <div className="item-skeleton" key={id} style={style}>
      <div className="image-container">
        <div className="skeleton" />
      </div>
      <div className="item-title">
        <div className="title">
          <div className="skeleton" />
        </div>
        <div className="link">
          <div className="skeleton" />
        </div>
      </div>
    </div>
  );
};

export default ItemSkeleton;
