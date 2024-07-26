// state seperated out for HMR
import { colors } from "./constants";

export function createState() {
  return {
    menu: "controller" as "controller" | "game",

    playerInfo: Array(4)
      .fill(null)
      .map((_, i) => ({
        name: `P${i + 1}  `.split(""),
        nameIndexEditing: 0,

        color: colors[i],
      })),

    game: null as null | number,
    index: 0,
    animatedIndex: 0,
  };
}

export type State = ReturnType<typeof createState>;
