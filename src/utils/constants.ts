import { getNewFood } from "./helpers";
import { Game, GameState } from "./types";

export const KEYS = {
  UP: ["ArrowUp"],
  DOWN: ["ArrowDown"],
  LEFT: ["ArrowLeft"],
  RIGHT: ["ArrowRight"],
  BOOST: ["Space"],
  RELOAD: ["Enter"],
  INVERT: ["KeyC"],
  FREEZE: ["KeyV"]
}

export const validKeys = Object.values(KEYS).flat();

const WIDTH = 30;
const HEIGHT = 30;
const HEAD_X = Math.floor(WIDTH / 2);
const HEAD_Y = Math.floor(HEIGHT / 2);

export const INITIAL_STATE: Game = {
  speed: 100,
  level: 1,
  text: [],
  food: getNewFood(WIDTH, HEIGHT),
  portals: [],
  barriers: [],
  score: 0,
  gameState: GameState.IDLE,
  width: WIDTH,
  height: HEIGHT,
}

export const GAME_OVER = [[7,-13],[8,-13],[12,-13],[15,-13],[19,-13],[21,-13],[22,-13],[23,-13],[6,-12],[11,-12],[13,-12],[15,-12],[16,-12],[18,-12],[19,-12],[21,-12],[6,-11],[11,-11],[13,-11],[15,-11],[17,-11],[19,-11],[21,-11],[6,-10],[8,-10],[9,-10],[11,-10],[12,-10],[13,-10],[15,-10],[19,-10],[21,-10],[22,-10],[6,-9],[9,-9],[11,-9],[13,-9],[15,-9],[19,-9],[21,-9],[7,-8],[8,-8],[11,-8],[13,-8],[15,-8],[19,-8],[21,-8],[22,-8],[23,-8],[8,-5],[9,-5],[12,-5],[14,-5],[16,-5],[17,-5],[18,-5],[20,-5],[21,-5],[7,-4],[10,-4],[12,-4],[14,-4],[16,-4],[20,-4],[22,-4],[7,-3],[10,-3],[12,-3],[14,-3],[16,-3],[20,-3],[22,-3],[7,-2],[10,-2],[12,-2],[14,-2],[16,-2],[17,-2],[20,-2],[21,-2],[7,-1],[10,-1],[12,-1],[14,-1],[16,-1],[20,-1],[22,-1],[8,0],[9,0],[13,0],[16,0],[17,0],[18,0],[20,0],[22,0]];
export const getGameOver = () => JSON.parse(JSON.stringify(GAME_OVER));