import { Button } from '../ui/button';

const SocialAuth = () => {
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
          className="bg-background text-textPrimary border-border hover:bg-buttonHover hover:text-buttonText"
        >
          Google
        </Button>
      </div>
    </>
  );
};

export default SocialAuth;
