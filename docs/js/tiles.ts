class Tile {
    type:TileType;

    static SIZE = new Vector2f([64,32]);

    constructor() {
        
    }
}

type TileType = "empty" | "solid";

class TileMap {
    tiles:number[][][];

    constructor(width:number, height:number, floors:number) {
        this.tiles = [];
        for(let floor = 0; floor < floors; floor++) {
            this.tiles[floor] = [];
            for(let y = 0; y < height; y++){
                this.tiles[floor][y] = [];
                for(let x = 0; x < width; x++) 
                    this.tiles[floor][y][x] = 0;
            }
        }
    }
}