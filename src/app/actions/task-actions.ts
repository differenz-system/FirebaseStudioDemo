"use server";

import { z } from "zod";
import { categorizeTask, CategorizeTaskInput } from "@/ai/flows/categorize-task";
import { suggestDueDate, SuggestDueDateInput } from "@/ai/flows/suggest-due-date";
import type { Task, Priority, TaskStatus } from "@/lib/types";
import { getCurrentIsoDateTime } from "@/lib/date-utils";

// Schemas for validation
const TaskIdSchema = z.string().min(1);

const BaseTaskSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  dueDate: z.string().optional(), // YYYY-MM-DD format
  priority: z.enum(["low", "medium", "high", "none"]),
  status: z.enum(["todo", "inprogress", "done"]),
  projectId: z.string().optional(),
  category: z.string().optional(),
});

const CreateTaskSchema = BaseTaskSchema;
const UpdateTaskSchema = BaseTaskSchema.partial().extend({ id: TaskIdSchema });


// AI Actions
export async function getAISuggestedCategory(taskDescription: string) {
  if (!taskDescription) {
    return { error: "Task description is required for categorization." };
  }
  try {
    const input: CategorizeTaskInput = { taskDescription };
    const result = await categorizeTask(input);
    return { category: result.category };
  } catch (error) {
    console.error("Error categorizing task:", error);
    return { error: "Failed to get AI category suggestion." };
  }
}

export async function getAISuggestedDueDate(taskDescription: string, existingWorkload?: string) {
  if (!taskDescription) {
    return { error: "Task description is required for due date suggestion." };
  }
  try {
    const input: SuggestDueDateInput = { taskDescription, existingWorkload };
    const result = await suggestDueDate(input);
    return { dueDate: result.suggestedDueDate, reasoning: result.reasoning };
  } catch (error) {
    console.error("Error suggesting due date:", error);
    return { error: "Failed to get AI due date suggestion." };
  }
}

// Simulated DB operations for tasks (replace with actual DB calls)
// For now, these functions are placeholders and won't actually persist data.
// The main state management will be client-side in page.tsx for this scaffold.

let tasks: Task[] = []; // In-memory store for demo

export async function createTaskAction(data: z.infer<typeof CreateTaskSchema>): Promise<{ task?: Task; error?: string }> {
  const validation = CreateTaskSchema.safeParse(data);
  if (!validation.success) {
    return { error: validation.error.errors.map(e => e.message).join(', ') };
  }

  const newTask: Task = {
    id: `task-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    ...validation.data,
    createdAt: getCurrentIsoDateTime(),
  };
  // tasks.push(newTask); // Simulate DB insert
  return { task: newTask }; // Return task so client can update its state
}

export async function updateTaskAction(data: z.infer<typeof UpdateTaskSchema>): Promise<{ task?: Task; error?: string }> {
  const validation = UpdateTaskSchema.safeParse(data);
  if (!validation.success) {
    return { error: validation.error.errors.map(e => e.message).join(', ') };
  }
  const { id, ...updateData } = validation.data;
  
  // const taskIndex = tasks.findIndex(t => t.id === id);
  // if (taskIndex === -1) {
  //   return { error: "Task not found." };
  // }
  // tasks[taskIndex] = { ...tasks[taskIndex], ...updateData };
  // return { task: tasks[taskIndex] };
  
  // For client-side state management, just return the updated data structure
  const updatedTaskFields = { id, ...updateData } as Task; // Cast needed as updateData is partial
  return { task: updatedTaskFields };
}

export async function deleteTaskAction(taskId: string): Promise<{ success?: boolean; error?: string }> {
  const validation = TaskIdSchema.safeParse(taskId);
  if (!validation.success) {
    return { error: "Invalid Task ID." };
  }
  // tasks = tasks.filter(t => t.id !== taskId);
  return { success: true }; // Indicate success for client to update state
}

// Simulated DB operations for projects
let projects: Project[] = []; // In-memory store for demo

export interface Project {
  id: string;
  name: string;
  color?: string;
}
const ProjectSchema = z.object({
    name: z.string().min(1, "Project name is required"),
    color: z.string().optional(),
});

export async function createProjectAction(data: z.infer<typeof ProjectSchema>): Promise<{ project?: Project; error?: string }> {
    const validation = ProjectSchema.safeParse(data);
    if (!validation.success) {
        return { error: validation.error.errors.map(e => e.message).join(', ') };
    }
    const newProject: Project = {
        id: `proj-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        ...validation.data,
    };
    // projects.push(newProject); // Simulate DB insert
    return { project: newProject };
}