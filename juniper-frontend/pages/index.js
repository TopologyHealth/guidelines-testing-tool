import React, { useEffect, useState } from "react";
import Head from 'next/head';
import { useRouter } from "next/router";
import Navbar from "../components/Navbar";
import GuidelineList from "../components/GuidelineList";
import { findTokenCookie, findUserDataCookie } from "./login";
import { validateToken } from "@/api/fastapiApi";


export default function HomePage() {
  const router = useRouter();
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
    try {
      setLoading(true);
      // If token is found and not already logged in
      if (token && !loggedIn) {
        // If token was verified
        if (await validateToken(token)) {
          // Set current user in cookies and set loggedIn state flag
          setCurrentUser(await findUserDataCookie());
          setLoggedIn(true);
          console.log("Logged in");
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
    console.log("Not authenticated");
    router.push(`${process.env.NEXT_PUBLIC_LOGIN_URL}`);
  }

  return (<>
    <Head>
      <title>Guideline Repository</title>
    </Head>
    <div>
      <Navbar user={currentUser} />
      <GuidelineList />
    </div>
  </>
  );
}
