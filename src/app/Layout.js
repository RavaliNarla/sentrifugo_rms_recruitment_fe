import React from "react";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import Footer from "./Footer";

const Layout = ({ children }) => (
  <div>
    <Sidebar />
    <div className="page-content">
      <Topbar />
      <div className="page-content-body">{children}</div>
      <Footer />
    </div>
  </div>
);

export default Layout;
