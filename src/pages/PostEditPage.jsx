import React, { useContext, useEffect, useState, useRef } from "react";
import { Reorder } from "framer-motion";
import {
  doc,
  setDoc,
  collection,
  getDocs,
  where,
  query,
} from "firebase/firestore";
import { uploadBytes, getDownloadURL, ref } from "firebase/storage";
import { useLocation, useNavigate } from "react-router-dom";
import imageCompression from "browser-image-compression";
import { v4 as uuidv4 } from "uuid";

import { db, storage } from "../utils/firebase";
import { ThemeContext } from "../context/ThemeContext";

import { ReactComponent as ImagePlaceholder } from "../images/image-placeholder.svg";
import { ReactComponent as TextPlaceholder } from "../images/text-placeholder.svg";
import { ReactComponent as CloseIcon } from "../images/close-icon.svg";

import "../styles/_createPost.scss";

import Modal from "../components/Modal";
import ReorderItem from "../components/ReorderItem";

const categories = ["Thoughts", "Reviews", "Travel", "Tech", "Misc."];

function isValidSpotifyTrackURL(url) {
  const spotifyRegex =
    /^https?:\/\/open.spotify\.com\/(track|playlist|album)\/[a-zA-Z0-9]+\/?.*/;
  return spotifyRegex.test(url);
}

function formatDate(date) {
  var d = new Date(date),
    month = "" + (d.getMonth() + 1),
    day = "" + d.getDate(),
    year = d.getFullYear();

  if (month.length < 2) month = "0" + month;
  if (day.length < 2) day = "0" + day;

  return [year, month, day].join("-");
}

const PostEditPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const pathname = location?.pathname?.split("/") ?? "";
  const pathBlogPostId = pathname[2];

  // Modal State
  const [showModal, setShowModal] = useState(""); // enum("", "text", "image")

  // Fields to create a blog
  const [title, setTitle] = useState("");
  const [spotifyLink, setSpotifyLink] = useState("");
  const [chosenCategoryIndex, setChosenCategoryIndex] = useState(0);
  const [dateType, setDateType] = useState(0); // 0 = singel date, 1 = date range
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [thumbnail, setThumbnail] = useState(null);
  const [content, setContent] = useState([]);

  // Fields for Pre-populated images
  const [thumbnailPrepopulatedURL, setThumbnailPrepopulatedURL] = useState("");

  // Error states
  const [titleError, setTitleError] = useState(false);
  const [spotifyLinkError, setSpotifyLinkError] = useState(false);
  const [dateError, setDateError] = useState(false);
  const [thumbnailError, setThumbnailError] = useState(false);
  const [contentError, setContentError] = useState(false);

  // Loading State
  const [postLoading, setPostLoading] = useState(false);

  // Create a reference to the hidden file input element
  const hiddenFileInput = useRef(null);

  // Theme
  const { darkTheme } = useContext(ThemeContext);
  const themeClassName = darkTheme ? "dark" : "light";

  // Fetch Current Blog Post
  useEffect(() => {
    const collectionRef = collection(db, "blog-post");

    const getDocument = async () => {
      const q = where("id", "==", pathBlogPostId);
      const queryCollectionRef = query(collectionRef, q);
      const collectionSnap = await getDocs(queryCollectionRef);
      const collection = collectionSnap?.docs?.map((doc) => doc.data());
      if (!collection.length) {
        navigate("/error");
      }

      // Pre-populate fields
      const post = collection[0];
      setTitle(post.title);
      setSpotifyLink(post.spotifyLink);
      const categoryIndex =
        categories.findIndex((category) => category === post.category) || 0;
      setChosenCategoryIndex(categoryIndex);
      setDateType(post.dateType);
      if (post.startDate) {
        const newStartDate = formatDate(
          post.startDate?.toDate()?.toLocaleDateString()
        );
        setStartDate(newStartDate);
      }
      if (post.endDate) {
        const newEndDate = formatDate(
          post.endDate?.toDate()?.toLocaleDateString()
        );
        setEndDate(newEndDate);
      }
      setContent(post.content);
      setThumbnailPrepopulatedURL(post.thumbnailImage);
      console.log(collection);
    };

    getDocument();
  }, [navigate, pathBlogPostId]);

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
    if (dateType === 0) {
      if (!!startDate) {
        setDateError(false);
      }
    }
    if (dateType === 1) {
      if (!!startDate && !!endDate) {
        setDateError(false);
      }
    }
  }, [startDate, endDate, dateType]);

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
  const handleExit = () => {
    navigate(`/post/${pathBlogPostId}`);
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

  const handleEditContent = (index, newContent) => {
    const copy = [...content];
    if (index === 0) {
      copy.shift();
      setContent([newContent, ...copy]);
    } else if (index === content.length - 1) {
      copy.pop();
    } else {
      copy.splice(index, 1);
    }
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

    if (dateType === 0) {
      if (!startDate) {
        setDateError(true);
        error = true;
      }
    } else if (dateType === 1) {
      if (!startDate || !endDate) {
        setDateError(true);
        error = true;
      } else if (startDate && endDate) {
        const tempStartDate = new Date(startDate);
        const tempEndDate = new Date(endDate);
        if (tempStartDate > tempEndDate) {
          setDateError(true);
          error = true;
        }
      }
    }

    if (!thumbnailPrepopulatedURL && !thumbnail) {
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
    const blogPostRef = doc(db, "blog-post", `${pathBlogPostId}`);

    const contentToUpload = await Promise.all(
      content.map(async (section) => {
        if (section.type === "text") {
          return section;
        } else if (section.type === "image") {
          if (section.imageUrl) {
            return section;
          }
          const imageFile = section.tempImagePreviewFile;
          const storageImageUrl = await uploadImage(imageFile, pathBlogPostId);

          return {
            ...section,
            tempImagePreviewFile: null,
            imageUrl: storageImageUrl,
          };
        }
      })
    );

    // Upload thumbnail Image
    let thumbnailImage = thumbnailPrepopulatedURL;
    if (thumbnail) {
      thumbnailImage = await uploadImage(thumbnail, pathBlogPostId);
    }

    const collectionObj = {
      title,
      thumbnailImage,
      content: contentToUpload,
      dateType,
      startDate: startDate ? new Date(startDate) : null,
      endDate: endDate ? new Date(endDate) : null,
      category: categories[chosenCategoryIndex],
      spotifyLink,
      id: pathBlogPostId,
    };

    setDoc(blogPostRef, { ...collectionObj }, { merge: true });
    setPostLoading(false);

    // Redirect to the blog page
    navigate(`/post/${pathBlogPostId}`);
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
      <div className={`container post-create ${themeClassName}`}>
        <h1 className="title">Edit this post!</h1>
        <div className="post-inputs">
          <div className="input-container category">
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
          </div>
          <div className="input-container title">
            <input
              className="title-input"
              value={title}
              placeholder="Nice Title Here :)"
              onChange={(e) => setTitle(e.target.value)}
            />
            {titleError && (
              <span className="error">Homie, you have to include a title.</span>
            )}
          </div>
          <div className="input-container spotify">
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
          <div className="input-container date">
            <div className="date-container">
              <div className="date-type-picker">
                <button
                  className={dateType === 0 ? "active" : ""}
                  onClick={() => setDateType(0)}
                >
                  Single
                </button>
                <button
                  className={dateType === 1 ? "active" : ""}
                  onClick={() => setDateType(1)}
                >
                  Range
                </button>
              </div>
              {dateType === 0 && (
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => {
                    console.log(e.target.value);
                    setStartDate(e.target.value);
                  }}
                  data-date=""
                  data-date-format="DD MMMM YYYY"
                />
              )}
              {dateType === 1 && (
                <div className="date-range-container">
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    data-date=""
                    data-date-format="DD MMMM YYYY"
                  />{" "}
                  to{" "}
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    data-date=""
                    data-date-format="DD MMMM YYYY"
                  />
                </div>
              )}
            </div>

            {dateError && (
              <span className="error">You have to include a valid date!</span>
            )}
          </div>

          <div className="content">
            <div className="time-container"></div>

            <div>
              {thumbnailPrepopulatedURL || thumbnail ? (
                <div className="image-container">
                  <img
                    src={
                      thumbnailPrepopulatedURL && !thumbnail
                        ? thumbnailPrepopulatedURL
                        : URL.createObjectURL(thumbnail)
                    }
                    alt="Thumbnail"
                  />
                  <button
                    onClick={() => {
                      setThumbnail(null);
                      setThumbnailPrepopulatedURL("");
                    }}
                  >
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
                <span className="error">You can't forget the thumbnail!</span>
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
                    setValue={setContent}
                    i={i}
                    handleRemoveContent={handleRemoveContent}
                    handleEditContent={handleEditContent}
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
          <button onClick={handleExit}>Exit</button>
          <button onClick={handleFormSubmit} disabled={postLoading}>
            {postLoading ? "Loading" : "Finish Edit"}
          </button>
        </div>
      </div>
    </>
  );
};

export default PostEditPage;
