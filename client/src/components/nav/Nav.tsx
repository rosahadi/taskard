'use client';

import React, { useEffect, useState } from 'react';
import Logo from './Logo';
import { ModeToggle } from './ModeToggle';

const Nav = () => {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 w-full bg-[--background-quaternary] transition-shadow duration-200 z-50 ${
        isScrolled ? 'shadow-lg shadow-[var(--shadow-light)]' : ''
      }`}
    >
      <div className="flex items-center justify-between px-7 py-4">
        {/* Logo */}
        <Logo />

        {/* Theme Toggle */}
        <ModeToggle />
      </div>
    </nav>
  );
};

export default Nav;
