"use client";

import type { Task, Priority, Project } from "@/lib/types";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { CalendarIcon, Edit3, Flag, MoreVertical, Trash2, Tag, Briefcase, Coffee } from "lucide-react";
import { formatDatePretty } from "@/lib/date-utils";

interface TaskCardProps {
  task: Task;
  project?: Project;
  onToggleComplete: (taskId: string, completed: boolean) => void;
  onEdit: (task: Task) => void;
  onDelete: (taskId: string) => void;
}

const priorityMap: Record<Priority, { label: string; color: string; iconColor: string }> = {
  high: { label: "High", color: "border-red-500 bg-red-500/10 text-red-700 dark:text-red-400", iconColor: "text-red-500" },
  medium: { label: "Medium", color: "border-yellow-500 bg-yellow-500/10 text-yellow-700 dark:text-yellow-400", iconColor: "text-yellow-500" },
  low: { label: "Low", color: "border-green-500 bg-green-500/10 text-green-700 dark:text-green-400", iconColor: "text-green-500" },
  none: { label: "None", color: "border-gray-300 bg-gray-300/10 text-gray-500 dark:text-gray-400", iconColor: "text-gray-400" },
};

const categoryIcons: Record<string, React.ElementType> = {
  Work: Briefcase,
  Personal: Coffee,
  Errands: Tag,
};

export function TaskCard({ task, project, onToggleComplete, onEdit, onDelete }: TaskCardProps) {
  const CategoryIcon = task.category ? categoryIcons[task.category] : Briefcase;

  return (
    <Card className={`mb-4 shadow-sm hover:shadow-md transition-shadow duration-200 ${task.status === 'done' ? 'opacity-60 bg-muted/50' : 'bg-card'}`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <Checkbox
              id={`task-${task.id}`}
              checked={task.status === 'done'}
              onCheckedChange={(checked) => onToggleComplete(task.id, !!checked)}
              aria-label={`Mark task ${task.title} as ${task.status === 'done' ? 'incomplete' : 'complete'}`}
              className="mt-1"
            />
            <CardTitle className={`text-lg font-semibold ${task.status === 'done' ? 'line-through text-muted-foreground' : 'text-card-foreground'}`}>
              {task.title}
            </CardTitle>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreVertical className="h-4 w-4" />
                <span className="sr-only">Task options</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEdit(task)}>
                <Edit3 className="mr-2 h-4 w-4" /> Edit
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onDelete(task.id)} className="text-destructive focus:text-destructive focus:bg-destructive/10">
                <Trash2 className="mr-2 h-4 w-4" /> Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      {task.description && (
        <CardContent className="pb-3 pt-0">
          <p className={`text-sm ${task.status === 'done' ? 'line-through text-muted-foreground' : 'text-muted-foreground'}`}>{task.description}</p>
        </CardContent>
      )}
      <CardFooter className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground pt-0 pb-4">
        <div className="flex items-center gap-4">
          {task.dueDate && (
            <div className="flex items-center gap-1">
              <CalendarIcon className="h-3.5 w-3.5" />
              <span>{formatDatePretty(task.dueDate)}</span>
            </div>
          )}
          <div className="flex items-center gap-1">
            <Flag className={`h-3.5 w-3.5 ${priorityMap[task.priority].iconColor}`} />
            <span>{priorityMap[task.priority].label}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {task.category && CategoryIcon && (
            <Badge variant="outline" className="py-0.5 px-2 flex items-center gap-1 text-xs">
              <CategoryIcon className="h-3 w-3" />
              {task.category}
            </Badge>
          )}
          {project && (
            <Badge variant="secondary" style={{ backgroundColor: project.color ? `${project.color}20` : undefined, borderColor: project.color, color: project.color }} className="py-0.5 px-2 text-xs">
              {project.name}
            </Badge>
          )}
        </div>
      </CardFooter>
    </Card>
  );
}