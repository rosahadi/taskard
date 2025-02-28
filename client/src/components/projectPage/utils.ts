// Helper function to format status labels
export const formatStatus = (status: string) => {
  return status
    .replace(/_/g, ' ')
    .toLowerCase()
    .replace(/\b\w/g, (l) => l.toUpperCase());
};

// Helper function to format priority labels
export const formatPriority = (priority: string) => {
  return priority
    .replace(/_/g, ' ')
    .toLowerCase()
    .replace(/\b\w/g, (l) => l.toUpperCase());
};
