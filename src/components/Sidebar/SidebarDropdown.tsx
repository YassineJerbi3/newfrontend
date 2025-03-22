import React from "react";
import Link from "next/link";

const SidebarDropdown = ({ item }: any) => {
  return (
    <ul className="ml-4 border-l border-gray-600 pl-4">
      {item.map((child: any, index: number) => (
        <li key={index} className="flex items-center py-2">
          {child.icon && <span className="mr-2">{child.icon}</span>}
          <Link href={child.route} className="text-bodydark1 hover:text-white">
            {child.label}
          </Link>
        </li>
      ))}
    </ul>
  );
};

export default SidebarDropdown;
