import React from "react";
import Navbar1 from "./NavbarAdmin";
import { Outlet } from "react-router-dom";
import Footer from "./Footer/Footer";

export default function LayoutAdmin() {
  return (
    <>
      <div className="flex  flex-col min-h-screen">
        
        <Navbar1 />
        <main className="grow pt-20 flex items-center justify-center bg-gray-700">
          <Outlet />
        </main>
        <Footer />
      </div>
    </>
  );
}
