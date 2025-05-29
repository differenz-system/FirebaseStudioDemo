"use client";

import type * as React from "react";
import Link from "next/link";
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarTrigger,
  SidebarInset,
  useSidebar,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { AppLogo } from "@/components/app-logo";
import {
  LayoutDashboard,
  ListTodo,
  CalendarDays,
  ChevronDown,
  Search,
  PlusCircle,
  Settings,
  LogOut,
  Folder,
  Star,
  Sun,
  Moon,
} from "lucide-react";
import type { Project, TaskFilter } from "@/lib/types";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

interface AppShellProps {
  projects: Project[];
  activeFilter: TaskFilter;
  onSelectFilter: (filter: TaskFilter) => void;
  onAddTask: () => void;
  onAddProject: () => void;
  children: React.ReactNode;
}

const navItems = [
  { id: "all", label: "All Tasks", icon: ListTodo, filter: "all" as TaskFilter },
  { id: "today", label: "Today", icon: Sun, filter: "today" as TaskFilter },
  { id: "this_week", label: "This Week", icon: CalendarDays, filter: "this_week" as TaskFilter },
  { id: "upcoming", label: "Upcoming", icon: Star, filter: "upcoming" as TaskFilter },
];

function UserMenu() {
  // Placeholder for theme toggle logic
  const [isDarkTheme, setIsDarkTheme] = React.useState(false);
  React.useEffect(() => {
    // Check for saved theme or system preference
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    setIsDarkTheme(document.documentElement.classList.contains('dark') || (!('theme' in localStorage) && prefersDark));
  }, []);


  const toggleTheme = () => {
    const newTheme = !isDarkTheme;
    setIsDarkTheme(newTheme);
    if (newTheme) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };


  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-10 w-10 rounded-full">
          <Avatar className="h-9 w-9">
            <AvatarImage src="https://placehold.co/100x100.png" alt="User Avatar" data-ai-hint="user avatar" />
            <AvatarFallback>TZ</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">TaskZen User</p>
            <p className="text-xs leading-none text-muted-foreground">
              user@taskzen.com
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={toggleTheme}>
          {isDarkTheme ? <Sun className="mr-2 h-4 w-4" /> : <Moon className="mr-2 h-4 w-4" />}
          <span>{isDarkTheme ? "Light Mode" : "Dark Mode"}</span>
        </DropdownMenuItem>
        <DropdownMenuItem>
          <Settings className="mr-2 h-4 w-4" />
          <span>Settings</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem>
          <LogOut className="mr-2 h-4 w-4" />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}


function MainSidebar({ projects, activeFilter, onSelectFilter, onAddProject }: Pick<AppShellProps, 'projects' | 'activeFilter' | 'onSelectFilter' | 'onAddProject'>) {
  const { setOpenMobile } = useSidebar();
  const [isProjectsExpanded, setIsProjectsExpanded] = React.useState(true);

  const handleFilterSelection = (filter: TaskFilter) => {
    onSelectFilter(filter);
    setOpenMobile(false); // Close mobile sidebar on selection
  };

  return (
    <Sidebar variant="inset" collapsible="icon" side="left" className="border-r">
      <SidebarHeader>
        <AppLogo />
      </SidebarHeader>
      <SidebarContent className="flex-grow">
        <ScrollArea className="h-full">
          <SidebarMenu className="p-2">
            {navItems.map((item) => (
              <SidebarMenuItem key={item.id}>
                <SidebarMenuButton
                  onClick={() => handleFilterSelection(item.filter)}
                  isActive={activeFilter === item.filter}
                  tooltip={{ children: item.label, side: "right", align: "center"}}
                >
                  <item.icon />
                  <span>{item.label}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>

          <Separator className="my-4" />
          
          <div className="px-2">
            <Button variant="ghost" onClick={() => setIsProjectsExpanded(!isProjectsExpanded)} className="w-full justify-between px-2 mb-2">
              <span className="font-semibold text-sm">Projects</span>
              <ChevronDown className={`h-4 w-4 transition-transform ${isProjectsExpanded ? 'rotate-180' : ''}`} />
            </Button>
            {isProjectsExpanded && (
              <SidebarMenu className="pl-2">
                {projects.map((project) => (
                  <SidebarMenuItem key={project.id}>
                    <SidebarMenuButton
                      onClick={() => handleFilterSelection(project.id)}
                      isActive={activeFilter === project.id}
                      tooltip={{ children: project.name, side: "right", align: "center"}}
                    >
                       <span style={{backgroundColor: project.color || '#ccc'}} className="h-3 w-3 rounded-full mr-2 shrink-0"></span>
                      <span className="truncate">{project.name}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
                 <SidebarMenuItem>
                    <SidebarMenuButton variant="outline" size="sm" onClick={onAddProject} className="mt-2">
                        <PlusCircle className="mr-2 h-4 w-4" />
                        <span>Add Project</span>
                    </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            )}
          </div>
        </ScrollArea>
      </SidebarContent>
      <SidebarFooter>
        {/* Footer content if any, e.g., settings, help */}
      </SidebarFooter>
    </Sidebar>
  );
}

function MainHeader({ onAddTask }: Pick<AppShellProps, 'onAddTask'>) {
  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background/80 backdrop-blur-sm px-4 sm:px-6">
        <SidebarTrigger className="md:hidden" />
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search tasks..."
            className="w-full rounded-lg bg-background pl-8 md:w-[200px] lg:w-[320px] shadow-none"
          />
        </div>
        <Button onClick={onAddTask} size="sm">
          <PlusCircle className="mr-2 h-4 w-4" /> Add Task
        </Button>
        <UserMenu />
    </header>
  );
}


export function AppShell(props: AppShellProps) {
  return (
    <SidebarProvider defaultOpen>
      <MainSidebar {...props} />
      <SidebarInset className="flex flex-col">
        <MainHeader onAddTask={props.onAddTask} />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 bg-background">
          {props.children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}