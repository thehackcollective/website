import { type EffectCallback, useEffect, useRef } from "react";

export function useMountEffect(effect: EffectCallback) {
  const initial = useRef(effect);
  useEffect(() => initial.current(), []);
}
