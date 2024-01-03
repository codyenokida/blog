import React, { useContext, useEffect, useState } from "react";
import { doc, setDoc, getDocs, collection } from "firebase/firestore";

import { db } from "../utils/firebase";

import { ThemeContext } from "../context/ThemeContext";

import "../styles/_email.scss";
import { Link } from "react-router-dom";

const validateEmail = (email) => {
  return String(email)
    .toLowerCase()
    .match(
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
    );
};

const EmailListPage = () => {
  const { darkTheme } = useContext(ThemeContext);

  // Email List
  const [emailList, setEmailList] = useState();

  // Form States
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  // Error States
  const [nameError, setNameError] = useState(false);
  const [emailError, setEmailError] = useState("");

  // Complete State
  const [completed, setCompleted] = useState(false);

  const themeClassName = darkTheme ? "dark" : "light";

  useEffect(() => {
    if (name) {
      setNameError(false);
    }
  }, [name]);

  useEffect(() => {
    if (validateEmail(email)) {
      setEmailError(false);
    }
  }, [email]);

  useEffect(() => {
    const collectionRef = collection(db, "email-list");

    const getDocument = async () => {
      const collectionSnap = await getDocs(collectionRef);
      const collection = collectionSnap?.docs?.map((doc) => doc.data());
      setEmailList(collection);
    };

    getDocument();
  }, []);

  const handleSubmit = () => {
    let error;

    if (!name) {
      error = true;
      setNameError(true);
    }

    if (!email || !validateEmail(email)) {
      error = true;
      setEmailError("Not a valid Email");
    }

    if (error) return;

    // Check if the email is already on the list
    if (emailList.find((emailInDb) => emailInDb.email === email)) {
      setEmailError("Email already on the mailing list.");
      return;
    }

    const emailListDocRef = doc(db, "email-list", `${email}`);

    const collectionObj = {
      name,
      email,
    };

    setDoc(emailListDocRef, { ...collectionObj }, { merge: true });

    setCompleted(true);
  };

  return (
    <div className={`email-container ${themeClassName}`}>
      <h1>Want to get notified when I post?</h1>
      <div>
        <label>Name</label>
        <input value={name} onChange={(e) => setName(e.target.value)} />
        {nameError && <span className="error">Write down a name!!</span>}
        <label>Email</label>
        <input value={email} onChange={(e) => setEmail(e.target.value)} />
        {!!emailError && <span className="error">{emailError}</span>}
        <button onClick={handleSubmit} disabled={completed}>
          {completed ? "Completed ✅" : "Submit"}
        </button>
      </div>
      <Link to="/">Go back home!!</Link>
    </div>
  );
};

export default EmailListPage;
