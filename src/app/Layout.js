import React from "react";
import Header from "./Header";

const Layout = ({ children }) => (
  <div>
    <Header />
    <div className="container-fluid p-4">{children}</div>
  </div>
);

export default Layout;
