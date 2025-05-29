"use client";

import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
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
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import type { Project } from "@/lib/types";

const projectFormSchema = z.object({
  name: z.string().min(1, "Project name is required"),
  color: z.string().optional(), // Basic hex color validation
});

type ProjectFormValues = z.infer<typeof projectFormSchema>;

interface ProjectFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (projectData: Omit<Project, "id"> & { id?: string }) => void;
  projectToEdit?: Project;
}

const defaultColors = ["#FF6B6B", "#4ECDC4", "#45B7D1", "#F9A825", "#A1887F", "#FF80AB", "#7C4DFF", "#00BCD4"];

export function ProjectFormDialog({ open, onOpenChange, onSubmit, projectToEdit }: ProjectFormDialogProps) {
  const form = useForm<ProjectFormValues>({
    resolver: zodResolver(projectFormSchema),
    defaultValues: {
      name: "",
      color: defaultColors[0],
    },
  });

  React.useEffect(() => {
    if (projectToEdit) {
      form.reset({
        name: projectToEdit.name,
        color: projectToEdit.color || defaultColors[0],
      });
    } else {
      form.reset({ name: "", color: defaultColors[Math.floor(Math.random() * defaultColors.length)] });
    }
  }, [projectToEdit, form, open]);

  const processSubmit = (data: ProjectFormValues) => {
    onSubmit({
      id: projectToEdit?.id,
      name: data.name,
      color: data.color,
    });
    form.reset();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => { onOpenChange(isOpen); if (!isOpen) form.reset(); }}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{projectToEdit ? "Edit Project" : "Add New Project"}</DialogTitle>
          <DialogDescription>
            {projectToEdit ? "Update the details of your project." : "Create a new project to organize your tasks."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(processSubmit)} className="space-y-4 py-2">
          <div>
            <Label htmlFor="name">Project Name</Label>
            <Input id="name" {...form.register("name")} placeholder="e.g., Q4 Marketing Plan" />
            {form.formState.errors.name && <p className="text-sm text-destructive mt-1">{form.formState.errors.name.message}</p>}
          </div>
          <div>
            <Label htmlFor="color">Project Color</Label>
            <div className="flex items-center gap-2 mt-1">
              <Input 
                type="color" 
                id="color" 
                {...form.register("color")} 
                className="w-12 h-10 p-1"
              />
              <div className="flex flex-wrap gap-1">
                {defaultColors.map(c => (
                  <Button
                    key={c}
                    type="button"
                    variant="outline"
                    className="w-8 h-8 p-0 border-2"
                    style={{ backgroundColor: c, borderColor: form.watch("color") === c ? "hsl(var(--primary))" : c }}
                    onClick={() => form.setValue("color", c)}
                    aria-label={`Select color ${c}`}
                  />
                ))}
              </div>
            </div>
            {form.formState.errors.color && <p className="text-sm text-destructive mt-1">{form.formState.errors.color.message}</p>}
          </div>
        </form>
        <DialogFooter className="pt-4 border-t">
          <Button variant="outline" onClick={() => { onOpenChange(false); form.reset(); }}>Cancel</Button>
          <Button type="submit" onClick={form.handleSubmit(processSubmit)} disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : (projectToEdit ? "Save Changes" : "Create Project")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}