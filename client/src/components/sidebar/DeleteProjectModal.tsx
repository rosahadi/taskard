'use client';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useDeleteProjectMutation } from '@/store/projectApi';

interface DeleteProjectModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: number | null;
  onSuccess: () => void;
}

const DeleteProjectModal = ({
  open,
  onOpenChange,
  projectId,
  onSuccess,
}: DeleteProjectModalProps) => {
  const { toast } = useToast();
  const [deleteProject, { isLoading: isDeleting }] = useDeleteProjectMutation();

  const handleDeleteProject = async () => {
    if (!projectId) return;

    try {
      await deleteProject(projectId).unwrap();
      onOpenChange(false);
      toast({
        title: 'Success',
        description: 'Project deleted successfully',
      });
      onSuccess();
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to delete project',
        variant: 'destructive',
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-[--background-secondary] border-[--border]">
        <DialogHeader>
          <DialogTitle className="text-[--text-primary]">
            Delete Project
          </DialogTitle>
          <DialogDescription className="text-[--text-muted]">
            Are you sure you want to delete this project? This action cannot be
            undone.
          </DialogDescription>
        </DialogHeader>
        <div className="flex justify-end gap-3 mt-4">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="hover:bg-[--background-tertiary]"
            disabled={isDeleting}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleDeleteProject}
            className="bg-[--status-danger] hover:bg-[--status-danger-hover]"
            disabled={isDeleting}
          >
            {isDeleting ? 'Deleting...' : 'Delete'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteProjectModal;
