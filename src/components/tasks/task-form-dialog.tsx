"use client";

import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon, Sparkles, Loader2, CheckCircle, AlertCircle } from "lucide-react";
import type { Task, Priority, Project } from "@/lib/types";
import { formatDateYyyyMmDd, formatDatePretty } from "@/lib/date-utils";
import { getAISuggestedCategory, getAISuggestedDueDate } from "@/app/actions/task-actions";
import { useToast } from "@/hooks/use-toast";

const taskFormSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  dueDate: z.date().optional(),
  priority: z.enum(["low", "medium", "high", "none"]),
  projectId: z.string().optional(),
  category: z.string().optional(),
});

type TaskFormValues = z.infer<typeof taskFormSchema>;

interface TaskFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (taskData: Omit<Task, "id" | "status" | "createdAt"> & { id?: string }) => void;
  taskToEdit?: Task;
  projects: Project[];
}

export function TaskFormDialog({ open, onOpenChange, onSubmit, taskToEdit, projects }: TaskFormDialogProps) {
  const { toast } = useToast();
  const [isSuggestingCategory, setIsSuggestingCategory] = React.useState(false);
  const [isSuggestingDueDate, setIsSuggestingDueDate] = React.useState(false);

  const form = useForm<TaskFormValues>({
    resolver: zodResolver(taskFormSchema),
    defaultValues: {
      title: "",
      description: "",
      dueDate: undefined,
      priority: "none",
      projectId: undefined,
      category: "",
    },
  });

  React.useEffect(() => {
    if (taskToEdit) {
      form.reset({
        title: taskToEdit.title,
        description: taskToEdit.description || "",
        dueDate: taskToEdit.dueDate ? new Date(taskToEdit.dueDate) : undefined,
        priority: taskToEdit.priority,
        projectId: taskToEdit.projectId,
        category: taskToEdit.category || "",
      });
    } else {
      form.reset(); // Reset to default if no task to edit (e.g., closing then reopening for new task)
    }
  }, [taskToEdit, form, open]); // Added open dependency

  const handleSuggestCategory = async () => {
    const title = form.getValues("title");
    const description = form.getValues("description");
    if (!title && !description) {
      toast({ title: "Cannot suggest category", description: "Please enter a title or description first.", variant: "destructive" });
      return;
    }
    setIsSuggestingCategory(true);
    try {
      const result = await getAISuggestedCategory(description || title);
      if (result.category) {
        form.setValue("category", result.category);
        toast({ title: "AI Suggestion", description: `Category set to "${result.category}".`, className: "bg-accent text-accent-foreground" });
      } else if (result.error) {
        toast({ title: "AI Suggestion Failed", description: result.error, variant: "destructive" });
      }
    } catch (e) {
      toast({ title: "Error", description: "Could not get category suggestion.", variant: "destructive" });
    } finally {
      setIsSuggestingCategory(false);
    }
  };

  const handleSuggestDueDate = async () => {
    const title = form.getValues("title");
    const description = form.getValues("description");
    if (!title && !description) {
      toast({ title: "Cannot suggest due date", description: "Please enter a title or description first.", variant: "destructive" });
      return;
    }
    setIsSuggestingDueDate(true);
    try {
      // TODO: Pass actual existing workload if available
      const result = await getAISuggestedDueDate(description || title, "No existing workload provided.");
      if (result.dueDate) {
        form.setValue("dueDate", new Date(result.dueDate)); // Assuming YYYY-MM-DD format from AI
        toast({ title: "AI Suggestion", description: `Due date set to ${formatDatePretty(result.dueDate)}. Reasoning: ${result.reasoning}`, className: "bg-accent text-accent-foreground" });
      } else if (result.error) {
        toast({ title: "AI Suggestion Failed", description: result.error, variant: "destructive" });
      }
    } catch (e) {
      toast({ title: "Error", description: "Could not get due date suggestion.", variant: "destructive" });
    } finally {
      setIsSuggestingDueDate(false);
    }
  };

  const processSubmit = (data: TaskFormValues) => {
    onSubmit({
      id: taskToEdit?.id,
      title: data.title,
      description: data.description,
      dueDate: data.dueDate ? formatDateYyyyMmDd(data.dueDate) : undefined,
      priority: data.priority,
      projectId: data.projectId,
      category: data.category,
    });
    form.reset();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => { onOpenChange(isOpen); if (!isOpen) form.reset(); }}>
      <DialogContent className="sm:max-w-[525px] max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>{taskToEdit ? "Edit Task" : "Add New Task"}</DialogTitle>
          <DialogDescription>
            {taskToEdit ? "Update the details of your task." : "Fill in the details for your new task."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(processSubmit)} className="space-y-4 overflow-y-auto px-1 py-2 flex-grow">
          <div>
            <Label htmlFor="title">Title</Label>
            <Input id="title" {...form.register("title")} placeholder="e.g., Buy groceries" />
            {form.formState.errors.title && <p className="text-sm text-destructive mt-1">{form.formState.errors.title.message}</p>}
          </div>
          <div>
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea id="description" {...form.register("description")} placeholder="Add more details..." />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="dueDate">Due Date (Optional)</Label>
              <Controller
                name="dueDate"
                control={form.control}
                render={({ field }) => (
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant={"outline"}
                        className={`w-full justify-start text-left font-normal ${!field.value && "text-muted-foreground"}`}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {field.value ? formatDatePretty(formatDateYyyyMmDd(field.value)) : <span>Pick a date</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                )}
              />
            </div>
            <div>
              <Label htmlFor="priority">Priority</Label>
              <Controller
                name="priority"
                control={form.control}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <SelectTrigger id="priority">
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
                <Label htmlFor="projectId">Project (Optional)</Label>
                <Controller
                    name="projectId"
                    control={form.control}
                    render={({ field }) => (
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <SelectTrigger id="projectId">
                        <SelectValue placeholder="Select project" />
                        </SelectTrigger>
                        <SelectContent>
                        <SelectItem value="">No Project</SelectItem>
                        {projects.filter(p => p.id !== 'proj-uncategorized').map(project => (
                            <SelectItem key={project.id} value={project.id}>{project.name}</SelectItem>
                        ))}
                        </SelectContent>
                    </Select>
                    )}
                />
            </div>
            <div>
              <Label htmlFor="category">Category (Optional)</Label>
              <Input id="category" {...form.register("category")} placeholder="e.g., Work, Personal" />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-2 mt-4">
            <Button type="button" variant="outline" onClick={handleSuggestCategory} disabled={isSuggestingCategory} className="flex-1">
              {isSuggestingCategory ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
              Suggest Category
            </Button>
            <Button type="button" variant="outline" onClick={handleSuggestDueDate} disabled={isSuggestingDueDate} className="flex-1">
              {isSuggestingDueDate ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
              Suggest Due Date
            </Button>
          </div>
        </form>
        <DialogFooter className="pt-4 border-t">
          <Button variant="outline" onClick={() => { onOpenChange(false); form.reset(); }}>Cancel</Button>
          <Button type="submit" onClick={form.handleSubmit(processSubmit)} disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : (taskToEdit ? "Save Changes" : "Add Task")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}