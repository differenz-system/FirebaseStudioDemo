
"use client";

import * as React from "react";
import { AppShell } from "@/components/layout/app-shell";
import { TaskCard } from "@/components/tasks/task-card";
import { TaskFormDialog } from "@/components/tasks/task-form-dialog";
import { ProjectFormDialog } from "@/components/tasks/project-form-dialog";
import type { Task, Project, TaskFilter, TaskStatus } from "@/lib/types";
import { initialTasks, initialProjects } from "@/lib/mock-data";
import { createTaskAction, updateTaskAction, deleteTaskAction, createProjectAction } from "@/app/actions/task-actions";
import { isDateToday, isDateThisWeek, isDateUpcoming, getCurrentIsoDateTime } from "@/lib/date-utils";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { PlusCircle, ListFilter } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";


export default function HomePage() {
  const { toast } = useToast();
  const [tasks, setTasks] = React.useState<Task[]>(initialTasks);
  const [projects, setProjects] = React.useState<Project[]>(initialProjects);
  const [activeFilter, setActiveFilter] = React.useState<TaskFilter>("all");
  
  const [isTaskFormOpen, setIsTaskFormOpen] = React.useState(false);
  const [taskToEdit, setTaskToEdit] = React.useState<Task | undefined>(undefined);

  const [isProjectFormOpen, setIsProjectFormOpen] = React.useState(false);
  // Project to edit could be added later if needed:
  // const [projectToEdit, setProjectToEdit] = React.useState<Project | undefined>(undefined);


  const handleSelectFilter = (filter: TaskFilter) => {
    setActiveFilter(filter);
  };

  const handleAddTask = () => {
    setTaskToEdit(undefined);
    setIsTaskFormOpen(true);
  };

  const handleEditTask = (task: Task) => {
    setTaskToEdit(task);
    setIsTaskFormOpen(true);
  };

  const handleDeleteTask = async (taskId: string) => {
    // Optimistically update UI
    setTasks(prevTasks => prevTasks.filter(t => t.id !== taskId));
    const result = await deleteTaskAction(taskId);
    if (result.error) {
      toast({ title: "Error deleting task", description: result.error, variant: "destructive" });
      // Revert optimistic update if there's an error (not strictly necessary with in-memory)
      // setTasks(tasks); 
    } else {
      toast({ title: "Task Deleted", description: "The task has been successfully deleted.", className: "bg-accent text-accent-foreground"});
    }
  };

  const handleToggleComplete = async (taskId: string, completed: boolean) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    const newStatus: TaskStatus = completed ? "done" : "todo";
    
    // Optimistically update UI
    setTasks(prevTasks => prevTasks.map(t => t.id === taskId ? { ...t, status: newStatus } : t));

    const result = await updateTaskAction({ id: taskId, status: newStatus });
    if (result.error) {
      toast({ title: "Error updating task", description: result.error, variant: "destructive" });
      // Revert
      setTasks(prevTasks => prevTasks.map(t => t.id === taskId ? { ...t, status: task.status } : t));
    }
    // No success toast for simple toggle, to keep UI less noisy
  };

  const handleTaskFormSubmit = async (taskData: Omit<Task, "id" | "status" | "createdAt"> & { id?: string }) => {
    if (taskData.id) { // Editing existing task
      const result = await updateTaskAction(taskData as Task); // Cast because id is present
      if (result.task) {
        setTasks(prevTasks => prevTasks.map(t => t.id === result.task!.id ? { ...t, ...result.task } : t));
        toast({ title: "Task Updated", description: "Your task has been successfully updated." });
      } else {
        toast({ title: "Error updating task", description: result.error, variant: "destructive" });
      }
    } else { // Creating new task
      const result = await createTaskAction({ ...taskData, status: "todo" });
      if (result.task) {
        setTasks(prevTasks => [result.task!, ...prevTasks]);
        toast({ title: "Task Created", description: "New task added successfully.", className: "bg-accent text-accent-foreground" });
      } else {
        toast({ title: "Error creating task", description: result.error, variant: "destructive" });
      }
    }
    setIsTaskFormOpen(false);
  };

  const handleAddProject = () => {
    // setProjectToEdit(undefined); // if edit functionality is added
    setIsProjectFormOpen(true);
  };

  const handleProjectFormSubmit = async (projectData: Omit<Project, "id"> & { id?: string }) => {
    // For now, only creating projects, edit can be added later
    const result = await createProjectAction(projectData);
    if (result.project) {
      setProjects(prevProjects => [result.project!, ...prevProjects]);
      toast({ title: "Project Created", description: `Project "${result.project.name}" added.`, className: "bg-accent text-accent-foreground" });
    } else {
      toast({ title: "Error Creating Project", description: result.error, variant: "destructive" });
    }
    setIsProjectFormOpen(false);
  };

  const filteredTasks = React.useMemo(() => {
    let tempTasks = [...tasks];
    // Sort tasks: todo > inprogress > done, then by due date (earliest first, no due date last), then by priority (high > medium > low > none)
    tempTasks.sort((a, b) => {
      const statusOrder: Record<TaskStatus, number> = { todo: 1, inprogress: 2, done: 3 };
      if (statusOrder[a.status] !== statusOrder[b.status]) {
        return statusOrder[a.status] - statusOrder[b.status];
      }
      
      const dueDateA = a.dueDate ? new Date(a.dueDate).getTime() : Infinity;
      const dueDateB = b.dueDate ? new Date(b.dueDate).getTime() : Infinity;
      if (dueDateA !== dueDateB) {
        return dueDateA - dueDateB;
      }

      const priorityOrder = { high: 1, medium: 2, low: 3, none: 4 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });


    if (activeFilter === "all") return tempTasks;
    if (activeFilter === "today") return tempTasks.filter(task => task.dueDate && isDateToday(task.dueDate));
    if (activeFilter === "this_week") return tempTasks.filter(task => task.dueDate && isDateThisWeek(task.dueDate));
    if (activeFilter === "upcoming") return tempTasks.filter(task => task.dueDate && isDateUpcoming(task.dueDate));
    // Project filter
    return tempTasks.filter(task => task.projectId === activeFilter || (activeFilter === 'proj-uncategorized' && !task.projectId));
  }, [tasks, activeFilter]);

  const getProjectById = (projectId?: string): Project | undefined => {
    if (!projectId) return undefined;
    return projects.find(p => p.id === projectId);
  }
  
  const activeFilterLabel = React.useMemo(() => {
    if (activeFilter === "all") return "All Tasks";
    if (activeFilter === "today") return "Today's Tasks";
    if (activeFilter === "this_week") return "This Week's Tasks";
    if (activeFilter === "upcoming") return "Upcoming Tasks";
    const project = projects.find(p => p.id === activeFilter);
    return project ? project.name : "Tasks";
  }, [activeFilter, projects]);


  return (
    <AppShell
      projects={projects.filter(p => p.id !== 'proj-uncategorized')}
      activeFilter={activeFilter}
      onSelectFilter={handleSelectFilter}
      onAddTask={handleAddTask}
      onAddProject={handleAddProject}
    >
      <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h2 className="text-3xl font-bold tracking-tight text-foreground">
          {activeFilterLabel}
        </h2>
        <div className="flex items-center gap-2">
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="ml-auto">
                        <ListFilter className="mr-2 h-4 w-4" />
                        Filter / Sort
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    {/* Sorting options can be added here */}
                    {/* <DropdownMenuLabel>Sort by</DropdownMenuLabel>
                    <DropdownMenuRadioGroup value={sortOption} onValueChange={setSortOption}>
                        <DropdownMenuRadioItem value="dueDate">Due Date</DropdownMenuRadioItem>
                        <DropdownMenuRadioItem value="priority">Priority</DropdownMenuRadioItem>
                        <DropdownMenuRadioItem value="createdAt">Created Date</DropdownMenuRadioItem>
                    </DropdownMenuRadioGroup>
                    <DropdownMenuSeparator /> */}
                    {/* Filtering options can be expanded here if needed */}
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
      </div>

      {filteredTasks.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-[calc(100vh-200px)] text-center p-8 border-2 border-dashed rounded-lg bg-muted/50">
          <img src="https://placehold.co/300x200.png?text=No+Tasks+Here" alt="No tasks" className="mb-6 rounded-md opacity-70" data-ai-hint="empty state illustration" />
          <h3 className="text-2xl font-semibold text-foreground mb-2">No Tasks Yet!</h3>
          <p className="text-muted-foreground mb-6 max-w-md">
            It looks like there are no tasks matching your current filter. 
            Why not add a new one?
          </p>
          <Button onClick={handleAddTask} size="lg">
            <PlusCircle className="mr-2 h-5 w-5" /> Add Your First Task
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredTasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              project={getProjectById(task.projectId)}
              onToggleComplete={handleToggleComplete}
              onEdit={handleEditTask}
              onDelete={handleDeleteTask}
            />
          ))}
        </div>
      )}

      <TaskFormDialog
        open={isTaskFormOpen}
        onOpenChange={setIsTaskFormOpen}
        onSubmit={handleTaskFormSubmit}
        taskToEdit={taskToEdit}
        projects={projects.filter(p => p.id !== 'proj-uncategorized')}
      />
      <ProjectFormDialog
        open={isProjectFormOpen}
        onOpenChange={setIsProjectFormOpen}
        onSubmit={handleProjectFormSubmit}
        // projectToEdit={projectToEdit} // if edit functionality is added
      />
    </AppShell>
  );
}

