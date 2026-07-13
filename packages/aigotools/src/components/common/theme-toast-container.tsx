"use client";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function ThemeToastContainer() {
  return (
    <ToastContainer
      hideProgressBar
      autoClose={2500}
      bodyClassName="!m-0 !items-start !p-0 !text-sm !text-slate-950"
      closeButton={false}
      limit={2}
      pauseOnFocusLoss={false}
      position="top-center"
      theme="light"
      toastClassName="!min-h-0 !w-[min(360px,calc(100vw-32px))] !rounded-xl !bg-white !px-4 !py-3 !text-slate-950 !shadow-[0_18px_45px_rgba(15,23,42,0.14)] !ring-1 !ring-slate-200/80"
    />
  );
}
