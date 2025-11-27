import { SignIn } from "@clerk/nextjs"

export default function SignInPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4 dark">
      <div className="liquid rounded-2xl p-8 w-full max-w-md">
        <SignIn 
            appearance={{
            variables: {
              colorPrimary: "oklch(0.5 0.18 250)",
              colorBackground: "oklch(0.12 0.025 250)",
              colorText: "oklch(0.98 0 0)",
              colorInputBackground: "oklch(0.18 0.03 250 / 0.6)",
              colorInputText: "oklch(0.98 0 0)",
              borderRadius: "1rem",
            },
            elements: {
              rootBox: "mx-auto dark",
              card: "liquid shadow-none bg-transparent border-0",
              headerTitle: "text-foreground",
              headerSubtitle: "text-muted-foreground",
              socialButtonsBlockButton: "liquid-subtle hover:liquid-hover",
              formButtonPrimary: "bg-primary hover:bg-primary/90 text-primary-foreground liquid-glow",
              formFieldInput: "liquid-subtle text-foreground border-primary/30",
              formFieldLabel: "text-foreground",
              footerActionLink: "text-light hover:text-light/80",
              socialButtonsBlockButtonText: "text-light",
              footerActionLinkText: "text-light",
            }
          }}
        />
      </div>
    </div>
  )
}

