import React from "react";
import ReactDOM from "react-dom/client";
import { ThemeContextProvider } from "./context/ThemeContext";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { AnimatePresence } from "framer-motion";

import ErrorPage from "./pages/ErrorPage";
import HomePage from "./pages/HomePage";

import "./index.scss";
import reportWebVitals from "./reportWebVitals";
import Post from "./components/Post";
import CreatePostPage from "./pages/CreatePostPage";

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
  {
    path: "/blog/create",
    element: <CreatePostPage />,
    errorElement: <ErrorPage />,
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
