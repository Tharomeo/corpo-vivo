export type SceneMessage =
  | { type: 'ready' }
  | { type: 'error'; message: string }
  | { type: 'tap'; organ: string | null; system?: string };

export type BodyViewProps = { onMessage: (msg: SceneMessage) => void };

export type BodyViewHandle = { run: (js: string) => void };
