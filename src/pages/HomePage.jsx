import React, { useContext, useEffect, useMemo, useState } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { collection, getDocs, where, query, orderBy } from "firebase/firestore";

import { db } from "../utils/firebase";
import { ThemeContext } from "../context/ThemeContext";
import useCheckMobileScreen from "../hooks/useCheckMobileScreen";

import SplitText from "../components/SplitText";
import Footer from "../components/Footer";
import Item from "../components/Item";

import logo from "../images/logo512.png";
import { ReactComponent as SortIcon } from "../images/sort-icon.svg";

import "../styles/_home.scss";
import ItemSkeleton from "../components/ItemSkeleton";

const HomePage = () => {
  // Mobile
  const isMobile = useCheckMobileScreen();

  // Current Route Location
  const navigate = useNavigate();
  const location = useLocation();
  const pathname = location?.pathname?.split("/") ?? "";
  const pathBlogPostId = pathname[pathname.length - 1];

  // Category State
  const categories = useMemo(
    () => ["Show All", "Thoughts", "Reviews", "Travel", "Misc."],
    []
  );

  const [activeCategoryIndex, setActiveCategoryIndex] = useState(0);

  // Posts
  const [postOrdering, setPostOrdering] = useState("desc");
  const [postsLoading, setPostsLoading] = useState(true);
  const [posts, setPosts] = useState([]);
  const [activePostIndex, setActivePostIndex] = useState(0);
  const [activePostId, setActivePostId] = useState("");

  const postLoadingHelper = (loading) => {
    setTimeout(() => {
      setPostsLoading(loading);
    }, 750);
  };

  // Mobile only state
  const [showPost, setShowPost] = useState(null);

  useEffect(() => {
    document.body.scrollTop = document.documentElement.scrollTop = 0;
  }, [showPost]);

  // Theme
  const { darkTheme, toggleTheme } = useContext(ThemeContext);
  const themeClassName = darkTheme ? "dark" : "light";

  // Fetch All Blog Posts
  useEffect(() => {
    const collectionRef = collection(db, "blog-post");

    const getDocument = async () => {
      setPostsLoading(true);
      let q;
      if (activeCategoryIndex) {
        q = where("category", "==", categories[activeCategoryIndex]);
      }
      const queryCollectionRef = query(
        collectionRef,
        q,
        orderBy("datePosted", postOrdering)
      );
      const collectionSnap = await getDocs(queryCollectionRef);
      const collection = collectionSnap?.docs?.map((doc) => doc.data());

      // If there is no data, set URL to root.
      if (!collection.length) {
        navigate("/");
        setActivePostIndex(null);
        setActivePostId("");
        setShowPost(null);
        setPosts([]);
        postLoadingHelper(false);
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
          setShowPost(pathBlogPostId);
        } else {
          const firstPostId = collection?.[0]?.id ?? "";
          setActivePostId(firstPostId);
          setActivePostIndex(0);
          navigate(`/post/${firstPostId}`);
        }
      } else {
        const firstPostId = collection?.[0]?.id ?? "";
        setActivePostId(firstPostId);
        setActivePostIndex(0);
        navigate(`/post/${firstPostId}`);
      }
      postLoadingHelper(false);
    };

    getDocument();
  }, [
    postOrdering,
    categories,
    activeCategoryIndex,
    navigate,
    pathBlogPostId,
    setPostsLoading,
  ]);

  // Check if the location changed
  useEffect(() => {
    if (location) {
      if (location.pathname === "/") {
        if (!posts) {
          setActivePostId("");
          setActivePostIndex(null);
          setShowPost(null);
        } else {
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

  // Handler for sort button click
  const handleSortButtonClick = () => {
    if (postOrdering === "asc") {
      setPostOrdering("desc");
    } else {
      setPostOrdering("asc");
    }
  };

  return showPost !== null && isMobile ? (
    <div className="blog-content mobile">
      <Outlet context={[posts[activePostIndex], handleRouteToHome]} />
    </div>
  ) : (
    <>
      <div className={`home container ${themeClassName}`}>
        <div className="title-wrapper">
          <div className="with-image-container">
            <img src={logo} alt="logo of kota enokida" />
            <h1>
              <SplitText delay={20}>Blogs by Kota Cody Enokida</SplitText>
            </h1>
          </div>
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
            <div className="sort-container">
              <button onClick={handleSortButtonClick} className={postOrdering}>
                Sort by Date
                <SortIcon />
              </button>
            </div>
            <div className="posts">
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
          </div>
          <div className="border" />
          <div className="blog-content desktop">
            <Outlet context={[posts[activePostIndex], handleRouteToHome]} />
          </div>

          {/* Mobile Only Divs */}
          <div className="navigation mobile">
            <div className="sort-container">
              <button onClick={handleSortButtonClick} className={postOrdering}>
                Sort by Date
                <SortIcon />
              </button>
            </div>
            {postsLoading ? (
              <>
                {["load1", "load2", "load3", "load4", "load5"].map((id, i) => (
                  <ItemSkeleton id={id} index={i} />
                ))}
              </>
            ) : (
              <>
                {posts.length
                  ? posts.map((post, i) => (
                      <Item
                        {...post}
                        index={i}
                        onClick={() => handleLinkClick(i, post.id)}
                        key={post.title}
                      ></Item>
                    ))
                  : "No posts :("}
              </>
            )}
          </div>
        </div>

        <Footer toggleTheme={toggleTheme} />
      </div>
    </>
  );
};

export default HomePage;
