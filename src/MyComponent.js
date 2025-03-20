import React from "react";
import r2wc from "@r2wc/react-to-web-component";

const MyComponent = ({ text }) => {
  return <div style={{ color: "blue", fontSize: "20px" }}>{text}</div>;
};

// Konwersja do Web Component
const MyWebComponent = r2wc(MyComponent, { props: { text: "string" } });

// Rejestracja w przeglądarce
customElements.define("my-web-component", MyWebComponent);
