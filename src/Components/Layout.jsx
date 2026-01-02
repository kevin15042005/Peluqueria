import React from "react";
import Navbar from "./Navbar";
import Footer from "./Footer";
import { Outlet } from "react-router-dom";
export default function Layout() {
  return (
    <>
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="grow pt-20 flex items-center justify-center ">
          <Outlet />
        </main>
        <Footer />
      </div>
    </>
  );
}
