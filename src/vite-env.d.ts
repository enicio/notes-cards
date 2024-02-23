/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly VITE_TURSO_SYNC_URL: string
    readonly VITE_TURSO_TOKEN: string
    readonly VITE_CLERK_PUBLISHABLE_KEY: string
  }

  interface ImportMeta {
    readonly env: ImportMetaEnv
  }