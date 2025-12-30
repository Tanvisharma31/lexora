"use client"

import * as React from "react"
import { ThemeProvider as NextThemesProvider } from "next-themes"

// specific to next-themes v0.4+ which exports ThemeProviderProps type specifically if needed,
// or we can use React.ComponentProps<typeof NextThemesProvider>
// Looking at package.json, next-themes is ^0.4.6.

export function ThemeProvider({
    children,
    ...props
}: React.ComponentProps<typeof NextThemesProvider>) {
    return <NextThemesProvider {...props}>{children}</NextThemesProvider>
}
