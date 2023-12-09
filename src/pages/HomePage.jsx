import React, { useContext, useEffect, useState } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { collection, getDocs, where, query } from "firebase/firestore";

import { db } from "../utils/firebase";
import transition from "../transitions/transitions";
import { ThemeContext } from "../context/ThemeContext";

import SplitText from "../components/SplitText";
import Item from "../components/Item";

import { ReactComponent as Light } from "../images/sideBar/light.svg";

import "../styles/_home.scss";

const HomePage = () => {
  // Current Route Location
  const navigate = useNavigate();
  const location = useLocation();
  const pathname = location?.pathname?.split("/") ?? "";
  const pathBlogPostId = pathname[pathname.length - 1];

  // Category State
  const categories = ["Show All", "Takes", "Travel", "Movies", "Tech", "Misc."];
  const [activeCategoryIndex, setActiveCategoryIndex] = useState(0);

  // Posts
  const [posts, setPosts] = useState([]);
  const [activePostIndex, setActivePostIndex] = useState(0);
  const [activePostId, setActivePostId] = useState("");

  // Mobile only state
  const [showPost, setShowPost] = useState(null);

  // Theme
  const { darkTheme, toggleTheme } = useContext(ThemeContext);
  const themeClassName = darkTheme ? "dark" : "light";

  // Fetch All Blog Posts
  useEffect(() => {
    const collectionRef = collection(db, "blog-post");

    const getDocument = async () => {
      let q;
      if (activeCategoryIndex) {
        q = where("category", "==", categories[activeCategoryIndex]);
      }
      const queryCollectionRef = query(collectionRef, q);
      const collectionSnap = await getDocs(queryCollectionRef);
      const collection = collectionSnap?.docs?.map((doc) => doc.data());

      // If there is no data, set URL to root.
      if (!collection.length) {
        navigate("/");
        setActivePostIndex(null);
        setActivePostId("");
        setShowPost(null);
        setPosts([]);
        return;
      }

      // If there is data, set other logic
      setPosts(collection);
      if (pathBlogPostId) {
        const i = collection.findIndex((doc) => doc.id === pathBlogPostId);
        // If blogPostId exists in the collection, set the activeId and index properly
        if (pathBlogPostId && i !== -1) {
          setActivePostId(pathBlogPostId);
          setActivePostIndex(i);
        } else {
          const firstPostId = collection?.[0]?.id ?? "";
          setActivePostId(firstPostId);
          setActivePostIndex(0);
        }
      } else {
        const firstPostId = collection?.[0]?.id ?? "";
        setActivePostId(firstPostId);
        setActivePostIndex(0);
      }
    };

    getDocument();
  }, [categories, activeCategoryIndex, navigate, pathBlogPostId]);

  // Check if the location changed
  useEffect(() => {
    if (location) {
      if (location.pathname === "/") {
        if (!posts) {
          setActivePostIndex(null);
          setShowPost(null);
        }
      }
    }
  }, [location, posts, setActivePostIndex, setShowPost]);

  // Handler for routing back to home page without reloading page
  const handleRouteToHome = () => {
    navigate("/");
    setActivePostIndex(null);
    setActivePostId("");
    setShowPost(null);
  };

  // Handler for routing to most active index
  const handleLinkClick = (index, postId) => {
    setActivePostIndex(index);
    setShowPost(index);
    setActivePostId(postId);
  };

  return (
    <div className={`home container ${themeClassName}`}>
      <div className="title-wrapper">
        <h1>
          <SplitText delay={20}>Blogs by Kota Cody Enokida</SplitText>
        </h1>
        <p>
          <SplitText delay={60}>
            Unfiltered thoughts and experiences of my day to
            day.「榎田岬田の人生観」
          </SplitText>
        </p>
      </div>
      <div className="category-container">
        {categories.map((category, i) => (
          <button
            key={category}
            className={`category-pill ${
              activeCategoryIndex === i ? "active" : ""
            }`}
            style={{ animationDelay: 0.25 + i / 20 + "s" }}
            onClick={() => setActiveCategoryIndex(i)}
          >
            {category}
          </button>
        ))}
      </div>
      <div className="home-content-container">
        <div className="navigation desktop">
          {posts.map((post, i) => (
            <Link
              to={`/post/${post.id}`}
              className={`${post.id === activePostId ? "active" : ""}`}
              onClick={() => handleLinkClick(i, post.id)}
              key={post.title}
            >
              {post.title}
            </Link>
          ))}
        </div>
        <div className="border" />
        <div className="blog-content desktop">
          <Outlet context={[posts[activePostIndex], handleRouteToHome]} />
        </div>

        {/* Mobile Only Divs */}
        <div className="navigation mobile">
          {posts.map((post, i) => (
            <Item
              {...post}
              index={i}
              onClick={() => handleLinkClick(i, post.id)}
              key={post.title}
            ></Item>
          ))}
        </div>
        {showPost !== null && (
          <div className="blog-content mobile">
            <Outlet context={[posts[activePostIndex], handleRouteToHome]} />
          </div>
        )}
      </div>
      <div className="footer">
        <p>
          Made by Kota Cody Enokida using{" "}
          <a
            href="https://react.dev/"
            target="_blank"
            rel="noopener noreferrer"
          >
            React 👨‍💻
          </a>
          &nbsp;&&nbsp;
          <a
            href="https://firebase.google.com/"
            target="_blank"
            rel="noopener noreferrer"
          >
            Firebase 🔥
          </a>
        </p>
        <button className="lights" onClick={toggleTheme}>
          <Light />
        </button>
      </div>
    </div>
  );
};

export default transition(HomePage);
