import React from "react";
import Header from "./Header";
import Footer from "./Footer";

const Layout = ({ children }) => (
  <div className="d-flex flex-column" style={{ minHeight: "100vh" }}>
    <Header />
    <main className="flex-grow-1" style={{ background: "var(--app-bg-color)" }}>
      <div className="container-fluid p-4">{children}</div>
    </main>
    <Footer />
  </div>
);

export default Layout;
