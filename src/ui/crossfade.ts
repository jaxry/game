import type { EasingFunction, TransitionConfig } from 'svelte/transition'
import { assign, is_function } from 'svelte/internal'
import { cubicOut } from 'svelte/easing'

// Grabbed from the Svelte source code
// https://github.com/sveltejs/svelte/blob/master/src/runtime/transition/index.ts
// simply changed the duration to accept a function and not just a number

type ClientRectMap = Map<any, { rect: DOMRect }>;

interface CrossfadeParams {
  delay?: number | (() => number);
  duration?: number | ((len: number) => number);
  easing?: EasingFunction;
}

export default function crossfade({ fallback, ...defaults }: CrossfadeParams & {
  fallback?: (node: Element, params: CrossfadeParams, intro: boolean) => TransitionConfig;
}): [
  (
      node: Element,
      params: CrossfadeParams & {
        key: any;
      }
  ) => () => TransitionConfig,
  (
      node: Element,
      params: CrossfadeParams & {
        key: any;
      }
  ) => () => TransitionConfig
] {
  const to_receive: ClientRectMap = new Map();
  const to_send: ClientRectMap = new Map();

  function crossfade(from: ClientRect, node: Element, params: CrossfadeParams): TransitionConfig {
    const {
      delay = 0,
      duration = d => Math.sqrt(d) * 30,
      easing = cubicOut
    } = assign(assign({}, defaults), params);

    const to = node.getBoundingClientRect();
    const dx = from.left - to.left;
    const dy = from.top - to.top;
    const dw = from.width / to.width;
    const dh = from.height / to.height;
    const d = Math.sqrt(dx * dx + dy * dy);

    const style = getComputedStyle(node);
    const transform = style.transform === 'none' ? '' : style.transform;
    const opacity = +style.opacity;

    return {
      delay: is_function(delay) ? delay() : delay,
      duration: is_function(duration) ? duration(d) : duration,
      easing,
      css: (t, u) => `
				opacity: ${t * opacity};
				transform-origin: top left;
				transform: ${transform} translate(${u * dx}px,${u * dy}px) scale(${t + (1 - t) * dw}, ${t + (1 - t) * dh});
			`
    };
  }

  function transition(items: ClientRectMap, counterparts: ClientRectMap, intro: boolean) {
    return (node: Element, params: CrossfadeParams & { key: any }) => {
      items.set(params.key, {
        rect: node.getBoundingClientRect()
      });

      return () => {
        if (counterparts.has(params.key)) {
          const { rect } = counterparts.get(params.key);
          counterparts.delete(params.key);

          return crossfade(rect, node, params);
        }

        // if the node is disappearing altogether
        // (i.e. wasn't claimed by the other list)
        // then we need to supply an outro
        items.delete(params.key);
        return fallback && fallback(node, params, intro);
      };
    };
  }

  return [
    transition(to_send, to_receive, false),
    transition(to_receive, to_send, true)
  ];
}