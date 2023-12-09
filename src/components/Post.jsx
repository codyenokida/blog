import React, { useContext, useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { doc, setDoc } from "firebase/firestore";
import { Spotify } from "react-spotify-embed";

import { ThemeContext } from "../context/ThemeContext";

import { db } from "../utils/firebase";

import "../styles/_post.scss";

const Post = () => {
  // Outlet Context
  const [data, handleRouteToHome] = useOutletContext();

  // Comments
  const [comments, setComments] = useState([]);
  const [commentAuthor, setCommentAuthor] = useState("");
  const [commentContent, setCommentContent] = useState("");

  useEffect(() => {
    setComments(data?.comments);
  }, [data]);

  const postComment = () => {
    if (commentAuthor && commentContent) {
      const collectionRef = doc(db, "blog-post", `${data.id}`);
      const tempComments = comments ? [...comments] : [];
      const datePosted = new Date().toLocaleDateString();

      tempComments.push({
        author: commentAuthor,
        datePosted,
        content: commentContent,
      });
      setDoc(collectionRef, { comments: tempComments }, { merge: true });
      setCommentAuthor("");
      setCommentContent("");
      setComments(tempComments);
    }
  };

  const { darkTheme } = useContext(ThemeContext);

  const themeClassName = darkTheme ? "dark" : "light";

  if (!data) {
    return null;
  }

  return (
    <div className={`post-container ${themeClassName}`}>
      {data?.spotifyLink && (
        <div className="spotify-container">
          <Spotify wide link={data.spotifyLink} />
        </div>
      )}
      <div className="title-container">
        <button className="link" onClick={handleRouteToHome}>
          Back to home
        </button>
        <h2>{data?.title || ""} </h2>
        <p>{data?.datePosted || ""}</p>
      </div>
      <div className="content">
        <div className="blog-content-container">
          {data?.content?.map((section, i) => {
            if (section.type === "text") {
              return (
                <p className="section-text" key={`Section text ${i}`}>
                  {section.text}
                </p>
              );
            } else {
              return (
                <div
                  className="section-image"
                  key={`Section Image Container ${i}`}
                >
                  <img src={section.imageUrl} alt={`Section ${i}`} />
                  {section.imageCaption && <span>{section.imageCaption}</span>}
                </div>
              );
            }
          })}
        </div>
        <div className="blog-comment-container">
          <h1 className="title">Comments 🗣️</h1>
          <div className="comments">
            {comments?.length ? (
              <>
                {comments.map((comment) => {
                  return (
                    <div className="comment-container">
                      <span className="author">{comment.author}</span>
                      <span className="datePosted">{comment.datePosted}</span>
                      <p className="comment-content">{comment.content}</p>
                    </div>
                  );
                })}
              </>
            ) : (
              <p className="zero-comments">
                0 comments
                <br />
                Nothin to see here.
              </p>
            )}
          </div>
          <div className="post-comment">
            <div className="input-container">
              <label>Your name</label>
              <input
                className="comment-author"
                value={commentAuthor}
                onChange={(e) => setCommentAuthor(e.target.value)}
              />
            </div>
            <div className="input-container">
              <label>Content</label>
              <textarea
                className="comment-content"
                value={commentContent}
                onChange={(e) => setCommentContent(e.target.value)}
              />
            </div>

            <button className="comment-post-button" onClick={postComment}>
              Post
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Post;
