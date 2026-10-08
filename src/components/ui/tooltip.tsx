"use client"

import * as React from "react"
import { Tooltip as TooltipPrimitive } from "@base-ui/react/tooltip"
import * as stylex from "@stylexjs/stylex"

import { color, radius, shadow, space, text } from "@/tokens/token-consts.stylex"

const styles = stylex.create({
  arrow: {
    backgroundColor: color.ink,
    borderRadius: radius.xs,
    height: "10px",
    transform: "rotate(45deg)",
    width: "10px",
    zIndex: 50,
  },
  popup: {
    backgroundColor: color.ink,
    borderRadius: radius.md,
    boxShadow: shadow.s3,
    color: color.surfaceCard,
    fontFamily: text.fontSans,
    fontSize: text.sizeBodyLg,
    lineHeight: text.leadingBodyLg,
    maxWidth: "20rem",
    opacity: 1,
    outline: "none",
    paddingBlock: space.xs,
    paddingInline: space.sm,
    textAlign: "center",
    textWrap: "balance",
    transform: "scale(1)",
    transformOrigin: "var(--transform-origin)",
    transitionProperty: "opacity, transform",
    transitionDuration: "150ms",
    transitionTimingFunction: "ease-in-out",
    width: "fit-content",
    zIndex: 50,
  },
  popupHidden: {
    opacity: 0,
    transform: "scale(0.95)",
  },
})

const isHidden = (status: string | undefined) =>
  status === "starting" || status === "ending"

function Tooltip(props: React.ComponentProps<typeof TooltipPrimitive.Root>) {
  return (
    <TooltipPrimitive.Provider data-slot="tooltip-provider">
      <TooltipPrimitive.Root data-slot="tooltip" {...props} />
    </TooltipPrimitive.Provider>
  )
}

function TooltipTrigger(
  props: React.ComponentProps<typeof TooltipPrimitive.Trigger>
) {
  return <TooltipPrimitive.Trigger data-slot="tooltip-trigger" {...props} />
}

function TooltipContent({
  align = "center",
  children,
  side = "top",
  sideOffset = 4,
  ...props
}: Omit<React.ComponentProps<typeof TooltipPrimitive.Popup>, "className"> & {
  align?: "start" | "center" | "end"
  side?: "top" | "bottom" | "left" | "right"
  sideOffset?: number
}) {
  const arrowSx = stylex.props(styles.arrow)

  return (
    <TooltipPrimitive.Portal>
      <TooltipPrimitive.Positioner align={align} side={side} sideOffset={sideOffset}>
        <TooltipPrimitive.Popup
          data-slot="tooltip-content"
          className={(state: { transitionStatus?: string }) =>
            stylex.props(styles.popup, isHidden(state.transitionStatus) && styles.popupHidden)
              .className
          }
          {...props}
        >
          {children}
          <TooltipPrimitive.Arrow className={arrowSx.className} style={arrowSx.style} />
        </TooltipPrimitive.Popup>
      </TooltipPrimitive.Positioner>
    </TooltipPrimitive.Portal>
  )
}

export { Tooltip, TooltipContent, TooltipTrigger }
