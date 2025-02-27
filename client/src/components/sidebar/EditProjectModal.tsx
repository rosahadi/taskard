'use client';
import { useToast } from '@/hooks/use-toast';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { projectFormSchema, ProjectFormValues } from '@/schemas/project';
import {
  useUpdateProjectMutation,
  useGetProjectQuery,
} from '@/store/projectApi';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { useEffect } from 'react';

interface EditProjectModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: number | null;
  onSuccess: () => void;
}

const EditProjectModal = ({
  open,
  onOpenChange,
  projectId,
  onSuccess,
}: EditProjectModalProps) => {
  const { toast } = useToast();
  const [updateProject, { isLoading: isUpdating }] = useUpdateProjectMutation();

  // Fetch project data using the useGetProjectQuery hook
  const { data: projectData, isLoading: isProjectLoading } = useGetProjectQuery(
    projectId!,
    {
      // Skip the query if projectId is null or modal is not open
      skip: !projectId || !open,
    }
  );

  const form = useForm<ProjectFormValues>({
    resolver: zodResolver(projectFormSchema),
    defaultValues: {
      name: '',
      description: '',
      startDate: '',
      endDate: '',
    },
  });

  // Pre-fill the form with fetched project data
  useEffect(() => {
    if (projectData && open) {
      const { name, description, startDate, endDate } = projectData.data;

      // Convert Date objects to YYYY-MM-DD strings
      const formattedStartDate = startDate
        ? new Date(startDate).toISOString().split('T')[0]
        : '';
      const formattedEndDate = endDate
        ? new Date(endDate).toISOString().split('T')[0]
        : '';

      form.reset({
        name,
        description: description || '',
        startDate: formattedStartDate,
        endDate: formattedEndDate,
      });
    }
  }, [projectData, open, form]);

  const handleUpdateProject = async (data: ProjectFormValues) => {
    if (!projectId) {
      toast({
        title: 'Error',
        description: 'No project selected',
        variant: 'destructive',
      });
      return;
    }

    try {
      await updateProject({
        id: projectId,
        body: data,
      }).unwrap();

      onOpenChange(false);
      toast({
        title: 'Success',
        description: 'Project updated successfully',
      });
      onSuccess();
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to update project',
        variant: 'destructive',
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-[--background-secondary] border-[--border]">
        <DialogHeader>
          <DialogTitle className="text-[--text-primary]">
            Edit Project
          </DialogTitle>
          <DialogDescription className="text-[--text-muted]">
            Update the details of the project
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleUpdateProject)}
            className="space-y-4 py-2"
          >
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[--text-primary]">
                    Project Name
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter project name"
                      className="bg-[--background-tertiary] border-[--border] text-[--text-primary]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[--text-primary]">
                    Description
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Project description"
                      className="bg-[--background-tertiary] border-[--border] text-[--text-primary]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="startDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[--text-primary]">
                      Start Date
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="date"
                        className="bg-[--background-tertiary] border-[--border] text-[--text-primary]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="endDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[--text-primary]">
                      End Date
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="date"
                        className="bg-[--background-tertiary] border-[--border] text-[--text-primary]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  onOpenChange(false);
                  form.reset();
                }}
                className="hover:bg-[--background-tertiary]"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isUpdating || isProjectLoading}
                className="bg-[--primary] hover:bg-[--primary-hover] text-white"
              >
                {isUpdating ? 'Updating...' : 'Update Project'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default EditProjectModal;
