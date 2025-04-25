// src/app/acceuil/page.tsx
import ECommerce from "@/components/Dashboard/E-commerce";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "ESCS - Dashboard",
  description: "Gestion de parc informatique",
};

export default function AccueilPage() {
  return <ECommerce />;
}
