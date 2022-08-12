import React from "react";
import { KEYS, Coordinate, detectCollisions, Game, GAME_OVER, getKey, INITIAL_STATE, validKeys, getGameOver } from "../utils";
import { Box } from "./Box";
import { io, Socket } from "socket.io-client";
import { ServerToClientEvents, ClientToServerEvents, ServerEvents, ClientEvents } from "../shared/SocketTypes";
import "./GameContainer.css";
import { AddedItem, Direction, PlayerInfo, PowerUpType, Score } from "../shared/types";
const socket: Socket<ServerToClientEvents, ClientToServerEvents> = io();

enum ActionType {
  TICK,
  DEAD_ANIMATION,
  UPDATE_DEAD_SNAKE,
  CLEAR_TEXT,
}

interface GameAction {
  type: ActionType;
  payload?: any;
}

const tick = (state: Game, direction: Direction) => {
  const { text } = state;
  const oldSnake = [...text];
  let nextX: number;
  let nextY: number;
  const head = oldSnake[0];
  switch (direction) {
    case Direction.RIGHT: nextX = head[0] + 1; nextY = head[1]; break;
    case Direction.LEFT: nextX = head[0] - 1; nextY = head[1]; break;
    case Direction.UP: nextX = head[0]; nextY = head[1] - 1; break;
    case Direction.DOWN: nextX = head[0]; nextY = head[1] + 1; break;
  }

  const newSnake = [...oldSnake];
  state.text = newSnake;
  newSnake.unshift([nextX, nextY]);

  detectCollisions(state);
}

let deadTimer: NodeJS.Timer;
const deadAnimation = (state: Game, dispatch: React.Dispatch<GameAction>) => {
  const { text, height } = state;
  let newText = [...getGameOver()];
  if (deadTimer) clearInterval(deadTimer);
  deadTimer = setInterval(() => {
    if (newText.every(([_, y]) => y === height - 1)) {
      clearInterval(deadTimer);
      console.log(INITIAL_STATE);
    }
    for (let i = 0; i < newText.length; i++) {
      const [x, y] = newText[i];
      if (y < height - 1) {
        newText[i][1] += 1;
      }
    }
    const action: GameAction = {
      type: ActionType.UPDATE_DEAD_SNAKE,
      payload: newText
    }
    dispatch(action)
  }, 80);
}

const reducer = (state: Game, action: GameAction) => {
  switch (action.type) {
    case ActionType.TICK: {
      tick(state, action.payload.direction);
      return { ...state };
    }
    case ActionType.UPDATE_DEAD_SNAKE: {
      return {
        ...state,
        text: action.payload as Coordinate[],
      }
    }
    case ActionType.CLEAR_TEXT: {
      return {
        ...state,
        text: []
      }
    }
  }
  return state;
}

export interface SnakePiece {
  id: number;
  x: number;
  y: number;
  color: string;
}


export const GameContainer = () => {
  const [state, dispatch] = React.useReducer(reducer, INITIAL_STATE);
  const [snakes, setSnakes] = React.useState<{ [key: string]: AddedItem }>({});
  const [scores, setScores] = React.useState<Score[]>([]);
  const [user, setUser] = React.useState<PlayerInfo>();
  const [username, setUsername] = React.useState<string>("");



  React.useEffect(() => {
    socket.on('connect', () => {

    });

    socket.on(ServerEvents.initializeGame, ({ added }) => {
      setSnakes((s) => {
        const newSnakes = {} as any;
        added.forEach((add) => {
          newSnakes[getKey(add.x, add.y)] = add;
        });
        return newSnakes;
      })
    });

    socket.on(ServerEvents.updatePlayer, (info) => {
      setUser(info);
    })

    socket.on(ServerEvents.updateGame, (updates) => {
      const { added, removed } = updates;
      setSnakes((s) => {
        const newSnakes = { ...s };
        added.forEach((add) => {
          newSnakes[getKey(add.x, add.y)] = add;
        });
        removed.forEach((remove) => {
          delete newSnakes[getKey(remove.x, remove.y)];
        })
        return newSnakes;
      })
    });

    socket.on(ServerEvents.updateScores, (updatedScores) => {
      setScores(updatedScores);
    });

    socket.on(ServerEvents.dead, () => {
      deadAnimation(state, dispatch);
    });

    return () => {
      Object.values(ServerEvents).forEach(key => {
        socket.off(key);
      })
      socket.off("disconnect");
      socket.off("connect");
    }
  }, []);


  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      console.log("testing", e.code)
      if (validKeys.includes(e.code)) {
        e.preventDefault();
        if (KEYS.DOWN.includes(e.code)) {
          socket.emit(ClientEvents.updateDirection, Direction.DOWN);
        }
        else if (KEYS.UP.includes(e.code)) {
          socket.emit(ClientEvents.updateDirection, Direction.UP);
        }
        else if (KEYS.LEFT.includes(e.code)) {
          socket.emit(ClientEvents.updateDirection, Direction.LEFT);
        }
        else if (KEYS.RIGHT.includes(e.code)) {
          socket.emit(ClientEvents.updateDirection, Direction.RIGHT);
        }
        else if (KEYS.BOOST.includes(e.code)) {
          socket.emit(ClientEvents.powerUp, PowerUpType.BOOST);
        }
        else if (KEYS.INVERT.includes(e.code)) {
          socket.emit(ClientEvents.powerUp, PowerUpType.INVERT);
        }
        else if (KEYS.FREEZE.includes(e.code)) {
          socket.emit(ClientEvents.powerUp, PowerUpType.FREEZE);
        }
        else if (KEYS.RELOAD.includes(e.code)) {
          clearInterval(deadTimer);
          dispatch({ type: ActionType.CLEAR_TEXT });
          socket.emit(ClientEvents.restart);
        }
      }
    }

    window.addEventListener("keydown", handleKeyDown, false);

    return () => {
      window.removeEventListener("keydown", handleKeyDown, false);
    }
  }, []);

  React.useEffect(() => {

    const timer = setTimeout(() => {
      if (username.length > 0) {
        socket.emit(ClientEvents.updateUsername, username);
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [username])

  return (
    <>
      <div className="player-container">
        <div className="username">{username || user?.name}</div>
        <div className="player-stats player-scores">
          <div className="player-score">
            Score : {user?.score}
          </div>
          <div className="player-score" >
            {`Boosts: ${user?.powerUps?.boost.count ?? 0} (SPACEBAR)`}
          </div>
          <div className="player-score" >
            {`Inverts: ${user?.powerUps?.invert.count ?? 0} (C)`}
          </div>
          <div className="player-score" >
            {`Freezes: ${user?.powerUps?.freeze.count ?? 0} (V)`}
          </div>
        </div>
      </div>
      <div className="game-container">
        {
          Array.from({ length: state.height }).map((_, y) => (
            <div className="game-row" key={`row-${y}`}>
              {
                Array.from({ length: state.width }).map((_, x) => {
                  const key = getKey(x, y);
                  const snakePiece = snakes[key];
                  if (state.text.find(([x1, y1]) => x1 === x && y1 === y)) {
                    return <Box key={`${key}Text`} color="white" />
                  }
                  return <Box key={`${key}`} color={snakePiece?.color} />
                })
              }
            </div>
          ))
        }
      </div>
      <div className="scores-container">
        <div className="scores-header">
          Scores
        </div>
        <div className="player-scores">
          {
            scores.sort((a, b) => b.score - a.score).map((score, i) =>
              <div key={`Player-${score.id}`} className="player-score">
                {i + 1} -
                <div style={{ background: score.color }} className="game-box player-score-box" />
                {score.name} - {score.score} {score.status}
              </div>
            )
          }
        </div>
      </div>
    </>
  );
}