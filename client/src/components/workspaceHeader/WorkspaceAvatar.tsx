import Image from 'next/image';
import React from 'react';

const WorkspaceAvatar = ({ name, image }: { name: string; image?: string }) => {
  const firstLetter = name?.charAt(0) || '?';

  if (image) {
    return (
      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[--background-tertiary] overflow-hidden">
        <Image
          src={image}
          alt={name}
          className="w-full h-full object-cover"
          width={96}
          height={96}
        />
      </div>
    );
  }

  return (
    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[--background-tertiary]">
      <span className="text-lg font-semibold text-[--text-primary]">
        {firstLetter}
      </span>
    </div>
  );
};

export default WorkspaceAvatar;
