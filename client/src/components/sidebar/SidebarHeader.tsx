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
    <div className="flex min-h-[68px] w-64 items-center justify-between bg-[--background-quaternary] px-6 pt-3">
      <Logo />
      {!isSidebarCollapsed && (
        <button
          className="py-3"
          onClick={() => dispatch(setIsSidebarCollapsed(!isSidebarCollapsed))}
        >
          <X className="h-5 w-5 text-[--text-primary] hover:text-[--text-secondary]" />
        </button>
      )}
    </div>
  );
};

export default SidebarHeader;
