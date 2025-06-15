// src/components/ui/button.tsx
import React, { ButtonHTMLAttributes } from "react";

export const Button: React.FC<ButtonHTMLAttributes<HTMLButtonElement>> = ({
  className = "",
  ...props
}) => (
  <button
    className={`inline-flex items-center justify-center rounded-md px-4 py-2 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${className}`}
    {...props}
  />
);
