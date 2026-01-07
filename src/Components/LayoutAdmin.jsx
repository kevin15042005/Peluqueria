import React from "react";
import Navbar1 from "./Navbar1";
import { Outlet } from "react-router-dom";
import Footer from "./Footer/Footer";

export default function LayoutAdmin() {
  return (
    <>
      <div className="flex  flex-col min-h-screen">
        LayoutAdmin
        <Navbar1 />
        <main className="grow pt-20 flex items-center justify-center">
          <Outlet />
        </main>
        <Footer />
      </div>
    </>
  );
}
