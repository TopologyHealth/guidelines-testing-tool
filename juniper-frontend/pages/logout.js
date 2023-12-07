import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Head from 'next/head';
import Navbar from "../components/Navbar";
import { findTokenCookie, findUserDataCookie } from "./login";
import { validateToken } from "@/api/fastapiApi";


export default function LogoutPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [loggedIn, setLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState({ "given_name": "None", "email": "none" });

  // Protecting frontend with conditional rendering, if not authenticated, redirect to hosted login
  // Don't try to log out if not already logged in

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
        }
      }
      setLoading(false);
    } catch (error) {
      console.log(error);
      setLoading(false);
    }
  }

  // Verify login in on first load
  useEffect(() => {
    verifyLogin();
  }, [])


  if (!loggedIn && !loading) {
    //redirect to juniper login portal which will redirect to /login
    //console.log("Not authenticated");
    router.push(`${process.env.NEXT_PUBLIC_LOGIN_URL}`);
    //router.push("/");

  }

  // This is in a useEffect hook to prevent SSR issues while using 'document'
  useEffect(() => {
    try {
      document.cookie.split(";").forEach(function (c) { document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/"); });
    } catch (error) {
      console.log(error);
    }
    //redirect to juniper login portal which will redirect to /login
    router.push(`${process.env.NEXT_PUBLIC_LOGIN_URL}`);
    //router.push("/");
  }, [])

  return (
    <>
      <Head><title>Logging out...</title></Head>
      <div>
        <Navbar />
        <h1>Logout Page</h1>
      </div>
    </>
  );
}
