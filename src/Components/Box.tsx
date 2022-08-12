import React from "react";
import { ItemType } from "../shared/types";

interface BoxProps {
  color?: string | ItemType;
}

export const Box: React.FC<BoxProps> = ({ color }) => {
  const classes = ["game-box"];
  const styles: any = {};
  if (color) {
    switch (color) {
      case ItemType.FOOD: styles.background =`url("https://cdn-icons-png.flaticon.com/512/198/198416.png")`;break;
      case ItemType.JAWS: styles.background = 'url("https://www.svgrepo.com/show/407415/shark.svg")'; break;
      case ItemType.BOOST: styles.background = `url("https://cdn.iconscout.com/icon/premium/png-256-thumb/boost-2-516963.png")`;break;
      case ItemType.FREEZE: styles.background = `url("https://p7.hiclipart.com/preview/664/817/128/computer-icons-royalty-free-freezing-clip-art-snowflake.jpg")`;break;
      case ItemType.INVERT: styles.background = `url("https://cdn0.iconfinder.com/data/icons/arrow-set-3/100/Untitled-4-14-512.png")`; styles.backgroundColor = "white";break;
      default: styles.background = color;
    }
    styles.backgroundSize = "100%";
  }

  return (
    <div className={classes.join(" ")} style={styles} />
  )
}