class Tile {
    type;
    static SIZE = new Vector2f([64, 32]);
    constructor() {
    }
    screenPosition(tilePosition) {
        return Tile.screenPosition(tilePosition);
    }
    static screenPosition(tilePosition) {
        return new Vector2f([(tilePosition.x - tilePosition.y) * Tile.SIZE.width / 2 - Tile.SIZE.width / 2, (tilePosition.x + tilePosition.y) * Tile.SIZE.height / 2]);
    }
    tilePosition(screenPosition) {
        return Tile.tilePosition(screenPosition);
    }
    static tilePosition(screen) {
        //screen.x -= Tile.SIZE.width/2;
        // let cell = new Vector2f([Math.floor((screenPosition.x - Tile.SIZE.width/2)/ Tile.SIZE.width), Math.floor(screenPosition.y / Tile.SIZE.height)]);
        // return new Vector2f([cell.y + cell.x, cell.y - cell.x]);
        //(screen.x / TILE_WIDTH_HALF + screen.y / TILE_HEIGHT_HALF) /2;
        //map.y = (screen.y / TILE_HEIGHT_HALF -(screen.x / TILE_WIDTH_HALF)) /2;
        return new Vector2f([Math.floor((screen.x / (Tile.SIZE.width / 2) + screen.y / (Tile.SIZE.height / 2)) / 2),
            Math.floor((screen.y / (Tile.SIZE.height / 2) - screen.x / (Tile.SIZE.width / 2)) / 2)]);
    }
    getEntityPosition(tilePosition, scale) {
        return Tile.getEntityPosition(tilePosition, scale);
    }
    static getEntityPosition(tilePosition, scale) {
        let position = Tile.screenPosition(tilePosition);
        let xOffset = Math.floor((Tile.SIZE.width - scale.x) / 2);
        let yOffset = Math.floor((Tile.SIZE.height / 2 - scale.y));
        return position.add(new Vector2f([xOffset, yOffset]));
    }
}
class TileMap {
    tiles;
    constructor(width, height, floors) {
        this.tiles = [];
        for (let floor = 0; floor < floors; floor++) {
            this.tiles[floor] = [];
            for (let y = 0; y < height; y++) {
                this.tiles[floor][y] = [];
                for (let x = 0; x < width; x++)
                    this.tiles[floor][y][x] = 0;
            }
        }
    }
}
