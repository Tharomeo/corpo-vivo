export type SceneMessage =
  | { type: 'ready' }
  | { type: 'error'; message: string }
  | { type: 'tap'; organ: string | null; system?: string }
  | { type: 'sexo'; sexo: 'f' | 'm' };

// html: outra cena no mesmo formato (ex.: a célula). Padrão: o corpo.
export type BodyViewProps = { onMessage: (msg: SceneMessage) => void; html?: string; titulo?: string };

export type BodyViewHandle = { run: (js: string) => void };
