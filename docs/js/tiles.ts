class Tile {
    type:TileType;

    static SIZE = new Vector2f([64,32]);

    constructor() {
        
    }

    screenPosition(tilePosition:Vector2f|Vector3f):Vector2f {
        return Tile.screenPosition(tilePosition);
    }

    static screenPosition(tilePosition:Vector2f|Vector3f):Vector2f {
        return new Vector2f([(tilePosition.x - tilePosition.y)*Tile.SIZE.width/2 - Tile.SIZE.width/2, (tilePosition.x + tilePosition.y)*Tile.SIZE.height/2]);
    }

    tilePosition(screenPosition:Vector3f):Vector2f {
        return Tile.tilePosition(screenPosition);
    }

    static tilePosition(screen:Vector2f|Vector3f):Vector2f {
        //screen.x -= Tile.SIZE.width/2;
        // let cell = new Vector2f([Math.floor((screenPosition.x - Tile.SIZE.width/2)/ Tile.SIZE.width), Math.floor(screenPosition.y / Tile.SIZE.height)]);
        // return new Vector2f([cell.y + cell.x, cell.y - cell.x]);
        //(screen.x / TILE_WIDTH_HALF + screen.y / TILE_HEIGHT_HALF) /2;
        //map.y = (screen.y / TILE_HEIGHT_HALF -(screen.x / TILE_WIDTH_HALF)) /2;
        return new Vector2f([Math.floor((screen.x / (Tile.SIZE.width / 2) + screen.y / (Tile.SIZE.height/2)) / 2),
            Math.floor((screen.y / (Tile.SIZE.height / 2) - screen.x / (Tile.SIZE.width/2)) / 2)]);
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