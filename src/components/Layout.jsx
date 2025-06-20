import React from "react";
import Header from "./Header/Header";
import Footer from "./Footer/Footer";
import { Outlet } from "react-router-dom";

export default function Layout() {
  return (
    <div className="site-wrapper">
      <Header />
      <main>
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
