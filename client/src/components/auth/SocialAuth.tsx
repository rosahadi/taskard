import { Button } from '@/components/ui/button';
import { FaGoogle } from 'react-icons/fa';
import { useState } from 'react';

const SocialAuth = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGoogleAuth = () => {
    setIsLoading(true);
    setError(null);

    // Redirects to the backend google auth url
    window.location.href = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/users/auth/google`;
  };

  return (
    <>
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-border" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-cardBg px-2 text-textMuted">
            Or continue with
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        <Button
          variant="outline"
          className="bg-background text-textPrimary border-border hover:bg-buttonHover hover:text-buttonText flex items-center justify-center gap-2"
          onClick={handleGoogleAuth}
          disabled={isLoading}
        >
          <FaGoogle className="w-4 h-4" />
          <span>{isLoading ? 'Connecting...' : 'Continue with Google'}</span>
        </Button>

        {error && (
          <p className="text-sm text-destructive text-center mt-2">{error}</p>
        )}
      </div>
    </>
  );
};

export default SocialAuth;
