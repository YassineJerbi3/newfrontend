"use client";
import React, { useEffect, useRef, useMemo } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import SidebarItem from "@/components/Sidebar/SidebarItem";
import ClickOutside from "@/components/ClickOutside";
import useLocalStorage from "@/hooks/useLocalStorage";

import {
  FiLayout,
  FiSend,
  FiBox,
  FiClock,
  FiGrid,
  FiBell,
  FiAlertTriangle,
  FiSettings,
  FiUsers,
  FiUserPlus,
  FiFileText,
  FiFileMinus,
  FiTool,
  FiPackage,
  FiList,
  FiTrendingUp,
  FiPlusCircle,
  FiMapPin,
  FiXCircle,
} from "react-icons/fi";
import { BiDesktop } from "react-icons/bi";
import { FaUserGraduate, FaBuilding } from "react-icons/fa";

interface SidebarProps {
  sidebarOpen: boolean;
  setSidebarOpen: (arg: boolean) => void;
}

const menuGroups = [
  {
    name: "MENU",
    menuItems: [
      // Responsable SI uniquement (Tableau de bord avec icône mixte)
      {
        label: "Tableau de bord",
        route: "/",
        icon: <FiLayout size={18} className="text-current" />,
        roles: ["RESPONSABLE SI"],
      },
      // Intervention pour PROFESSOR, ADMINISTRATIF et RESPONSABLE SI (pas pour TECHNICIEN)
      {
        label: "Intervention",
        icon: <FiAlertTriangle size={18} className="text-current" />,
        roles: ["responsable si", "PROFESSOR", "ADMINISTRATIF"],
        children: [
          {
            label: "Incident",
            route: "/intervention/incident",
            icon: <FiXCircle size={18} className="text-current" />,
          },
          {
            label: "Problème applicatif",
            route: "/intervention/applicatif",
            icon: <FiSettings size={18} className="text-current" />,
          },
          {
            label: "Demande de publication",
            route: "/intervention/demande",
            icon: <FiSend size={18} className="text-current" />,
          },
        ],
      },
      // Inventaire pour le Responsable SI uniquement
      {
        label: "Inventaire",
        icon: <FiBox size={18} className="text-current" />,
        roles: ["RESPONSABLE SI"],
        children: [
          {
            label: "Ajouter Equipement",
            route: "/inventaire/equipement",
            icon: <FiPlusCircle size={18} className="text-current" />,
          },
          {
            label: "Ajouter Placement",
            route: "/inventaire/placement",
            icon: <FiMapPin size={18} className="text-current" />,
          },
        ],
      },
      // Notifications séparées
      {
        label: "Notification",
        route: "/notification/not-user",
        icon: <FiBell size={18} className="text-current" />,
        roles: ["PROFESSOR", "ADMINISTRATIF"],
      },
      {
        label: "Notification",
        route: "/notification/not-technicien",
        icon: <FiBell size={18} className="text-current" />,
        roles: ["TECHNICIEN"],
      },
      {
        label: "Notification",
        route: "/notification/not-responsablesi",
        icon: <FiBell size={18} className="text-current" />,
        roles: ["RESPONSABLE SI"],
      },
      // Planification pour Responsable SI et Technicien
      {
        label: "Planification",
        route: "/planification",
        icon: <FiClock size={18} className="text-current" />,
        roles: ["RESPONSABLE SI", "TECHNICIEN"],
      },
      // Suivi (anciennement "Suivre l’avancement de l’intervention")
      {
        label: "Suivi",
        route: "/suivre-intervention",
        icon: <FiTrendingUp size={18} className="text-current" />,
        roles: ["RESPONSABLE SI", "PROFESSOR", "ADMINISTRATIF", "TECHNICIEN"],
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
        roles: ["PROFESSOR", "RESPONSABLE SI"],
      },
      {
        label: "Votre bureau",
        route: "/votre-bureau",
        icon: <BiDesktop size={18} className="text-current" />,
        roles: ["PROFESSOR", "ADMINISTRATIF", "TECHNICIEN"],
      },
      {
        label: "Bureaux",
        route: "/bureaux",
        icon: <FaBuilding size={18} className="text-current" />,
        roles: ["RESPONSABLE SI"],
      },
    ],
  },
  {
    name: "DÉPÔT",
    menuItems: [
      {
        label: "Gestion de stock",
        icon: <FiPackage size={18} className="text-current" />,
        roles: ["RESPONSABLE SI"],
        children: [
          {
            label: "Liste du stock",
            route: "/depot",
            icon: <FiList size={18} className="text-current" />,
          },
          {
            label: "Bon d'entrée",
            route: "/depot/entree",
            icon: <FiFileText size={18} className="text-current" />,
          },
          {
            label: "Bon de sortie",
            route: "/depot/sortie",
            icon: <FiFileMinus size={18} className="text-current" />,
          },
        ],
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
  {
    name: "MAINTENANCE",
    menuItems: [
      {
        label: "Maintenance Préventive",
        route: "/maintenance",
        icon: <FiTool size={18} className="text-current" />,
        roles: ["RESPONSABLE SI"],
      },
    ],
  },
];

const Sidebar = ({ sidebarOpen, setSidebarOpen }: SidebarProps) => {
  const pathname = usePathname();
  const [pageName, setPageName] = useLocalStorage("selectedMenu", "dashboard");

  // Récupérer l'utilisateur depuis localStorage une seule fois
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
    return "PROFESSOR"; // valeur par défaut
  }, []);

  // Filtrer les items du menu selon le rôle de l'utilisateur
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

  // Référence pour la zone scrollable de la sidebar
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Restaurer la position du scroll lors du montage
  useEffect(() => {
    if (scrollContainerRef.current) {
      const storedScroll = localStorage.getItem("sidebarScroll");
      if (storedScroll) {
        scrollContainerRef.current.scrollTop = parseInt(storedScroll, 10);
      }
    }
  }, []);

  // Sauvegarder la position du scroll lors du scroll
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    localStorage.setItem("sidebarScroll", e.currentTarget.scrollTop.toString());
  };

  return (
    <ClickOutside onClick={() => setSidebarOpen(false)}>
      <aside
        className={`fixed left-0 top-0 z-50 flex h-screen w-72 flex-col overflow-y-hidden bg-black duration-300 ease-linear dark:bg-boxdark lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* En-tête de la Sidebar */}
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
        {/* Fin de l'en-tête */}

        {/* Menu de la Sidebar */}
        <div
          ref={scrollContainerRef}
          onScroll={handleScroll}
          className="no-scrollbar flex flex-col overflow-y-auto duration-300 ease-linear"
        >
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
        {/* Fin du Menu de la Sidebar */}
      </aside>
    </ClickOutside>
  );
};

export default Sidebar;
