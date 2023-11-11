// -----------------  Utils  -----------------
type Values<T> = T[keyof T]

export type TypedCallParams<
  CTypings extends Record<string, any>,
  C extends keyof CTypings,
> = CTypings[C] extends undefined ? [call: C] : [call: C, data: CTypings[C]]

// ------------  Playback State  ------------
export type PlayState = {
  playing: boolean
  progress: number
  looping: boolean
}

// ------------  Worker Call Types  ------------
export type WorkerCallTypings = {
  ["setCheckpoints"]: number[]
  ["setPlayState"]: Partial<PlayState>
  ["requestPlayState"]: undefined
}
export type WorkerCall = keyof WorkerCallTypings

export type WorkerCallData = Values<
  {
    [Call in WorkerCall]: [Call, WorkerCallTypings[Call]]
  }
>

// ------------  Browser Call Types  ------------
export type BrowserCallTypings = {
  "reachedCheckpoint": number
  "reportPlayState": PlayState
}
export type BrowserCall = keyof BrowserCallTypings

export type BrowserCallData = Values<
  {
    [Call in BrowserCall]: [Call, BrowserCallTypings[Call]]
  }
>
