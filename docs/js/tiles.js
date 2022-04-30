class Tile {
    type;
    static SIZE = new Vector2f([64, 32]);
    constructor() {
    }
    toScreen(tilePosition) {
        return Tile.toScreen(tilePosition);
    }
    static toScreen(tilePosition) {
        return new Vector3f([(tilePosition.x - tilePosition.y) * Tile.SIZE.width / 2, (tilePosition.x + tilePosition.y) * Tile.SIZE.height / 2]);
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
    cellPosition(mouse, screenPosition) {
        return new Vector2f([Math.floor(mouse.x / Tile.SIZE.width), Math.floor(mouse.y / Tile.SIZE.height)]);
    }
}
