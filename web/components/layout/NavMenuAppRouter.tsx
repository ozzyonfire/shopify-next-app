"use client";

import { usePathname } from "next/navigation";
import NavMenuCore from "./NavMenuCore";

export default function NavMenuAppRouter() {
  const pathname = usePathname();
  return <NavMenuCore pathname={pathname ?? undefined} />;
}
