"use client";
import React, { useMemo } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import SidebarItem from "@/components/Sidebar/SidebarItem";
import ClickOutside from "@/components/ClickOutside";
import useLocalStorage from "@/hooks/useLocalStorage";

import {
  FiHome,
  FiClipboard,
  FiBox,
  FiClock,
  FiGrid,
  FiBell,
  FiAlertTriangle,
  FiSettings,
  FiFileText,
  FiUsers,
  FiUserPlus,
} from "react-icons/fi";
import { FaUserGraduate, FaBuilding } from "react-icons/fa";

interface SidebarProps {
  sidebarOpen: boolean;
  setSidebarOpen: (arg: boolean) => void;
}

// 📌 Menu configuration with allowed roles updated to uppercase
const menuGroups = [
  {
    name: "MENU",
    menuItems: [
      {
        label: "Tableau de bord",
        route: "/",
        icon: <FiHome size={18} className="text-current" />,
        roles: ["RESPONSABLE SI"],
      },
      {
        label: "Intervention",
        icon: <FiAlertTriangle size={18} className="text-current" />,
        roles: ["RESPONSABLE SI", "PROFESSOR", "ADMINISTRATIF"],
        children: [
          {
            label: "Incident",
            route: "/intervention/incident",
            icon: <FiAlertTriangle size={18} className="text-current" />,
          },
          {
            label: "Problème applicatif",
            route: "/intervention/applicatif",
            icon: <FiSettings size={18} className="text-current" />,
          },
        ],
      },
      {
        label: "Inventaire",
        icon: <FiBox size={18} className="text-current" />,
        roles: ["RESPONSABLE SI"],
        children: [
          {
            label: "Ajouter Equipement",
            route: "/inventaire/equipement",
            icon: <FiClipboard size={18} className="text-current" />,
          },
          {
            label: "Ajouter Placement",
            route: "/inventaire/placement",
            icon: <FiGrid size={18} className="text-current" />,
          },
        ],
      },
      {
        label: "Notification",
        route: "/notification",
        icon: <FiBell size={18} className="text-current" />,
        roles: ["RESPONSABLE SI"],
      },
      {
        label: "Planification",
        route: "/planification",
        icon: <FiClock size={18} className="text-current" />,
        roles: ["RESPONSABLE SI"],
      },
      {
        label: "Rapport",
        icon: <FiFileText size={18} className="text-current" />,
        roles: ["RESPONSABLE SI", "TECHNICIEN"],
        children: [
          {
            label: "Rapport d'incident",
            route: "/rapport/incident",
            icon: <FiAlertTriangle size={18} className="text-current" />,
          },
          {
            label: "Rapport sur applicatif",
            route: "/rapport/applicatif",
            icon: <FiSettings size={18} className="text-current" />,
          },
        ],
      },
    ],
  },
  {
    name: "EMPLACEMENT",
    menuItems: [
      {
        label: "Classes",
        route: "/classes",
        icon: <FaUserGraduate size={18} className="text-current" />,
        roles: ["RESPONSABLE SI", "TECHNICIEN", "PROFESSOR", "ADMINISTRATIF"],
      },
      {
        label: "Bureaux",
        route: "/bureaux",
        icon: <FaBuilding size={18} className="text-current" />,
        roles: ["RESPONSABLE SI", "TECHNICIEN", "PROFESSOR", "ADMINISTRATIF"],
      },
    ],
  },
  {
    name: "DÉPÔT",
    menuItems: [
      {
        label: "Gestion de stock",
        route: "/depot",
        icon: <FiBox size={18} className="text-current" />,
        roles: ["RESPONSABLE SI"],
      },
    ],
  },
  {
    name: "GESTION",
    menuItems: [
      {
        label: "Liste des équipements",
        route: "/equipements",
        icon: <FiBox size={18} className="text-current" />,
        roles: ["RESPONSABLE SI"],
      },
      {
        label: "Liste des utilisateurs",
        route: "/utilisateurs",
        icon: <FiUsers size={18} className="text-current" />,
        roles: ["RESPONSABLE SI"],
      },
      {
        label: "Ajouter utilisateur",
        route: "/utilisateurs/ajouter",
        icon: <FiUserPlus size={18} className="text-current" />,
        roles: ["RESPONSABLE SI"],
      },
    ],
  },
];

const Sidebar = ({ sidebarOpen, setSidebarOpen }: SidebarProps) => {
  const pathname = usePathname();
  const [pageName, setPageName] = useLocalStorage("selectedMenu", "dashboard");

  // Retrieve user from localStorage only once
  const userRole = useMemo(() => {
    if (typeof window !== "undefined") {
      const userData = localStorage.getItem("user");
      if (userData) {
        try {
          const user = JSON.parse(userData);
          return user.role;
        } catch (err) {
          console.error("User parse error", err);
        }
      }
    }
    return "PROFESSOR"; // default if not found
  }, []);

  // Memoize the filtered menu groups so they only recalc when userRole changes
  const filteredMenuGroups = useMemo(() => {
    const filterMenuItems = (menuItems: any[]) => {
      return menuItems.filter((item) => {
        if (item.roles && !item.roles.includes(userRole)) {
          return false;
        }
        if (item.children) {
          item.children = filterMenuItems(item.children);
          if (item.children.length === 0) return false;
        }
        return true;
      });
    };

    return menuGroups
      .map((group) => ({
        ...group,
        menuItems: filterMenuItems(group.menuItems),
      }))
      .filter((group) => group.menuItems.length > 0);
  }, [userRole]);

  return (
    <ClickOutside onClick={() => setSidebarOpen(false)}>
      <aside
        className={`fixed left-0 top-0 z-50 flex h-screen w-72 flex-col overflow-y-hidden bg-black duration-300 ease-linear dark:bg-boxdark lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Header of the Sidebar */}
        <div className="flex items-center justify-between gap-2 px-6 py-5.5 lg:py-6.5">
          <Link href="/">
            <Image
              width={176}
              height={32}
              src={"/images/logo/logo_escs_top_header.svg"}
              alt="Logo"
              priority
            />
          </Link>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            aria-controls="sidebar"
            className="block lg:hidden"
          >
            <svg
              className="fill-current"
              width="20"
              height="18"
              viewBox="0 0 20 18"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M19 8.175H2.98748L9.36248 1.6875C9.69998 1.35 9.69998 0.825 9.36248 0.4875C9.02498 0.15 8.49998 0.15 8.16248 0.4875L0.399976 8.3625C0.0624756 8.7 0.0624756 9.225 0.399976 9.5625L8.16248 17.4375C8.31248 17.5875 8.53748 17.7 8.76248 17.7C8.98748 17.7 9.17498 17.625 9.36248 17.475C9.69998 17.1375 9.69998 16.6125 9.36248 16.275L3.02498 9.8625H19C19.45 9.8625 19.825 9.4875 19.825 9.0375C19.825 8.55 19.45 8.175 19 8.175Z"
                fill="currentColor"
              />
            </svg>
          </button>
        </div>
        {/* End of Sidebar Header */}

        {/* Sidebar Menu */}
        <div className="no-scrollbar flex flex-col overflow-y-auto duration-300 ease-linear">
          <nav className="mt-5 px-4 py-4 lg:mt-9 lg:px-6">
            {filteredMenuGroups.map((group, groupIndex) => (
              <div key={groupIndex}>
                <h3 className="mb-4 ml-4 text-sm font-semibold text-bodydark2">
                  {group.name}
                </h3>
                <ul className="mb-6 flex flex-col gap-1.5">
                  {group.menuItems.map((menuItem, menuIndex) => (
                    <SidebarItem
                      key={menuIndex}
                      item={menuItem}
                      pageName={pageName}
                      setPageName={setPageName}
                    />
                  ))}
                </ul>
              </div>
            ))}
          </nav>
        </div>
        {/* End of Sidebar Menu */}
      </aside>
    </ClickOutside>
  );
};

export default Sidebar;
