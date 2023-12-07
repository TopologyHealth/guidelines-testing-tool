import { Portal } from "@material-ui/core";
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import axios from "axios";
import Head from 'next/head';
import Navbar from "../../components/Navbar";
import TestMenu from "../../components/Test/Menu/TestMenu";
import PatientModal from "../../components/Test/UI/PatientModal";
import { findTokenCookie, findUserDataCookie } from "../login";
import { getGuidelineBundle } from "@/api/fastapiApi";
import { validateToken } from "@/api/fastapiApi";


export default function Test(props) {
  const router = useRouter();
  const { item_key } = router.query;
  const [item, setItem] = useState(null);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [patient, setPatient] = useState({
    default: true,
  });
  const [loading, setLoading] = useState(true);
  const [loggedIn, setLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState({
    given_name: "None",
    email: "none",
  });

  // Protecting frontend with conditional rendering, if not authenticated, redirect to hosted login

  const verifyLogin = async () => {
    // Find existing token in cookies
    const token = await findTokenCookie();
    //console.log(token);
    try {
      setLoading(true);
      // If token is found and not already logged in
      if (token && !loggedIn) {
        // If token was verified
        if (await validateToken(token)) {
          // Set current user in cookies and set loggedIn state flag
          setCurrentUser(await findUserDataCookie());
          setLoggedIn(true);
        }
      }
      setLoading(false);
    } catch (error) {
      console.log(error);
      setLoading(false);
    }
  };

  // Verify login in on first load
  useEffect(() => {
    verifyLogin();
  }, []);

  if (!loggedIn && !loading) {
    //redirect to juniper login portal which will redirect to /login
    //console.log("Not authenticated");
    router.push(`${process.env.NEXT_PUBLIC_LOGIN_URL}`);
  }

  // Fetch Guidelines
  useEffect(() => {
    async function fetchGuidelineBundle() {
      try {
        if (item_key) {
          const data = await getGuidelineBundle(item_key);
          setItem(data);
        }
      } catch (error) {
        setError(error);
      }
    }
    fetchGuidelineBundle();
  }, [item_key]);

  // Event handler for showing patient selection modal
  function showModalHandler() {
    setShowModal(true);
  }

  // Event handler for closing patient selection modal
  function hideModalHandler(patient) {
    setPatient(patient);
    setShowModal(false);
  }

  // Event handler for showing test results
  function showResultsHandler() {
    setShowResults(true);
  }

  // Event handler for exiting test results
  function hideResultsHandler() {
    setShowResults(false);
  }

  // Error and loading handling
  if (error) {
    return <div>Error: {error.message}</div>;
  }
  if (!item) {
    return <div>Loading...</div>;
  }
  return (
    <>
      <Head>
        <title>{item.entry[0].resource.title}</title>
      </Head>
      <div>
        <Portal></Portal>
        <div id="overlays"></div>
        {showModal && (
          <PatientModal
            onClose={hideModalHandler}
            guidelineTitle={item.entry[0].resource.title}
            patient={patient}
          />
        )}
        <div>
          <Navbar user={currentUser} />
          {!showResults ? (
            <TestMenu
              type="menu"
              guidelineTitle={item.entry[0].resource.title}
              onOpen={showModalHandler}
              showResults={showResultsHandler}
              patient={patient}
            />
          ) : (
            <TestMenu
              type="results"
              hideResults={hideResultsHandler}
              patient={patient}
            />
          )}
        </div>
      </div>
    </>
  );
}
