import * as React from "react";
import Link from "next/link";
import { GalleryVerticalEnd, LogOut } from "lucide-react";
import { usePathname } from "next/navigation";
import { logout } from "@/lib/actions.js";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar";

const data = {
  navMain: [
    {
      title: "Metas",
      url: "/dashboard",
      items: [
        {
          title: "Mis metas",
          url: "/dashboard",
        },
        {
          title: "Crear nueva meta",
          url: "/dashboard/crear/metas",
        },
      ],
    },
    {
      title: "Empresas",
      url: "#",
      items: [
        {
          title: "Mis empresas",
          url: "/dashboard/empresas",
        },
        {
          title: "Crear nueva empresa",
          url: "/dashboard/crear/empresas",
        },
      ],
    },
    {
      title: "Socios",
      url: "#",
      items: [
        {
          title: "Mis socios",
          url: "/dashboard/socios",
        },
        {
          title: "Crear nuevo socio",
          url: "/dashboard/crear/socios",
        },
      ],
    },
    {
      title: "Productos",
      url: "#",
      items: [
        {
          title: "Mis Productos",
          url: "/dashboard/productos",
        },
        {
          title: "Crear nuevo producto",
          url: "/dashboard/crear/productos",
        },
      ],
    },
  ],
};

export function AppSidebar({
  ...props
}) {
  const pathname = usePathname();
  return (
    <Sidebar variant="floating" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <a href="/dashboard">
                <div
                  className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                  <GalleryVerticalEnd className="size-4" />
                </div>
                <div className="flex flex-col gap-0.5 leading-none">
                  <span className="font-medium">Sinergia Creativa</span>
                  <span className="">v0.2</span>
                </div>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarMenu className="gap-2">
            {data.navMain.map((item) => (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton asChild>
                  <Link href={item.url} className="font-medium">
                    {item.title}
                  </Link>
                </SidebarMenuButton>
                {item.items?.length ? (
                  <SidebarMenuSub className="ml-0 border-l-0 px-1.5">
                    {item.items.map((item) => (
                      <SidebarMenuSubItem key={item.title}>
                        <SidebarMenuSubButton asChild isActive={pathname == item.url}>
                          <Link  href={item.url}>{item.title}</Link>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                    ))}
                  </SidebarMenuSub>
                ) : null}
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenuButton className="cursor-pointer" onClick={ logout }>
          <LogOut />
          <span>Cerrar Sesión</span>
        </SidebarMenuButton>
      </SidebarFooter>
    </Sidebar>
  );
}
