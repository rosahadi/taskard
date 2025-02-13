import { CheckCircle2 } from 'lucide-react';
import AuthCard from './AuthCard';
import { Alert, AlertDescription } from '../ui/alert';
import Link from 'next/link';

const VerificationSuccess = () => {
  return (
    <AuthCard title="Email Verification Complete">
      <div className="flex flex-col items-center space-y-6 py-4">
        {/* Success Icon  */}
        <CheckCircle2 className="h-16 w-16 text-success  relative" />

        {/* Success Message */}
        <div className="space-y-3 text-center">
          <h2 className="text-xl font-semibold text-[var(--text-primary)]">
            You&apos;re all set!
          </h2>
          <Alert className="bg-[var(--background-secondary)] border-[var(--border)]">
            <AlertDescription className="text-[var(--text-secondary)]">
              Your email has been successfully verified. You can now access all
              features of your account.
            </AlertDescription>
          </Alert>
        </div>

        {/* Action Button */}
        <Link
          href="/"
          className="flex items-center justify-center w-full gap-2 px-5 py-2 rounded-lg bg-[var(--button-bg)] hover:bg-[var(--button-hover)] text-[var(--button-text)] transition-colors duration-200 font-medium"
        >
          Return to Homepage
        </Link>
      </div>
    </AuthCard>
  );
};

export default VerificationSuccess;
