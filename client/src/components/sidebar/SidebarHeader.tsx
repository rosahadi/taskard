import { useAppDispatch, useAppSelector } from '@/app/redux';
import { setIsSidebarCollapsed } from '@/store/global';
import { X } from 'lucide-react';
import Logo from '../Logo';

const SidebarHeader = () => {
  const dispatch = useAppDispatch();
  const isSidebarCollapsed = useAppSelector(
    (state) => state.global.isSidebarCollapsed
  );

  return (
    <div className="flex min-h-[68px] w-64 items-center justify-between bg-[var(--background-quaternary)] border-b border-[var(--border)] px-6 pt-3 pb-3">
      <Logo />
      {!isSidebarCollapsed && (
        <button
          className="p-2 rounded-lg transition-all duration-200 hover:bg-[var(--background-secondary)] group"
          onClick={() => dispatch(setIsSidebarCollapsed(!isSidebarCollapsed))}
        >
          <X className="h-5 w-5 text-[var(--text-muted)] group-hover:text-[var(--text-primary)] transition-colors duration-200" />
        </button>
      )}
    </div>
  );
};

export default SidebarHeader;
