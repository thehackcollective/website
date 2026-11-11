type Readout = { textContent: string | null }
type FigureEls = { stage: HTMLElement; svg: SVGSVGElement; read: Readout }
export type FigureHandle = { set(value: number): void; destroy(): void }
export type FigureModule = {
  value: number
  mount: (els: FigureEls, value: number) => FigureHandle
}
