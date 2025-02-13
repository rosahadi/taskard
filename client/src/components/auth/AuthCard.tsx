import React from 'react';

import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from '@/components/ui/card';
import Link from 'next/link';

interface AuthCardProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  footerLink?: string;
  footerText?: string;
  footerLinkText?: string;
}
const AuthCard: React.FC<AuthCardProps> = ({
  title,
  subtitle,
  footerLink,
  footerText,
  footerLinkText,
  children,
}) => {
  return (
    <Card className="w-full max-w-md mx-auto bg-cardBg">
      <CardHeader>
        <CardTitle className="text-textPrimary text-lg">{title}</CardTitle>
        {subtitle && <p className="text-textSecondary text-sm">{subtitle}</p>}
      </CardHeader>
      <CardContent>{children}</CardContent>
      {footerLink && (
        <CardFooter className="justify-center">
          <p className="text-sm text-textSecondary">
            {footerText}{' '}
            <Link href={footerLink} className="text-primary hover:underline">
              {footerLinkText}
            </Link>
          </p>
        </CardFooter>
      )}
    </Card>
  );
};
export default AuthCard;
