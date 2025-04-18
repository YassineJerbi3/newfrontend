"use client";
import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import useLocalStorage from "@/hooks/useLocalStorage";

const SidebarItem = ({ item, pageName, setPageName }: any) => {
  const pathname = usePathname();

  // Calculate initial open state based on current pathname or pageName
  const initialOpen =
    item.children &&
    (pageName === item.label.toLowerCase() ||
      item.children.some((child: any) => child.route === pathname));

  // Use persistent localStorage state for items with children
  const [isOpen, setIsOpen] = useLocalStorage(
    `sidebar-${item.label.toLowerCase()}-open`,
    initialOpen || false,
  );

  const handleClick = () => {
    if (item.children) {
      setIsOpen(!isOpen);
    } else {
      const updatedPageName =
        pageName !== item.label.toLowerCase() ? item.label.toLowerCase() : "";
      setPageName(updatedPageName);
    }
  };

  // Recursive function to check if the item or one of its children is active
  const isActive = (item: any) => {
    if (item.route === pathname) return true;
    if (item.children) {
      return item.children.some((child: any) => isActive(child));
    }
    return false;
  };

  const isItemActive = isActive(item);

  return (
    <li>
      <div
        className={`${
          isItemActive ? "bg-graydark dark:bg-meta-4" : ""
        } group relative flex cursor-pointer items-center gap-2.5 rounded-sm px-4 py-2 font-medium text-bodydark1 duration-300 ease-in-out hover:bg-graydark dark:hover:bg-meta-4`}
        onClick={handleClick}
      >
        {item.icon}
        {item.route ? (
          <Link href={item.route} className="flex-grow">
            {item.label}
          </Link>
        ) : (
          <span className="flex-grow">{item.label}</span>
        )}
        {item.children && (
          <svg
            className={`transition-transform duration-200 ${
              isOpen ? "rotate-180" : ""
            }`}
            width="20"
            height="20"
            viewBox="0 0 20 20"
            fill="currentColor"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M4.41107 6.9107C4.73651 6.58527 5.26414 6.58527 5.58958 6.9107L10.0003 11.3214L14.4111 6.91071C14.7365 6.58527 15.2641 6.58527 15.5896 6.91071C15.915 7.23614 15.915 7.76378 15.5896 8.08922L10.5896 13.0892C10.2641 13.4147 9.73651 13.4147 9.41107 13.0892L4.41107 8.08922C4.08563 7.76378 4.08563 7.23614 4.41107 6.9107Z"
            />
          </svg>
        )}
      </div>

      {item.children && (
        <ul
          className={`overflow-hidden pl-8 transition-all duration-300 ease-in-out ${
            isOpen ? "max-h-96 py-2 opacity-100" : "max-h-0 py-0 opacity-0"
          }`}
        >
          {item.children.map((child: any, index: number) => (
            <li key={index} className="flex items-center py-2">
              {child.icon && <span className="mr-2">{child.icon}</span>}
              <Link
                href={child.route}
                className="text-bodydark1 duration-200 hover:text-white"
              >
                {child.label}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </li>
  );
};

export default SidebarItem;
