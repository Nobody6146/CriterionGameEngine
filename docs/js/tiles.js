class Tile {
    type;
    constructor() {
    }
}
class TileMap {
    tiles;
    constructor(width, height, floors) {
        this.tiles = [];
        for (let floor = 0; floor < floors; floor++) {
            this.tiles[floor] = [];
            for (let x = 0; x < width; x++) {
                this.tiles[floor][x] = [];
                for (let y = 0; y < height; y++)
                    this.tiles[floor][x][y] = 0;
            }
        }
    }
}