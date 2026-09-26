export interface MetroConfig {
  resolver?: {
    resolveRequest?: (
      context: MetroContext,
      moduleName: string,
      platform: string | null,
    ) => unknown
  }
  projectRoot?: string
}

export interface MetroContext {
  projectRoot?: string
  resolveRequest: (
    context: MetroContext,
    moduleName: string,
    platform: string | null,
  ) => unknown
}
