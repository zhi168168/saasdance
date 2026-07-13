import { SignUp } from "@clerk/nextjs";

import { emailOnlyClerkAppearance } from "@/lib/clerk-appearance";

export default function SignUpPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <SignUp
        appearance={emailOnlyClerkAppearance}
        path="/sign-up"
        routing="path"
        signInUrl="/sign-in"
      />
    </div>
  );
}
