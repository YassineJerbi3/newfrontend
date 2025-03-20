import { useState } from "react";
import Link from "next/link";
import ClickOutside from "@/components/ClickOutside";
// Import the icons from react-icons (you can choose any icon library you prefer)
import { FiSettings, FiLogOut, FiUser } from "react-icons/fi";

const DropdownUser = () => {
  const [dropdownOpen, setDropdownOpen] = useState(false);

  return (
    <ClickOutside onClick={() => setDropdownOpen(false)} className="relative">
      <button
        onClick={() => setDropdownOpen(!dropdownOpen)}
        className="flex items-center gap-4"
      >
        {/* Placeholder for user information – this will eventually be populated by your backend */}
        <span className="hidden text-right lg:block">
          <span className="block text-sm font-medium text-black dark:text-white">
            Nom d’utilisateur
          </span>
          <span className="block text-xs">Rôle</span>
        </span>

        {/* Instead of a user photo, we show a default avatar icon */}
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-200">
          <FiUser size={28} className="text-gray-600" />
        </span>
      </button>

      {dropdownOpen && (
        <div className="absolute right-0 mt-4 flex w-62.5 flex-col rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
          <ul className="flex flex-col gap-5 border-b border-stroke px-6 py-7.5 dark:border-strokedark">
            <li>
              <Link
                href="/settings"
                className="flex items-center gap-3.5 text-sm font-medium duration-300 ease-in-out hover:text-primary lg:text-base"
              >
                <FiSettings size={22} />
                Paramètres
              </Link>
            </li>
          </ul>
          <button className="flex items-center gap-3.5 px-6 py-4 text-sm font-medium duration-300 ease-in-out hover:text-primary lg:text-base">
            <FiLogOut size={22} />
            Déconnexion
          </button>
        </div>
      )}
    </ClickOutside>
  );
};

export default DropdownUser;
