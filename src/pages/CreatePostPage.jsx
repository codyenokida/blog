import React, { useContext, useEffect, useState, useRef } from "react";
import { Reorder, useMotionValue } from "framer-motion";
import { collection, getDocs, doc, setDoc } from "firebase/firestore";
import { uploadBytes, getDownloadURL, ref } from "firebase/storage";
import { useNavigate } from "react-router-dom";
import imageCompression from "browser-image-compression";
import { v4 as uuidv4 } from "uuid";

import { ThemeContext } from "../context/ThemeContext";
import transition from "../transitions/transitions";

import { ReactComponent as ImagePlaceholder } from "../images/image-placeholder.svg";
import { ReactComponent as TextPlaceholder } from "../images/text-placeholder.svg";

import { ReactComponent as CloseIcon } from "../images/close-icon.svg";

import "../styles/_createPost.scss";
import SplitText from "../components/SplitText";
import { db, storage } from "../utils/firebase";
import Modal from "../components/Modal";
import ReorderItem from "../components/ReorderItem";

const categories = ["Takes", "Travel", "Movies", "Tech", "Misc."];

function isValidSpotifyTrackURL(url) {
  const spotifyRegex =
    /^https?:\/\/open.spotify\.com\/(track|playlist|album)\/[a-zA-Z0-9]+\/?.*/;
  return spotifyRegex.test(url);
}

const CreatePostPage = () => {
  const navigate = useNavigate();

  // Modal State
  const [showModal, setShowModal] = useState(""); // enum("", "text", "image")

  // Fields to create a blog
  const [title, setTitle] = useState("");
  const [spotifyLink, setSpotifyLink] = useState("");
  const [chosenCategoryIndex, setChosenCategoryIndex] = useState(0);
  const [thumbnail, setThumbnail] = useState(null);
  const [content, setContent] = useState([]);

  // Error states
  const [titleError, setTitleError] = useState(false);
  const [spotifyLinkError, setSpotifyLinkError] = useState(false);
  const [thumbnailError, setThumbnailError] = useState(false);
  const [contentError, setContentError] = useState(false);

  // Loading State
  const [postLoading, setPostLoading] = useState(false);

  // Create a reference to the hidden file input element
  const hiddenFileInput = useRef(null);

  // Theme
  const { darkTheme } = useContext(ThemeContext);
  const themeClassName = darkTheme ? "dark" : "light";

  /**
   * Listeners for error states of each element
   */
  useEffect(() => {
    if (title.length) {
      setTitleError(false);
    }
  }, [title]);

  useEffect(() => {
    if (spotifyLink && isValidSpotifyTrackURL(spotifyLink)) {
      setSpotifyLinkError(false);
    }
  }, [spotifyLink]);

  useEffect(() => {
    if (thumbnail !== null) {
      setThumbnailError(false);
    }
  }, [thumbnail]);

  useEffect(() => {
    if (content.length) {
      setContentError(false);
    }
  }, [content]);

  /**
   * Handles clearing all content
   */
  const handleClearAll = () => {
    setTitle("");
    setThumbnail("");
    setContent([]);
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
      setThumbnail(compressedImage);
    }
  };

  /**
   * Promgramatically clicks the hidden file input element when the button
   * component is clicked
   * @param {Event} _event
   */
  const handleImageUploadFileInputClick = (_event) => {
    hiddenFileInput.current.click();
  };

  /**
   * Handles opening the modal
   * @param {"" | "text" | "image"} type
   */
  const handleShowModalClick = (type) => {
    setShowModal(type);
  };

  /**
   * Handler for removing an index from content
   * @param {number} index
   */
  const handleRemoveContent = (index) => {
    const copy = [...content];
    if (index === 0) {
      copy.shift();
    } else if (index === content.length - 1) {
      copy.pop();
    } else {
      copy.splice(index, 1);
    }
    setContent(copy);
  };

  /**
   * Handles uploading the image and returns the firestore URL
   * @param {File} image
   * @param {number} blogPostIndex
   * @returns {string} url
   */
  const uploadImage = async (image, blogPostIndex) => {
    const storageRef = ref(storage, `images/${blogPostIndex}/${uuidv4()}`);
    const compressedImage = await imageCompression(image, {
      maxSizeMB: 1,
      maxWidthOrHeight: 1920,
      useWebWorker: true,
    });
    const task = await uploadBytes(storageRef, compressedImage);
    const url = await getDownloadURL(task.ref);
    return url;
  };

  /**
   * Handles form submit
   *
   * Uploads all the content images to firebase storage,
   * Uses the download URL and stores them in firestore.
   *
   * Navigates to the blog page
   */
  const handleFormSubmit = async () => {
    let error;

    if (!title) {
      setTitleError(true);
      error = true;
    }

    if (spotifyLink && !isValidSpotifyTrackURL(spotifyLink)) {
      setSpotifyLinkError(true);
      error = true;
    }

    if (!thumbnail) {
      setThumbnailError(true);
      error = true;
    }

    if (!content.length) {
      setContentError(true);
      error = true;
    }

    if (error) {
      return;
    }

    setPostLoading(true);
    const postId = uuidv4();
    const blogPostRef = doc(db, "blog-post", `${postId}`);

    const contentToUpload = await Promise.all(
      content.map(async (section) => {
        if (section.type === "text") {
          return section;
        } else if (section.type === "image") {
          const imageFile = section.tempImagePreviewFile;
          const storageImageUrl = await uploadImage(imageFile, postId);

          return {
            ...section,
            tempImagePreviewFile: null,
            imageUrl: storageImageUrl,
          };
        }
      })
    );

    const datePosted = new Date().toLocaleDateString();

    // Upload thumbnail Image
    const thumbnailImage = await uploadImage(thumbnail, postId);

    const collectionObj = {
      title,
      thumbnailImage,
      content: contentToUpload,
      datePosted,
      category: categories[chosenCategoryIndex],
      spotifyLink,
      id: postId,
    };

    setDoc(blogPostRef, { ...collectionObj }, { merge: true });
    setPostLoading(false);

    // Redirect to the blog page
    navigate(`/post/${postId}`);
  };

  return (
    <>
      {showModal && (
        <Modal
          type={showModal}
          setShowModal={setShowModal}
          content={content}
          setContent={setContent}
        />
      )}
      <div className={`post-create-container ${themeClassName}`}>
        <h1>Create blog post!</h1>
        <div className="content-post-container">
          <div className="content">
            <div>
              <input
                className="title-input"
                value={title}
                placeholder="TITLE HERE!!"
                onChange={(e) => setTitle(e.target.value)}
              />
              {titleError && (
                <span className="error">Needs to be a title homie</span>
              )}
            </div>
            <div>
              <input
                className="spotify-input"
                value={spotifyLink}
                placeholder="Spotify Link HERE!"
                onChange={(e) => setSpotifyLink(e.target.value)}
              />
              {spotifyLinkError && (
                <span className="error">
                  Needs to be a valid spotify link homie
                </span>
              )}
            </div>

            <div className="category-container">
              {categories.map((category, i) => (
                <button
                  key={category}
                  className={`category-pill ${
                    chosenCategoryIndex === i ? "active" : ""
                  }`}
                  onClick={() => setChosenCategoryIndex(i)}
                >
                  {category}
                </button>
              ))}
            </div>
            <div>
              {thumbnail ? (
                <div className="image-container">
                  <img src={URL.createObjectURL(thumbnail)} />
                  <button onClick={() => setThumbnail(null)}>
                    <CloseIcon />
                  </button>
                </div>
              ) : (
                <button
                  className="image-container"
                  onClick={handleImageUploadFileInputClick}
                >
                  <div className="image-placeholder">
                    <ImagePlaceholder />
                    <p>Cover photo goes here!!!</p>
                  </div>
                  <input
                    ref={hiddenFileInput}
                    type="file"
                    onChange={onImageChange}
                    onClick={onImageChange}
                  />
                </button>
              )}
              {thumbnailError && (
                <span className="error">Needs to be a thumbnail man</span>
              )}
            </div>

            <div className="content-block">
              {contentError && (
                <span className="error">
                  You should prob write something before posting
                </span>
              )}
              <Reorder.Group values={content} onReorder={setContent}>
                {content.map((contentBlock, i) => (
                  <ReorderItem
                    type={contentBlock.type}
                    key={contentBlock.id}
                    value={contentBlock}
                    i={i}
                    handleRemoveContent={handleRemoveContent}
                  />
                ))}
              </Reorder.Group>
            </div>

            <div className="section-create-container">
              <div
                className="section-chooser"
                onClick={() => handleShowModalClick("image")}
              >
                <ImagePlaceholder />
                <p>Add Image</p>
              </div>
              <div
                className="section-chooser"
                onClick={() => handleShowModalClick("text")}
              >
                <TextPlaceholder />
                <p>Add Text</p>
              </div>
            </div>
          </div>
        </div>
        <div className="button-container">
          <button onClick={handleClearAll}>Clear All</button>
          <button onClick={handleFormSubmit} disabled={postLoading}>
            {postLoading ? "Loading" : "Post"}
          </button>
        </div>
      </div>
    </>
  );
};

export default transition(CreatePostPage);
