class Tile {
    type:TileType;

    static SIZE = new Vector2f([64,32]);

    constructor() {
        
    }

    toScreen(tilePosition:Vector2f) {
        return Tile.toScreen(tilePosition);
    }

    static toScreen(tilePosition:Vector2f) {
        return new Vector3f([(tilePosition.x - tilePosition.y)*Tile.SIZE.width/2, (tilePosition.x + tilePosition.y)*Tile.SIZE.height/2]);
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

    cellPosition(mouse:Vector2f, screenPosition:Vector2f) {
        return new Vector2f([Math.floor(mouse.x / Tile.SIZE.width), Math.floor(mouse.y / Tile.SIZE.height)]);
    }
}