import * as Pong from "../pong";
import * as BulletHell from "../bullet-hell";
import * as SetGame from "../set";
import * as AsyncChess from "../async-chess/versus";
import * as Stacker from "../stacker";

export const games = [
  { name: "pong", logic: Pong },
  { name: "dodge", logic: BulletHell },
  { name: "set", logic: SetGame },
  { name: "async chess", logic: AsyncChess },
  { name: "stacker", logic: Stacker },
] as const;

export const colors = [
  "#ff0000",
  "#00ff00",
  "#0000ff",
  "#ffff00",
  "#ff00ff",
  "#00ffff",
];

export const charsToChooseFrom = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789 ".split(
  "",
);
