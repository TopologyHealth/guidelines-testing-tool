import { useState, useEffect } from "react";
import ReactDOM from "react-dom";

function Backdrop(props) {
  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100vh",
        zIndex: 20,
        backgroundColor: "rgba(0, 0, 0, 0.75)",
      }}
      id="backdrop"
    ></div>
  );
}

function ModalOverlay(props) {
  return (
    <div
      style={{
        position: "fixed",
        top: "10vh",
        left: "50%",
        transform: "translate(-50%, 0)",
        width: "75%",
        backgroundColor: "white",
        padding: "1rem",
        borderRadius: "14px",
        boxShadow: "0 2px 8px rgba(0, 0, 0, 0.25)",
        zIndex: 30,
      }}
    >
      <div>{props.children}</div>
    </div>
  );
}

export default function Modal(props) {
  const [isBrowser, setIsBrowser] = useState(false);

  useEffect(() => {
    setIsBrowser(true);
  }, []);

  if (isBrowser) {
    return (
      <>
        {ReactDOM.createPortal(
          <Backdrop />,
          document.getElementById("overlays")
        )}
        {ReactDOM.createPortal(
          <ModalOverlay>{props.children}</ModalOverlay>,
          document.getElementById("overlays")
        )}
      </>
    );
  } else {
    return null;
  }
}
