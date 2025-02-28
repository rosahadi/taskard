import { Calendar, Filter, Grid3x3, List, Search } from 'lucide-react';
import { format, parseISO } from 'date-fns';

type Props = {
  projectName: string;
  startDate: string | undefined;
  endDate: string | undefined;
  activeTab: string;
  setActiveTab: (tabName: string) => void;
};

const ProjectHeader = ({
  projectName,
  startDate,
  endDate,
  activeTab,
  setActiveTab,
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
    <div className="px-4 xl:px-6">
      <div className="pb-6 pt-6 lg:pb-4 lg:pt-8">
        <h1 className="text-2xl font-semibold dark:text-white">
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
      <div className="flex flex-wrap-reverse gap-2 border-y border-[var(--border)] pb-[8px] pt-2 dark:border-[var(--border)] md:items-center">
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
        <div className="flex items-center gap-6">
          <button className="text-[var(--text-muted)] hover:text-[var(--link-color)]">
            <Filter className="h-5 w-5" />
          </button>
          <div className="relative">
            <input
              type="text"
              placeholder="Search Task"
              className="rounded-md border border-[var(--border)] py-1 pl-10 pr-4 focus:outline-none dark:border-[var(--border)] dark:bg-[var(--background-secondary)] dark:text-white"
            />
            <Search className="absolute left-3 top-2 h-4 w-4 text-[var(--text-muted)]" />
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
            ? 'text-[var(--link-color)]'
            : 'text-[var(--text-muted)] hover:text-[var(--link-color)] dark:hover:text-white'
        }`}
      onClick={() => setActiveTab(name)}
    >
      <span className={isActive ? 'text-[var(--link-color)] ' : ''}>
        {icon}
      </span>
      {name}
    </button>
  );
};

export default ProjectHeader;
