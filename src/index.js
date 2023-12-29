import React from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { AnimatePresence } from "framer-motion";

import ErrorPage from "./pages/ErrorPage";
import HomePage from "./pages/HomePage";
// No access for non-admins :)
// import CreatePostPage from "./pages/CreatePostPage";
// import PostEditPage from "./pages/PostEditPage";

import Post from "./components/Post";

import { ThemeContextProvider } from "./context/ThemeContext";

import reportWebVitals from "./reportWebVitals";

import "./index.scss";

const router = createBrowserRouter([
  {
    path: "/",
    element: <HomePage />,
    errorElement: <ErrorPage />,
    children: [
      {
        path: "",
        element: <Post />,
      },
      {
        path: "post/:id",
        element: <Post />,
      },
    ],
  },
]);

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <AnimatePresence mode="wait" initial={false}>
    <ThemeContextProvider>
      <RouterProvider router={router} />
    </ThemeContextProvider>
  </AnimatePresence>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
