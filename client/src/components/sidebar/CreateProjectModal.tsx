'use client';
import { useToast } from '@/hooks/use-toast';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { projectFormSchema, ProjectFormValues } from '@/schemas/project';
import { useCreateProjectMutation } from '@/store/projectApi';
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

interface CreateProjectModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  workspaceId: number | null;
  onSuccess: () => void;
}

const CreateProjectModal = ({
  open,
  onOpenChange,
  workspaceId,
  onSuccess,
}: CreateProjectModalProps) => {
  const { toast } = useToast();
  const [createProject, { isLoading: isCreating }] = useCreateProjectMutation();

  const form = useForm<ProjectFormValues>({
    resolver: zodResolver(projectFormSchema),
    defaultValues: {
      name: '',
      description: '',
      startDate: '',
      endDate: '',
    },
  });

  const handleCreateProject = async (data: ProjectFormValues) => {
    if (!workspaceId) {
      toast({
        title: 'Error',
        description: 'No active workspace selected',
        variant: 'destructive',
      });
      return;
    }

    console.log(data);

    try {
      await createProject({
        ...data,
        workspaceId,
      }).unwrap();

      onOpenChange(false);
      form.reset();
      toast({
        title: 'Success',
        description: 'Project created successfully',
      });
      onSuccess();
    } catch (error) {
      console.error('Failed to create project:', error);
      toast({
        title: 'Error',
        description: 'Failed to create project',
        variant: 'destructive',
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-[--background-secondary] border-[--border]">
        <DialogHeader>
          <DialogTitle className="text-[--text-primary]">
            Create New Project
          </DialogTitle>
          <DialogDescription className="text-[--text-muted]">
            Fill in the details to create a new project
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleCreateProject)}
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
                disabled={isCreating}
                className="bg-[--primary] hover:bg-[--primary-hover] text-white"
              >
                {isCreating ? 'Creating...' : 'Create Project'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateProjectModal;
