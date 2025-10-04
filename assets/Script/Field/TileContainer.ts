/**
 * Контейнер для управления тайлами на игровом поле
 */

const { ccclass, property } = cc._decorator;

import { GameConfig, Position, TileState, TileType } from "../Core/GameState";
import { TileFactory } from "../Tiles/TileFactory";
import { Tile } from "../Tiles/Tile";
import { TileConfig } from "../Tiles/TileTypes";
import { EventSystem, Events } from "../Core/EventSystem";
import { BoosterSystem } from "../Boosters/BoosterSystem";
import { PositionUtils } from "../Utils/PositionUtils";
import { TileAreaUtils } from "../Utils/TileAreaUtils";
import { WorldPositionUtils } from "../Utils/WorldPositionUtils";

@ccclass
export class TileContainer extends cc.Component {
    @property(cc.Prefab)
    tilePrefab: cc.Prefab = null!;

    @property(BoosterSystem)
    boosterSystem: BoosterSystem = null!;

    private config!: GameConfig;
    private tiles: Tile[][] = [];
    private eventSystem!: EventSystem;
    private wasSuperTileActivation: boolean = false;
    
    private boundOnTileClicked!: (data?: Position) => void;
    private boundOnBombExecute!: (data?: { positions?: Position[]; center?: Position }) => void;
    private boundOnTeleportExecute!: (data?: { position1?: Position; position2?: Position }) => void;
    private boundOnTilesDestroyed!: (data?: Position[]) => void;

    onLoad() {
        this.eventSystem = EventSystem.getInstance();
        this.setupEventListeners();
    }

    private setupEventListeners(): void {
        this.boundOnTileClicked = this.onTileClicked.bind(this);
        this.boundOnBombExecute = this.onBombExecute.bind(this);
        this.boundOnTeleportExecute = this.onTeleportExecute.bind(this);
        this.boundOnTilesDestroyed = this.onTilesDestroyed.bind(this);
        
        this.eventSystem.on(Events.TILE_CLICKED, this.boundOnTileClicked);
        this.eventSystem.on(Events.BOOSTER_BOMB_EXECUTE, this.boundOnBombExecute);
        this.eventSystem.on(Events.BOOSTER_TELEPORT_EXECUTE, this.boundOnTeleportExecute);
        this.eventSystem.on(Events.TILES_DESTROYED, this.boundOnTilesDestroyed);
    }

    public initializeContainer(config: GameConfig): void {
        this.config = config;
        
        this.clearAllTiles();
        
        this.createTileGrid();
        this.generateInitialTiles();
    }

    private clearAllTiles(): void {
        this.node.removeAllChildren();
        
        if (this.tiles) {
            for (let x = 0; x < this.tiles.length; x++) {
                for (let y = 0; y < this.tiles[x].length; y++) {
                    if (this.tiles[x][y]) {
                        this.tiles[x][y].destroyTile();
                        this.tiles[x][y] = null!;
                    }
                }
            }
        }
        
        this.tiles = [];
    }

    public refreshEntireField(): void {
        this.clearAllTiles();
        
        this.createTileGrid();
        this.generateInitialTiles();
    }

    public shuffleField(): void {
        this.clearAllTiles();
        
        this.createTileGrid();
        this.generateInitialTiles();
    }

    private createTileGrid(): void {
        this.tiles = [];
        for (let x = 0; x < this.config.fieldWidth; x++) {
            this.tiles[x] = [];
            for (let y = 0; y < this.config.fieldHeight; y++) {
                this.tiles[x][y] = null!;
            }
        }
    }

    private generateInitialTiles(): void {
        for (let x = 0; x < this.config.fieldWidth; x++) {
            for (let y = 0; y < this.config.fieldHeight; y++) {
                this.createTileAt({ x, y });
            }
        }
    }

    private createTileAt(position: Position): void {
        if (!this.tilePrefab) {
            return;
        }

        const tileConfig = TileFactory.createRandomTile(position);
        const tileNode = cc.instantiate(this.tilePrefab);
        const tileComponent = tileNode.getComponent(Tile);
        
        if (tileComponent) {
            tileComponent.initialize(tileConfig);
            this.tiles[position.x][position.y] = tileComponent;
        }

        if (this.node) {
            tileNode.setParent(this.node);
            const worldPos = this.getWorldPosition(position);
            tileNode.setPosition(worldPos);
        }
    }

    private getWorldPosition(position: Position): cc.Vec2 {
        return WorldPositionUtils.getWorldPosition(position);
    }

    private onTileClicked(data?: Position): void {
        if (!data) return;
        const position = data;
        const tile = this.getTileAt(position);
        if (!tile) {
            return;
        }

        if (!tile.canBeClicked()) {
            return;
        }

        if (this.boosterSystem && this.boosterSystem.isBoosterActive()) {
            return;
        }

        if (this.isSuperTile(tile)) {
            this.activateSuperTile(tile, position);
            return;
        }

        this.findAndBurnGroup(position);
    }

    private getTileAt(position: Position): Tile | null {
        if (this.isValidPosition(position) && this.tiles[position.x]) {
            return this.tiles[position.x][position.y];
        }
        return null;
    }

    private isValidPosition(position: Position): boolean {
        return PositionUtils.isValidPosition(position);
    }

    private isValidPositionXY(x: number, y: number): boolean {
        return PositionUtils.isValidPositionXY(x, y);
    }

    private findAndBurnGroup(position: Position): void {
        const clickedTile = this.getTileAt(position);
        if (!clickedTile) return;

        const group = this.findConnectedTiles(position, clickedTile.type);
        if (group.length >= 2) {
            this.burnTiles(group);
            this.eventSystem.emit(Events.GROUP_BURNED_SUCCESSFULLY);
        }
    }

    private findConnectedTiles(startPosition: Position, tileType: string): Position[] {
        const visited: boolean[][] = [];
        const result: Position[] = [];
        
        for (let x = 0; x < this.config.fieldWidth; x++) {
            visited[x] = [];
            for (let y = 0; y < this.config.fieldHeight; y++) {
                visited[x][y] = false;
            }
        }

        this.floodFill(startPosition, tileType, visited, result);
        return result;
    }

    private floodFill(position: Position, tileType: string, visited: boolean[][], result: Position[]): void {
        if (!this.isValidPosition(position) || visited[position.x][position.y]) return;
        
        const tile = this.getTileAt(position);
        if (!tile || tile.type !== tileType) return;

        visited[position.x][position.y] = true;
        result.push(position);

        const directions = [
            { x: 0, y: 1 }, { x: 0, y: -1 },
            { x: 1, y: 0 }, { x: -1, y: 0 }
        ];

        for (const dir of directions) {
            const newPos = { x: position.x + dir.x, y: position.y + dir.y };
            this.floodFill(newPos, tileType, visited, result);
        }
    }

    private burnTiles(positions: Position[]): void {
        this.eventSystem.emit(Events.TILES_BURNED, positions);
    }

    private onTilesDestroyed(data?: Position[]): void {
        if (!data) return;
        const positions = data;
        this.destroyTilesAfterAnimation(positions);
    }

    private destroyTilesAfterAnimation(positions: Position[]): void {
        for (const pos of positions) {
            const tile = this.getTileAt(pos);
            if (tile) {
                tile.setState(TileState.BURNING);
                tile.destroyTile();
                this.tiles[pos.x][pos.y] = null!;
            }
        }
        
        if (positions.length >= 4 && !this.wasSuperTileActivation) {
            this.createSuperTile(positions[0], positions.length);
        }
        
        this.wasSuperTileActivation = false;
        
        this.scheduleOnce(() => {
            this.processGravity();
        }, 0.05);
    }

    private processGravity(): void {
        this.applyGravity();
        
        this.fillEmptySpaces();
    }

    private applyGravity(): void {
        for (let x = 0; x < this.config.fieldWidth; x++) {
            this.processColumn(x);
        }
    }

    private processColumn(column: number): void {
        const columnTiles: Tile[] = [];
        
        for (let y = this.config.fieldHeight - 1; y >= 0; y--) {
            const tile = this.tiles[column][y];
            if (tile) {
                columnTiles.push(tile);
            }
        }
        
        for (let y = 0; y < this.config.fieldHeight; y++) {
            this.tiles[column][y] = null!;
        }
        
        for (let i = 0; i < columnTiles.length; i++) {
            const newY = this.config.fieldHeight - 1 - i;
            this.tiles[column][newY] = columnTiles[i];
            
            const newPosition = { x: column, y: newY };
            columnTiles[i].position = newPosition;
            
            this.animateTileFall(columnTiles[i], newPosition);
        }
    }

    private fillEmptySpaces(): void {
        const emptyPositions: Position[] = [];
        for (let x = 0; x < this.config.fieldWidth; x++) {
            for (let y = 0; y < this.config.fieldHeight; y++) {
                if (!this.tiles[x][y]) {
                    emptyPositions.push({ x, y });
                }
            }
        }
        
        this.scheduleOnce(() => {
            this.animateNewTilesCreation(emptyPositions);
        }, 0.1);
    }

    private animateNewTilesCreation(positions: Position[]): void {
        for (let i = 0; i < positions.length; i++) {
            const pos = positions[i];
            this.createTileAt(pos);
            const tile = this.getTileAt(pos);
            
            if (tile) {
                const targetWorldPos = this.getWorldPosition(pos);
                const startY = targetWorldPos.y + 200;
                tile.node.y = startY;
                
                const tween = cc.tween(tile.node)
                    .to(0.2, { position: cc.v3(targetWorldPos.x, targetWorldPos.y, 0) })
                    .start();
                
                const stopTween = () => {
                    if (tween) {
                        tween.stop();
                    }
                };
                
                tile.node.on('destroy', stopTween);
                tile.node.on('remove', stopTween);
            }
        }
    }

    private animateTileFall(tile: Tile, newPosition: Position): void {
        const worldPos = this.getWorldPosition(newPosition);
        const tween = cc.tween(tile.node)
            .to(0.15, { position: cc.v3(worldPos.x, worldPos.y, 0) })
            .start();
        
        const stopTween = () => {
            if (tween) {
                tween.stop();
            }
        };
        
        tile.node.on('destroy', stopTween);
        tile.node.on('remove', stopTween);
    }

    private createSuperTile(position: Position, groupSize: number): void {
        const superTileType = this.getSuperTileType(groupSize);
        if (superTileType === TileType.BLUE) return;
        
        const tileConfig: TileConfig = {
            type: superTileType,
            position: position,
            isSpecial: true,
            specialType: superTileType
        };
        
        const tileNode = cc.instantiate(this.tilePrefab);
        const tileComponent = tileNode.getComponent(Tile);
        
        if (tileComponent) {
            tileComponent.initialize(tileConfig);
            this.tiles[position.x][position.y] = tileComponent;
        }

        tileNode.setParent(this.node);
        const worldPos = this.getWorldPosition(position);
        tileNode.setPosition(worldPos);
    }

    private getSuperTileType(groupSize: number): TileType {
        if (groupSize >= 8) {
            return TileType.SUPER_BOMB_MAX;
        } else if (groupSize >= 6) {
            return TileType.SUPER_BOMB;
        } else if (groupSize >= 4) {
            return Math.random() < 0.5 ? TileType.SUPER_ROW : TileType.SUPER_COLUMN;
        }
        return TileType.BLUE;
    }

    private isSuperTile(tile: Tile): boolean {
        return tile.type === TileType.SUPER_ROW || 
               tile.type === TileType.SUPER_COLUMN ||
               tile.type === TileType.SUPER_BOMB ||
               tile.type === TileType.SUPER_BOMB_MAX;
    }

    private activateSuperTile(tile: Tile, position: Position): void {
        if (tile.state === TileState.BURNING) {
            return;
        }
        
        tile.setState(TileState.BURNING);
        
        this.wasSuperTileActivation = true;
        
        let tilesToDestroy: Position[] = [];
        
        switch (tile.type) {
            case TileType.SUPER_ROW:
                tilesToDestroy = this.getTilesInRow(position.y);
                break;
            case TileType.SUPER_COLUMN:
                tilesToDestroy = this.getTilesInColumn(position.x);
                break;
            case TileType.SUPER_BOMB:
                tilesToDestroy = this.getTilesInRadius(position.x, position.y, 1);
                break;
            case TileType.SUPER_BOMB_MAX:
                const rowTiles = this.getTilesInRow(position.y);
                const columnTiles = this.getTilesInColumn(position.x);
                tilesToDestroy = this.mergeTilePositions(rowTiles, columnTiles);
                break;
        }
        
        if (tilesToDestroy.length > 0) {
            tilesToDestroy.push(position);
            this.burnTiles(tilesToDestroy);
            this.eventSystem.emit(Events.GROUP_BURNED_SUCCESSFULLY);
        }
    }


    private getTilesInRow(row: number): Position[] {
        const tiles: Position[] = [];
        for (let x = 0; x < this.config.fieldWidth; x++) {
            if (this.tiles[x][row]) {
                tiles.push({ x, y: row });
            }
        }
        return tiles;
    }

    private getTilesInColumn(column: number): Position[] {
        const tiles: Position[] = [];
        for (let y = 0; y < this.config.fieldHeight; y++) {
            if (this.tiles[column][y]) {
                tiles.push({ x: column, y });
            }
        }
        return tiles;
    }

    private getTilesInRadius(centerX: number, centerY: number, radius: number): Position[] {
        return TileAreaUtils.getTilesInRadius({ x: centerX, y: centerY }, radius);
    }

    private mergeTilePositions(tiles1: Position[], tiles2: Position[]): Position[] {
        return TileAreaUtils.mergeTilePositions(tiles1, tiles2);
    }

    private onBombExecute(data?: { positions?: Position[]; center?: Position }): void {
        if (!data) return;
        if (data.positions && data.positions.length > 0) {
            this.burnTiles(data.positions);
        }
    }

    private onTeleportExecute(data?: { position1?: Position; position2?: Position }): void {
        if (!data) return;
        if (!data.position1 || !data.position2) {
            return;
        }
        
        this.swapTiles(data.position1, data.position2);
    }

    private swapTiles(pos1: Position, pos2: Position): void {
        const tile1 = this.getTileAt(pos1);
        const tile2 = this.getTileAt(pos2);

        if (!tile1 || !tile2) {
            return;
        }

        const tile1Type = tile1.type;
        const tile2Type = tile2.type;

        tile1.type = tile2Type;
        tile2.type = tile1Type;

        if (tile1.updateVisual) {
            tile1.updateVisual();
        }
        if (tile2.updateVisual) {
            tile2.updateVisual();
        }
    }

    onDestroy() {
        this.eventSystem.off(Events.TILE_CLICKED, this.boundOnTileClicked);
        this.eventSystem.off(Events.BOOSTER_BOMB_EXECUTE, this.boundOnBombExecute);
        this.eventSystem.off(Events.BOOSTER_TELEPORT_EXECUTE, this.boundOnTeleportExecute);
        this.eventSystem.off(Events.TILES_DESTROYED, this.boundOnTilesDestroyed);
        this.unscheduleAllCallbacks();
    }

}
