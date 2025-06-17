/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_OPENAI_URI: string
  readonly VITE_OPENAI_KEY: string
  readonly VITE_BACKEND_URI: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

declare module '*.png' {
  const src: string
  export default src
}

declare module '*.gif' {
  const src: string
  export default src
} 