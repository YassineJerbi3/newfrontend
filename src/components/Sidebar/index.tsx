// src/components/Sidebar/index.tsx
"use client";

import React, { useEffect, useRef, useMemo } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import SidebarItem from "@/components/Sidebar/SidebarItem";
import ClickOutside from "@/components/ClickOutside";
import useLocalStorage from "@/hooks/useLocalStorage";
import { useAuth } from "@/hooks/AuthProvider";
import {
  FaTachometerAlt,
  FaTools,
  FaBug,
  FaCogs,
  FaPaperPlane,
  FaWarehouse,
  FaPlus,
  FaMapMarkerAlt,
  FaBell,
  FaCalendarAlt,
  FaChartLine,
  FaBoxes,
  FaDesktop,
  FaUsers,
  FaUserPlus,
  FaUniversity,
  FaListAlt,
  FaFileAlt,
} from "react-icons/fa";

import { FaBuilding } from "react-icons/fa";

interface SidebarProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}
// Définition de l’interface MenuItem
interface MenuItem {
  label: string;
  route?: string;
  icon: JSX.Element;
  roles: string[];
  children?: MenuItem[];
}

const menuGroups: { name: string; menuItems: MenuItem[] }[] = [
  {
    name: "MENU",
    menuItems: [
      {
        label: "Tableau de bord",
        route: "/",
        icon: <FaTachometerAlt size={18} />,
        roles: ["RESPONSABLE SI"],
      },
      {
        label: "Intervention",
        icon: <FaTools size={18} />,
        roles: ["RESPONSABLE SI", "PROFESSOR", "ADMINISTRATIF"],
        children: [
          {
            label: "Incident",
            route: "/intervention/incident",
            icon: <FaBug size={18} />,
            roles: ["RESPONSABLE SI", "PROFESSOR", "ADMINISTRATIF"],
          },
          {
            label: "Problème applicatif",
            route: "/intervention/applicatif",
            icon: <FaCogs size={18} />,
            roles: ["RESPONSABLE SI", "PROFESSOR", "ADMINISTRATIF"],
          },
          {
            label: "Demande de publication",
            route: "/intervention/demande",
            icon: <FaPaperPlane size={18} />,
            roles: ["RESPONSABLE SI", "PROFESSOR", "ADMINISTRATIF"],
          },
        ],
      },
      {
        label: "Inventaire",
        icon: <FaWarehouse size={18} />,
        roles: ["RESPONSABLE SI"],
        children: [
          {
            label: "Ajouter Équipement",
            route: "/inventaire/equipement",
            icon: <FaPlus size={18} />,
            roles: ["RESPONSABLE SI"],
          },
          {
            label: "Ajouter Emplacement",
            route: "/inventaire/placement",
            icon: <FaMapMarkerAlt size={18} />,
            roles: ["RESPONSABLE SI"],
          },
        ],
      },
      {
        label: "Notification",
        route: "/notification/not-user",
        icon: <FaBell size={18} />,
        roles: ["PROFESSOR", "ADMINISTRATIF"],
      },
      {
        label: "Notification",
        route: "/notification/not-technicien",
        icon: <FaBell size={18} />,
        roles: ["TECHNICIEN"],
      },
      {
        label: "Notification",
        route: "/notification/not-responsablesi",
        icon: <FaBell size={18} />,
        roles: ["RESPONSABLE SI"],
      },
      {
        label: "Planification",
        route: "/planification",
        icon: <FaCalendarAlt size={18} />,
        roles: ["RESPONSABLE SI", "TECHNICIEN"],
      },
      {
        label: "Suivi",
        route: "/suivre-intervention",
        icon: <FaChartLine size={18} />,
        roles: ["RESPONSABLE SI", "PROFESSOR", "ADMINISTRATIF", "TECHNICIEN"],
      },
    ],
  },
  {
    name: "EMPLACEMENT",
    menuItems: [
      {
        label: "Classes",
        route: "/classes-edit",
        icon: <FaUniversity size={18} />,
        roles: ["RESPONSABLE SI"],
      },
      {
        label: "Classes",
        route: "/classes",
        icon: <FaUniversity size={18} />,
        roles: ["PROFESSOR"],
      },
      {
        label: "Votre bureau",
        route: "/votre-bureau",
        icon: <FaDesktop size={18} />,
        roles: ["PROFESSOR", "ADMINISTRATIF", "TECHNICIEN"],
      },
      {
        label: "Bureaux",
        route: "/bureaux",
        icon: <FaBuilding size={18} />,
        roles: ["RESPONSABLE SI"],
      },
    ],
  },
  {
    name: "DÉPÔT",
    menuItems: [
      {
        label: "Gestion de stock",
        icon: <FaBoxes size={18} />,
        roles: ["RESPONSABLE SI"],
        children: [
          {
            label: "Liste du stock",
            route: "/depot",
            icon: <FaListAlt size={18} />,
            roles: ["RESPONSABLE SI"],
          },
          {
            label: "Bon d'entrée",
            route: "/depot/entree",
            icon: <FaFileAlt size={18} />,
            roles: ["RESPONSABLE SI"],
          },
          {
            label: "Bon de sortie",
            route: "/depot/sortie",
            icon: <FaFileAlt size={18} />,
            roles: ["RESPONSABLE SI"],
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
        icon: <FaBoxes size={18} />,
        roles: ["RESPONSABLE SI"],
      },
      {
        label: "Liste des utilisateurs",
        route: "/utilisateurs",
        icon: <FaUsers size={18} />,
        roles: ["RESPONSABLE SI"],
      },
      {
        label: "Ajouter utilisateur",
        route: "/utilisateurs/ajouter",
        icon: <FaUserPlus size={18} />,
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
        icon: <FaTools size={18} />,
        roles: ["RESPONSABLE SI"],
      },
    ],
  },
];

const Sidebar: React.FC<SidebarProps> = ({ sidebarOpen, setSidebarOpen }) => {
  const pathname = usePathname();
  const [pageName, setPageName] = useLocalStorage<string>(
    "selectedMenu",
    "dashboard",
  );
  const { user } = useAuth();
  useEffect(() => {
    const style = document.createElement("style");
    style.innerHTML = `
    @keyframes hueShift {
      0%, 100% { filter: hue-rotate(0deg); }
      50%      { filter: hue-rotate(20deg); }
    }
  `;
    document.head.appendChild(style);
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  const userRole = useMemo(() => {
    if (!user?.roles) return null;
    return Array.isArray(user.roles)
      ? user.roles[0].toString().toUpperCase()
      : user.roles.toString().toUpperCase();
  }, [user]);

  const filteredMenuGroups = useMemo(() => {
    if (!userRole) return [];
    const filterItems = (items: any[]): any[] =>
      items
        .map((item) => ({ ...item }))
        .filter((item) => {
          const allowed = item.roles
            .map((r: string) => r.toUpperCase())
            .includes(userRole);
          if (!allowed) return false;
          if (item.children) {
            item.children = filterItems(item.children);
            return item.children.length > 0;
          }
          return true;
        });

    return menuGroups
      .map((g) => ({ ...g, menuItems: filterItems(g.menuItems) }))
      .filter((g) => g.menuItems.length > 0);
  }, [userRole]);

  const scrollRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const stored =
      typeof window !== "undefined"
        ? window.localStorage.getItem("sidebarScroll")
        : null;
    if (scrollRef.current && stored)
      scrollRef.current.scrollTop = parseInt(stored, 10);
  }, []);
  const onScroll = (e: React.UIEvent<HTMLDivElement>) => {
    window.localStorage.setItem(
      "sidebarScroll",
      String(e.currentTarget.scrollTop),
    );
  };

  return (
    <ClickOutside onClick={() => setSidebarOpen(false)}>
      <aside
        className={`
        fixed left-0 top-0 z-50 flex h-screen w-72 transform
        flex-col overflow-y-hidden bg-gradient-to-b from-[#01050a]
        via-[#041021] to-[#082043]
        text-gray-100 shadow-[0_4px_30px_rgba(0,0,0,0.7)] transition-transform duration-300
        ease-in-out
        lg:translate-x-0
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
      `}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-800 px-6 py-5">
          <Link href="/acceuil">
            <div
              style={{
                display: "inline-block",
                animation: "hueShift 6s ease-in-out infinite",
              }}
            >
              <Image
                src="/images/logo/logo_escs_top_header.svg"
                alt="Logo"
                width={176}
                height={32}
                priority
                className="brightness-90 filter"
              />
            </div>
          </Link>

          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="block text-3xl leading-none transition-colors hover:text-[#64b5f6] lg:hidden"
            aria-label="Close sidebar"
          >
            ×
          </button>
        </div>

        {/* Menu */}
        <div
          ref={scrollRef}
          onScroll={onScroll}
          className="no-scrollbar flex-1 overflow-y-auto px-4 py-6"
        >
          {filteredMenuGroups.map((group, gi) => (
            <div key={gi} className="mb-6 last:mb-8">
              <h3
                className="
        mb-3 flex items-center
        border-l-2 border-blue-500 pl-2 text-xs
        font-semibold
        uppercase tracking-wider
        text-gray-400
      "
              >
                {group.name}
              </h3>
              <ul className="space-y-1">
                {group.menuItems.map((mi, i) => (
                  <SidebarItem
                    key={i}
                    item={mi}
                    pageName={pageName}
                    setPageName={setPageName}
                  />
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Gradient overlay at bottom for depth */}
        <div className="pointer-events-none absolute bottom-0 left-0 h-16 w-full bg-gradient-to-t from-[#082043] to-transparent" />
      </aside>
    </ClickOutside>
  );
};

export default Sidebar;
