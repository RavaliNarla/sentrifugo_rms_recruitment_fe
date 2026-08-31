// src/components/TokenGuard.jsx
import { Outlet } from "react-router-dom";

const Tokenexp = ({ children }) => {
  return (
    <div>
      {/* Any global wrapper UI, like header, layout, etc. */}
      <Outlet /> {/* <-- This renders the nested routes (Dashboard, etc.) */}
    </div>
  );
};

export default Tokenexp;
