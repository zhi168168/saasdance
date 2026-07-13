import { SignIn } from "@clerk/nextjs";

import { emailOnlyClerkAppearance } from "@/lib/clerk-appearance";

export default function SignInPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <SignIn
        appearance={emailOnlyClerkAppearance}
        path="/sign-in"
        routing="path"
        signUpUrl="/sign-up"
      />
    </div>
  );
}
