import React from "react";
import { Reorder } from "framer-motion";

import { ReactComponent as CloseIcon } from "../images/close-icon.svg";

const ReorderItem = ({ type, key, value, i, handleRemoveContent }) => {
  if (type === "text") {
    return (
      <Reorder.Item key={key} value={value}>
        <div className="item-text">
          {value.text}
          <button onClick={() => handleRemoveContent(i)}>
            <CloseIcon />
          </button>
        </div>
      </Reorder.Item>
    );
  }
  return (
    <Reorder.Item key={key} value={value}>
      <div className="item-image">
        <img src={URL.createObjectURL(value.tempImagePreviewFile)} alt="item image"/>
        {value.imageCaption && <span>{value.imageCaption}</span>}
        <button onClick={() => handleRemoveContent(i)}>
          <CloseIcon />
        </button>
      </div>
    </Reorder.Item>
  );
};

export default ReorderItem;
