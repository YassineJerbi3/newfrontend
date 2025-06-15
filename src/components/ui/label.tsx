// src/components/ui/label.tsx
import React, { LabelHTMLAttributes } from "react";

export const Label: React.FC<LabelHTMLAttributes<HTMLLabelElement>> = ({
  className = "",
  ...props
}) => (
  <label
    className={`block text-sm font-medium text-gray-700 ${className}`}
    {...props}
  />
);
