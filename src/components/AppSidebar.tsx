import { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { Package, Gift, Trash2, WalletIcon, LogOut } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const navigationItems = [
  { 
    title: "Objetos Abandonados", 
    url: "/abandons", 
    icon: Trash2,
    key: "abandons"
  },
  { 
    title: "Donaciones", 
    url: "/donations", 
    icon: Gift,
    key: "donations"
  },
  { 
    title: "Productos", 
    url: "/products", 
    icon: Package,
    key: "products"
  },
  { 
    title: "Billetera", 
    url: "/wallet", 
    icon: WalletIcon,
    key: "wallet"
  },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const { signOut, user } = useAuth();
  const currentPath = location.pathname;
  const collapsed = state === "collapsed";

  const handleSignOut = async () => {
    await signOut();
    toast.success('Sesión cerrada correctamente');
  };

  const isActive = (path: string) => currentPath === path || currentPath.startsWith(path);
  const isExpanded = navigationItems.some((item) => isActive(item.url));

  const getNavCls = (isActiveRoute: boolean) =>
    isActiveRoute 
      ? "bg-primary/10 text-primary font-medium border-r-2 border-primary" 
      : "hover:bg-muted/50 text-muted-foreground hover:text-foreground";

  return (
    <Sidebar
      className={collapsed ? "w-14" : "w-64"}
      collapsible="icon"
    >
      <SidebarTrigger className="m-2 self-end" />

      <SidebarContent>
        {/* Header */}
        <div className={`p-4 border-b ${collapsed ? 'text-center' : ''}`}>
          <h2 className={`font-bold text-lg ${collapsed ? 'text-xs' : ''}`}>
            {collapsed ? 'SF' : 'Street Finds Swap'}
          </h2>
          {!collapsed && user && (
            <p className="text-xs text-muted-foreground mt-1 truncate">
              {user.email}
            </p>
          )}
        </div>

        {/* Navigation */}
        <SidebarGroup>
          <SidebarGroupLabel className={collapsed ? 'sr-only' : ''}>
            Navegación
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigationItems.map((item) => (
                <SidebarMenuItem key={item.key}>
                  <SidebarMenuButton asChild>
                    <NavLink 
                      to={item.url} 
                      className={({ isActive }) => getNavCls(isActive)}
                      title={collapsed ? item.title : undefined}
                    >
                      <item.icon className="h-4 w-4" />
                      {!collapsed && <span className="ml-2">{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Logout Button */}
        <div className="mt-auto p-4 border-t">
          <Button
            variant="ghost"
            onClick={handleSignOut}
            className={`w-full ${collapsed ? 'px-2' : 'justify-start'}`}
            title={collapsed ? 'Cerrar sesión' : undefined}
          >
            <LogOut className="h-4 w-4" />
            {!collapsed && <span className="ml-2">Cerrar sesión</span>}
          </Button>
        </div>
      </SidebarContent>
    </Sidebar>
  );
}