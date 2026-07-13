"use client";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function ThemeToastContainer() {
  return (
    <ToastContainer
      autoClose={2500}
      bodyClassName="!text-sm !font-medium !text-slate-950"
      closeButton={false}
      hideProgressBar
      limit={2}
      pauseOnFocusLoss={false}
      position="top-center"
      theme="light"
      toastClassName="!rounded-lg !bg-white !text-slate-950 !shadow-xl !ring-1 !ring-slate-200"
    />
  );
}
