import React, { useState, useRef, useEffect } from "react";
import { Reorder } from "framer-motion";

import { ReactComponent as CloseIcon } from "../images/close-icon.svg";

const ReorderItem = ({
  type,
  value,
  key,
  i,
  handleRemoveContent,
  handleEditContent,
}) => {
  const originalText = value.text;

  const textRef = useRef(null);
  const [tempText, setTempText] = useState(originalText);
  const [textAreaHeight, setTextAreaHeight] = useState(0);
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    setEditing(originalText !== tempText);
  }, [tempText, originalText, setEditing]);

  useEffect(() => {
    if (textRef) {
      setTextAreaHeight(textRef?.current?.scrollHeight);
    }
  }, [editing]);

  const handleCancelEditing = () => {
    setTempText(originalText);
    setEditing(false);
  };

  if (type === "text") {
    return (
      <Reorder.Item key={key} value={value}>
        <>
          <div className="item-text">
            {editing ? (
              <textarea
                value={tempText}
                ref={textRef}
                style={{ height: textAreaHeight }}
                onChange={(e) => setTempText(e.target.value)}
              />
            ) : (
              value.text
            )}
            <button onClick={() => handleRemoveContent(i)}>
              <CloseIcon />
            </button>
          </div>
          {!editing && <button onClick={() => setEditing(true)}>edit</button>}
          {editing && (
            <span>
              <button
                onClick={() => {
                  handleEditContent(i, { ...value, text: tempText });
                  setEditing(false);
                }}
              >
                :P
              </button>
              <button onClick={handleCancelEditing}>X</button>
            </span>
          )}
        </>
      </Reorder.Item>
    );
  }
  return (
    <Reorder.Item key={key} value={value}>
      <div className="item-image">
        <img
          src={
            value.imageUrl
              ? value.imageUrl
              : URL.createObjectURL(value.tempImagePreviewFile)
          }
          alt="item temporary"
        />
        {value.imageCaption && <span>{value.imageCaption}</span>}
        <button onClick={() => handleRemoveContent(i)}>
          <CloseIcon />
        </button>
      </div>
    </Reorder.Item>
  );
};

export default ReorderItem;
