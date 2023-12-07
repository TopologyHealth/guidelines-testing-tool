import React, { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import { validateAccessCode, validateToken } from "@/api/fastapiApi";

const auth = () => {
  const [value, setValue] = useState("");
  const [authed, setAuthed] = useState(false);
  const [passed, setPassed] = useState(false);
  const [code, setCode] = useState(null);

  useEffect(() => {
    const authenticateAccessCode = async () => {
      try {
        if (!code) {
          console.log("no code");
          return;
        }

        const isAuthorized = await validateAccessCode(code);
        setAuthed(isAuthorized);
      } catch (error) {
        console.log("Error during access code validation", error);
      }
    };

    authenticateAccessCode();
  }, [code]);

  const handleTryAuth = () => {
    if(validateToken())setPassed(true);
    else{
      console.log("failed token validation");
      setPassed(false);
    }
  };

  const handleAuth = (event) => {
    console.log(value);
    setCode(value);
  };

  const handleChange = (event) => {
    setValue(event.target.value);
  };

  return (
    <div>
      <Navbar />
      <h1>Auth Testing Page</h1>
      <label>access token: </label>
      <input type="text" id="access_token" onChange={handleChange}></input>
      <button onClick={handleAuth}>Authenticate</button>

      <button onClick={handleTryAuth}>Test</button>

      {authed && <h3>Authed!</h3>}
      {!authed && <h3>Not Authed!</h3>}

      {passed && <h3>Passed!</h3>}
      {!passed && <h3>Not Passed!</h3>}
    </div>
  );
};

export default auth;
