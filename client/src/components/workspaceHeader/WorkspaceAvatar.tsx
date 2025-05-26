import Image from 'next/image';
import React from 'react';

const WorkspaceAvatar = ({ name, image }: { name: string; image?: string }) => {
  const firstLetter = name?.charAt(0) || '?';

  if (image) {
    return (
      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--background-tertiary)] border border-[var(--border)] transition-all duration-200 shadow-sm hover:shadow-md overflow-hidden p-0">
        <Image
          src={image}
          alt={name}
          className="w-full h-full object-cover"
          width={40}
          height={40}
          referrerPolicy="no-referrer"
        />
      </div>
    );
  }

  return (
    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--background-tertiary)] border border-[var(--border)] transition-all duration-200 shadow-sm hover:shadow-md">
      <span className="text-sm font-semibold text-[var(--text-primary)]">
        {firstLetter.toUpperCase()}
      </span>
    </div>
  );
};

export default WorkspaceAvatar;
