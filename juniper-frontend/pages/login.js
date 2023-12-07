import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Head from 'next/head';
import axios from "axios";
import Navbar from "../components/Navbar";
import { validateAccessCode, validateToken } from "@/api/fastapiApi";

const axiosInstance = axios.create({
  baseURL: "http://localhost:8000",
  withCredentials: true,
});

// Function to try to find id_token in cookies
const findUserDataCookie = () => {
  try {
    //Pulling id_token string from cookies
    let data = document.cookie.match(
      "(^|;)\\s*" + "user_email" + "\\s*=\\s*([^;]+)"
    ).input;
    console.log(data);
    const email = data.substring(
      data.indexOf("user_email=") + 11,
      data.indexOf("user_given_name") - 2
    );
    let given_name = data.substring(data.indexOf("user_given_name=") + 16);
    console.log(given_name);
    if (given_name.includes(';')) given_name = given_name.substring(0, given_name.indexOf(";"));
    console.log(given_name);
    return { email: email, given_name: given_name };
  } catch (error) {
    //console.log(error);
    console.log("No data in cookies");
  }
};
export { findUserDataCookie };

// Function to try to find id_token in cookies
const findTokenCookie = () => {
  try {
    //Pulling id_token string from cookies
    let token = document.cookie.match(
      "(^|;)\\s*" + "id_token" + "\\s*=\\s*([^;]+)"
    ).input;
    // console.log(token);
    return token.substring(
      token.indexOf("id_token=") + 9,
      token.indexOf(";")
    );
  } catch (error) {
    console.log("No token in cookies");
  }
};
export { findTokenCookie };

// Function to send id_token from cookies to API to verify authentication status
const authenticateToken = async (token) => {
  try {
    const isAuthorized = await validateToken(token);
    return isAuthorized;
  } catch (error) {
    console.log("Error during token validation", error);
  }
};

export { authenticateToken };

// Function to retrieve token from API with access code from hosted UI
const authenticateAceessCode = async (code) => {
  try {
    const isAuthorized = await validateAccessCode(code);
    return isAuthorized;
  } catch (error) {
    console.log("Error during code validation", error);
  }
};

export { authenticateAceessCode };

// Page which hosted login UI redirects to with access code in URL
const login = () => {
  const router = useRouter();
  //console.log(code);
  const [authed, setAuthed] = useState(false);
  const [passed, setPassed] = useState(false);
  //const [loggingIn, setLoggingIn] = useState(false);
  const [loggedIn, setLoggedIn] = useState(null);
  const [loading, setLoading] = useState(true);
  //const [logged, setLogged] = useState(null);

  let token = findUserDataCookie();
  if (token) router.push('/logout');

  // Method for initial login
  const loginFunc = async (code) => {
    console.log(code);
    try {
      setLoading(true);
      if (code) {
        if (await validateAccessCode(code)) {
          console.log("code passed");
          const token = await findTokenCookie();
          if (await validateToken(token)) {
            console.log("token passed");
            setLoggedIn(true);
          }
        }
      }
      setLoading(false);
    } catch (error) {
      console.log(error);
      setLoading(false);
    }
  };

  // useEffect hook here to prevent issues with next router and SSR.
  // Next doesn't usually complete the query on the first couple renders
  useEffect(() => {
    const { code } = router.query;
    console.log(code);
    if (code) loginFunc(code);
  }, [router]);

  if (!loggedIn && !loading) {
    router.push(`${process.env.NEXT_PUBLIC_LOGIN_URL}`);
    //router.push("/auth");
    console.log("fail");
  } else if (loggedIn) {
    router.push("/");
    console.log("pass");
  }

  return (
    <>
      <Head>
        <title>Logging in...</title>
      </Head>
      <div>
        <Navbar />
        <h1>Logging in...</h1>
      </div>
    </>
  );
};

export default login;
