import {
  Calendar,
  Filter,
  Grid3x3,
  List,
  Plus,
  Search,
  Flag,
} from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { Button } from '@/components/ui/button';
import CreateTaskDialog from './components/CreateTaskDialog';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from '@/components/ui/select';
import { Priority, TaskStatus } from '@/store/taskApi';
import { formatPriority, formatStatus } from './utils';

type Props = {
  projectName: string;
  startDate: string | undefined;
  endDate: string | undefined;
  activeTab: string;
  setActiveTab: (tabName: string) => void;
  projectId: number;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  selectedStatus: string;
  setSelectedStatus: (status: string) => void;
  selectedPriority: string;
  setSelectedPriority: (priority: string) => void;
};

const ProjectHeader = ({
  projectName,
  startDate,
  endDate,
  activeTab,
  setActiveTab,
  projectId,
  searchTerm,
  setSearchTerm,
  selectedStatus,
  setSelectedStatus,
  selectedPriority,
  setSelectedPriority,
}: Props) => {
  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return 'Not set';
    try {
      const date = parseISO(dateString);
      return format(date, 'MMM d, yyyy');
    } catch {
      return 'Invalid date';
    }
  };

  const formattedStartDate = formatDate(startDate);
  const formattedEndDate = formatDate(endDate);

  return (
    <div className="px-4 xl:px-6 bg-[--background-primary]">
      <div className="pb-6 pt-6 lg:pb-4 lg:pt-8">
        <h1 className="text-2xl font-semibold text-[var(--text-primary)]">
          {projectName}
        </h1>
        <p className="mt-2 text-[var(--text-muted)]">
          Start Date:{' '}
          <span className="text-[var(--text-primary)]">
            {formattedStartDate}
          </span>{' '}
          | End Date:{' '}
          <span className="text-[var(--text-primary)]">{formattedEndDate}</span>
        </p>
      </div>

      {/* TABS */}
      <div className="flex flex-wrap-reverse gap-2 border-y border-[var(--card-border)] pb-[8px] pt-2 md:items-center">
        <div className="flex flex-1 items-center gap-2 md:gap-4">
          <TabButton
            name="Board"
            icon={<Grid3x3 className="h-5 w-5" />}
            setActiveTab={setActiveTab}
            activeTab={activeTab}
          />
          <TabButton
            name="List"
            icon={<List className="h-5 w-5" />}
            setActiveTab={setActiveTab}
            activeTab={activeTab}
          />
          <TabButton
            name="Calendar"
            icon={<Calendar className="h-5 w-5" />}
            setActiveTab={setActiveTab}
            activeTab={activeTab}
          />
        </div>

        {/* Search and filter bar */}
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search
              className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400"
              size={18}
            />
            <Input
              placeholder="Search tasks..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>

          <div className="flex gap-2">
            <Select
              onValueChange={setSelectedStatus}
              value={selectedStatus || 'NONE'}
            >
              <SelectTrigger className="w-[150px]">
                <div className="flex items-center gap-2">
                  <Filter size={16} />
                  <span>
                    {selectedStatus === 'ALL'
                      ? 'All Statuses'
                      : formatStatus(selectedStatus)}
                  </span>
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Statuses</SelectItem>
                {Object.values(TaskStatus).map((status) => (
                  <SelectItem key={status} value={status}>
                    {formatStatus(status)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              onValueChange={setSelectedPriority}
              value={selectedPriority || 'NONE'}
            >
              <SelectTrigger className="w-[150px]">
                <div className="flex items-center gap-2">
                  <Flag size={16} />
                  <span>
                    {selectedPriority === 'ALL'
                      ? 'All Priority'
                      : formatStatus(selectedPriority)}
                  </span>
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Priorities</SelectItem>
                {Object.values(Priority).map((priority) => (
                  <SelectItem key={priority} value={priority}>
                    {formatPriority(priority)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <CreateTaskDialog projectId={projectId}>
              <Button
                className="bg-[var(--button-bg)] hover:bg-[var(--button-hover)] text-[var(--button-text)]"
                size="sm"
              >
                <Plus className="mr-2 h-4 w-4" />
                Create Task
              </Button>
            </CreateTaskDialog>
          </div>
        </div>
      </div>
    </div>
  );
};

type TabButtonProps = {
  name: string;
  icon: React.ReactNode;
  setActiveTab: (tabName: string) => void;
  activeTab: string;
};

const TabButton = ({ name, icon, setActiveTab, activeTab }: TabButtonProps) => {
  const isActive = activeTab === name;

  return (
    <button
      className={`relative flex items-center gap-2 px-1 py-2 after:absolute after:-bottom-[9px] after:left-0 after:h-[1px] after:w-full sm:px-2 lg:px-4 
        ${
          isActive
            ? 'text-[var(--primary)]'
            : 'text-[var(--text-muted)] hover:text-[var(--primary)]'
        }`}
      onClick={() => setActiveTab(name)}
    >
      <span className={isActive ? 'text-[var(--primary)]' : ''}>{icon}</span>
      {name}
    </button>
  );
};

export default ProjectHeader;
