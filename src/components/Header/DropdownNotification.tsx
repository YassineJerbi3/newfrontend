import { useState } from "react";
import Link from "next/link";
import ClickOutside from "@/components/ClickOutside";
import { FiBell } from "react-icons/fi";

const DropdownNotification = () => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notifying, setNotifying] = useState(true);

  return (
    <ClickOutside onClick={() => setDropdownOpen(false)} className="relative">
      <li>
        <Link
          onClick={() => {
            setNotifying(false);
            setDropdownOpen(!dropdownOpen);
          }}
          href="#"
          className="relative flex h-8.5 w-8.5 items-center justify-center rounded-full border-[0.5px] border-stroke bg-gray hover:text-primary dark:border-strokedark dark:bg-meta-4 dark:text-white"
        >
          <span
            className={`absolute -top-0.5 right-0 z-1 h-2 w-2 rounded-full bg-meta-1 ${
              notifying === false ? "hidden" : "inline"
            }`}
          >
            <span className="absolute -z-1 inline-flex h-full w-full animate-ping rounded-full bg-meta-1 opacity-75"></span>
          </span>

          <FiBell size={18} className="duration-300 ease-in-out" />
        </Link>

        {dropdownOpen && (
          <div className="absolute -right-27 mt-2.5 flex h-90 w-75 flex-col rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark sm:right-0 sm:w-80">
            <div className="px-4.5 py-3">
              <h5 className="text-sm font-medium text-bodydark2">
                Notification
              </h5>
            </div>

            <ul className="flex h-auto flex-col overflow-y-auto">
              <li>
                <Link
                  className="flex flex-col gap-2.5 border-t border-stroke px-4.5 py-3 hover:bg-gray-2 dark:border-strokedark dark:hover:bg-meta-4"
                  href="#"
                >
                  <p className="text-sm">
                    <span className="text-black dark:text-white">
                      Déclaration de maintenance:
                    </span>{" "}
                    Maintenance programmée de l&apos;équipement A pour la
                    faculté.
                  </p>
                  <p className="text-xs">12 May, 2025</p>
                </Link>
              </li>
              <li>
                <Link
                  className="flex flex-col gap-2.5 border-t border-stroke px-4.5 py-3 hover:bg-gray-2 dark:border-strokedark dark:hover:bg-meta-4"
                  href="#"
                >
                  <p className="text-sm">
                    <span className="text-black dark:text-white">
                      Déclaration de maintenance:
                    </span>{" "}
                    Intervention sur l&apos;équipement B, maintenance corrective
                    en cours.
                  </p>
                  <p className="text-xs">24 Feb, 2025</p>
                </Link>
              </li>
              <li>
                <Link
                  className="flex flex-col gap-2.5 border-t border-stroke px-4.5 py-3 hover:bg-gray-2 dark:border-strokedark dark:hover:bg-meta-4"
                  href="#"
                >
                  <p className="text-sm">
                    <span className="text-black dark:text-white">
                      Déclaration de maintenance:
                    </span>{" "}
                    Vérification annuelle de l&apos;équipement C prévue.
                  </p>
                  <p className="text-xs">04 Jan, 2025</p>
                </Link>
              </li>
              <li>
                <Link
                  className="flex flex-col gap-2.5 border-t border-stroke px-4.5 py-3 hover:bg-gray-2 dark:border-strokedark dark:hover:bg-meta-4"
                  href="#"
                >
                  <p className="text-sm">
                    <span className="text-black dark:text-white">
                      Déclaration de maintenance:
                    </span>{" "}
                    Intervention d&apos;urgence sur l&apos;équipement D en
                    attente.
                  </p>
                  <p className="text-xs">01 Dec, 2024</p>
                </Link>
              </li>
            </ul>

            {/* "Voir tout" Button in black */}
            <Link href="/notification/not-responsablesi">
              <button className="border-t border-stroke px-4.5 py-3 text-center text-sm font-medium text-black hover:bg-gray-2 dark:border-strokedark dark:hover:bg-meta-4">
                Voir tout
              </button>
            </Link>
          </div>
        )}
      </li>
    </ClickOutside>
  );
};

export default DropdownNotification;
