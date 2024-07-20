/*
it would be really nice to have a transparent pause overlay:

SCREEN:

PAUSED

> resume
- exit to menu

every game needs the ability to pause, i guess i implement it in menu?
*/

// ----------

// games need to skip their update while paused (but still draw!)
export let paused = false;

export function setPause(newPaused: boolean) {
  paused = newPaused;
}
