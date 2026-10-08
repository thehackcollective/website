import * as stylex from "@stylexjs/stylex";

import { color } from "@/tokens/token-consts.stylex";

export const heroFigureStyles = stylex.create({
  stage: {
    "--hairline-edge": color.gray500,
    "--hairline-hi": color.ink,
    "--hairline-lo": color.gray200,
    "--hairline-mid": color.gray300,
    "--hairline-plate": color.surfaceCard,
    "--hairline-stroke": 1,
    aspectRatio: "5 / 4",
    width: "100%",
  },
});
