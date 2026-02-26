import { SignIn } from '@clerk/nextjs';

export default function SignInPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-surface bg-grid">
      <div className="relative z-10">
        <SignIn />
      </div>
    </div>
  );
}
