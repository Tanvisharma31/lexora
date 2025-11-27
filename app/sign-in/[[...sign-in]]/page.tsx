import { SignIn } from "@clerk/nextjs"

export default function SignInPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="liquid rounded-2xl p-8 w-full max-w-md">
        <SignIn 
          appearance={{
            elements: {
              rootBox: "mx-auto",
              card: "liquid shadow-none bg-transparent",
            }
          }}
        />
      </div>
    </div>
  )
}

