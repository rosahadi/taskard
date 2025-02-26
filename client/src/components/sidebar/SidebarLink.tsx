import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LucideIcon } from 'lucide-react';

interface SidebarLinkProps {
  href: string;
  icon: LucideIcon;
  label: string;
}

const SidebarLink = ({ href, icon: Icon, label }: SidebarLinkProps) => {
  const pathname = usePathname();
  const isActive =
    pathname === href || (pathname === '/' && href === '/dashboard');

  return (
    <Link href={href} className="w-full">
      <div
        className={`relative flex items-center gap-3 px-8 py-3 transition-colors hover:bg-[--background-tertiary] ${
          isActive ? 'bg-[--background-secondary]' : ''
        }`}
      >
        {isActive && (
          <div className="absolute left-0 top-0 h-full w-[5px] bg-[--primary]" />
        )}
        <Icon className="h-6 w-6 text-[--text-primary]" />
        <span className="font-medium text-[--text-primary]">{label}</span>
      </div>
    </Link>
  );
};

export default SidebarLink;
