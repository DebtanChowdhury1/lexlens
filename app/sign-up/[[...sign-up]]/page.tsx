import { SignUp } from '@clerk/nextjs';

export default function SignUpPage() {
  return (
    <div className="min-h-screen bg-[#0A0A0F] flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-[#F8FAFC] mb-2" style={{ fontFamily: 'Syne, sans-serif' }}>
            Start protecting yourself
          </h1>
          <p className="text-[#94A3B8]">Create your free LexLens account</p>
        </div>
        <SignUp />
      </div>
    </div>
  );
}
