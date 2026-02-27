import { SignUp } from '@clerk/nextjs';

export default function SignUpPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-surface bg-grid">
      <div className="relative z-10">
        <SignUp />
      </div>
    </div>
  );
}
