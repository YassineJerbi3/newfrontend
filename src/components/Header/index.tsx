import Link from "next/link";
import DropdownUser from "./DropdownUser";
import Image from "next/image";
import DropdownNotification from "./DropdownNotification";
import { useEffect } from "react";

const Header = (props: {
  sidebarOpen: boolean | string | undefined;
  setSidebarOpen: (open: boolean) => void;
}) => {
  useEffect(() => {
    const style = document.createElement("style");
    style.innerHTML = `
      header + * { margin-top: 30px; }
    `;
    document.head.appendChild(style);
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  return (
    <header
      className="
        fixed left-0 right-0 top-0 z-50 flex h-[80px] items-center
        overflow-visible bg-white/90 text-gray-900 shadow-md
        backdrop-blur-md lg:left-72 lg:right-0
      "
    >
      <div className="flex w-full items-center px-6">
        {/* ── MOBILE: toggle + logo */}
        <div className="flex items-center gap-4 lg:hidden">
          <button
            aria-controls="sidebar"
            onClick={(e) => {
              e.stopPropagation();
              props.setSidebarOpen(!props.sidebarOpen);
            }}
            className="
              flex h-10 w-10 items-center justify-center
              rounded-lg bg-[#010810] bg-opacity-20 transition-colors hover:bg-opacity-30
            "
          >
            <span
              className={`block h-0.5 w-5 bg-white transition-transform ${
                props.sidebarOpen ? "rotate-45" : ""
              }`}
            />
            <span
              className={`absolute block h-0.5 w-5 bg-white transition-opacity ${
                props.sidebarOpen ? "opacity-0" : ""
              }`}
            />
            <span
              className={`block h-0.5 w-5 bg-white transition-transform ${
                props.sidebarOpen ? "-rotate-45" : ""
              }`}
            />
          </button>
          <Link href="/" className="flex-shrink-0">
            <Image
              width={32}
              height={32}
              src="/images/logo/logo-icon.svg"
              alt="Logo"
              className="brightness-90 filter"
            />
          </Link>
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* ── Notifications & Profile */}
        <div className="flex items-center gap-5">
          <button
            className="
              rounded-full bg-[#010810] bg-opacity-20 p-2 transition-colors
              hover:bg-opacity-30
            "
            aria-label="Notifications"
          >
            <DropdownNotification />
          </button>
          <div className="h-6 w-px bg-[#0d2435]" />
          <button
            className="
              rounded-full bg-[#010810] bg-opacity-20 p-2 transition-colors
              hover:bg-opacity-30
            "
            aria-label="Profil"
          >
            <DropdownUser />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
