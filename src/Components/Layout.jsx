import React from "react";
import Navbar from "./Navbar";
import Footer from "./Footer/Footer";
import { Outlet } from "react-router-dom";
export default function Layout() {
  return (
    <>
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="grow pt-20 ">
          <Outlet />
        </main>
        <Footer />
      </div>
    </>
  );
}
