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
  FiLayout,
  FiSend,
  FiBox,
  FiClock,
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
  setSidebarOpen: (open: boolean) => void;
}

const menuGroups = [
  {
    name: "MENU",
    menuItems: [
      {
        label: "Tableau de bord",
        route: "/",
        icon: <FiLayout size={18} className="text-current" />,
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
            icon: <FiXCircle size={18} className="text-current" />,
            roles: ["RESPONSABLE SI", "PROFESSOR", "ADMINISTRATIF"],
          },
          {
            label: "Problème applicatif",
            route: "/intervention/applicatif",
            icon: <FiSettings size={18} className="text-current" />,
            roles: ["RESPONSABLE SI", "PROFESSOR", "ADMINISTRATIF"],
          },
          {
            label: "Demande de publication",
            route: "/intervention/demande",
            icon: <FiSend size={18} className="text-current" />,
            roles: ["RESPONSABLE SI", "PROFESSOR", "ADMINISTRATIF"],
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
            icon: <FiPlusCircle size={18} className="text-current" />,
            roles: ["RESPONSABLE SI"],
          },
          {
            label: "Ajouter Placement",
            route: "/inventaire/placement",
            icon: <FiMapPin size={18} className="text-current" />,
            roles: ["RESPONSABLE SI"],
          },
        ],
      },
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
      {
        label: "Planification",
        route: "/planification",
        icon: <FiClock size={18} className="text-current" />,
        roles: ["RESPONSABLE SI", "TECHNICIEN"],
      },
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
            roles: ["RESPONSABLE SI"],
          },
          {
            label: "Bon d'entrée",
            route: "/depot/entree",
            icon: <FiFileText size={18} className="text-current" />,
            roles: ["RESPONSABLE SI"],
          },
          {
            label: "Bon de sortie",
            route: "/depot/sortie",
            icon: <FiFileMinus size={18} className="text-current" />,
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

const Sidebar: React.FC<SidebarProps> = ({ sidebarOpen, setSidebarOpen }) => {
  const pathname = usePathname();
  const [pageName, setPageName] = useLocalStorage<string>(
    "selectedMenu",
    "dashboard",
  );
  const { user } = useAuth();

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
        className={`fixed left-0 top-0 z-50 flex h-screen w-72 flex-col overflow-y-hidden bg-black duration-300 ease-linear dark:bg-boxdark lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between px-6 py-5 lg:py-6">
          <Link href="/acceuil">
            <Image
              src="/images/logo/logo_escs_top_header.svg"
              alt="Logo"
              width={176}
              height={32}
              priority
            />
          </Link>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="block lg:hidden"
          >
            ×
          </button>
        </div>
        <div
          ref={scrollRef}
          onScroll={onScroll}
          className="no-scrollbar flex-1 overflow-y-auto px-4 py-4"
        >
          {filteredMenuGroups.map((group, gi) => (
            <div key={gi} className="mb-6">
              <h3 className="mb-4 ml-4 text-sm font-semibold text-bodydark2">
                {group.name}
              </h3>
              <ul className="flex flex-col gap-1.5">
                {group.menuItems.map((mi: any, i: number) => (
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
      </aside>
    </ClickOutside>
  );
};

export default Sidebar;
