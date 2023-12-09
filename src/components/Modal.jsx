import React, { useEffect, useCallback, useRef, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import imageCompression from "browser-image-compression";

import { ReactComponent as ImagePlaceholder } from "../images/image-placeholder.svg";
import { ReactComponent as CloseIcon } from "../images/close-icon.svg";

import "../styles/_modal.scss";

const Modal = ({ type, setShowModal, content, setContent }) => {
  const [paragraph, setParagraph] = useState("");
  const [tempImagePreviewUrl, setTempImagePreviewUrl] = useState("");
  const [tempImagePreviewFile, setTempImagePreviewFile] = useState(null);
  const [imageCaption, setImageCaption] = useState("");

  // Create a reference to the hidden file input element
  const hiddenFileInput = useRef(null);

  const escFunction = useCallback(
    (event) => {
      if (event.key === "Escape") {
        setShowModal("");
      }
    },
    [setShowModal]
  );

  const handleCancel = () => {
    setParagraph("");
    setShowModal("");
  };

  /**
   * Function that handles image removal
   */
  const handleImageRemove = () => {
    setTempImagePreviewUrl("");
    setTempImagePreviewFile(null);
  };

  /**
   * Function that handles image change
   * @param {Event} event
   */
  const onImageChange = async (event) => {
    if (event.target.files && event.target.files[0]) {
      const compressedImage = await imageCompression(event.target.files[0], {
        maxSizeMB: 1,
        maxWidthOrHeight: 1920,
        useWebWorker: true,
      });
      setTempImagePreviewUrl(URL.createObjectURL(compressedImage));
      setTempImagePreviewFile(compressedImage);
    }
  };

  /**
   * Promgramatically clicks the hidden file input element when the button
   * component is clicked
   * @param {Event} _event
   */
  const handleClick = (_event) => {
    hiddenFileInput.current.click();
  };

  const handleSubmit = () => {
    if (type === "text") {
      const contentObj = {
        id: uuidv4(),
        type: "text",
        text: paragraph,
      };
      setContent([...content, contentObj]);
      setParagraph("");
      setShowModal("");
    } else if (type === "image") {
      const contentObj = {
        id: uuidv4(),
        type: "image",
        tempImagePreviewFile,
        imageCaption,
      };
      setContent([...content, contentObj]);
      setTempImagePreviewFile(null);
      setImageCaption("");
      setShowModal("");
    }
  };

  useEffect(() => {
    document.addEventListener("keydown", escFunction, false);

    return () => {
      document.removeEventListener("keydown", escFunction, false);
    };
  }, [escFunction]);

  switch (type) {
    case "text":
      return (
        <div className="modal">
          <div className="modal-content">
            <h1>Write a Paragraph</h1>
            <textarea
              value={paragraph}
              onChange={(e) => setParagraph(e.target.value)}
            />
            <div className="modal-button-container">
              <button onClick={handleCancel}>Cancel</button>
              <button onClick={handleSubmit}>Done</button>
            </div>
          </div>
        </div>
      );
    case "image":
      return (
        <div className="modal">
          <div className="modal-content">
            <h1>Post an Image</h1>
            {tempImagePreviewUrl ? (
              <div className="image-container">
                <img src={tempImagePreviewUrl} alt="temporary image preview" />
                <button onClick={handleImageRemove}>
                  <CloseIcon />
                </button>
              </div>
            ) : (
              <button className="image-container" onClick={handleClick}>
                <div className="image-placeholder">
                  <ImagePlaceholder />
                  <p>Drop your image here or click to browse!</p>
                </div>
                <input
                  ref={hiddenFileInput}
                  type="file"
                  onChange={onImageChange}
                  onClick={onImageChange}
                />
              </button>
            )}
            <div className="caption-container">
              <label>Caption (optional)</label>
              <input
                value={imageCaption}
                onChange={(e) => setImageCaption(e.target.value)}
              />
            </div>
            <div className="modal-button-container">
              <button onClick={handleCancel}>Cancel</button>
              <button onClick={handleSubmit}>Done</button>
            </div>
          </div>
        </div>
      );
    default:
      return null;
  }
};

export default Modal;
