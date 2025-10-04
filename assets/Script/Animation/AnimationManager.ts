const { ccclass, property } = cc._decorator;

import { EventSystem, Events } from "../Core/EventSystem";
import { Position } from "../Core/GameState";
import { WorldPositionUtils } from "../Utils/WorldPositionUtils";

@ccclass
export class AnimationManager extends cc.Component {
    private eventSystem!: EventSystem;

    onLoad() {
        this.eventSystem = EventSystem.getInstance();
        this.setupEventListeners();
    }

    private setupEventListeners(): void {
        this.eventSystem.on(Events.TILES_BURNED, this.onTilesBurned.bind(this));
        this.eventSystem.on(Events.TILES_FELL, this.onTilesFell.bind(this));
        this.eventSystem.on(Events.ANIMATION_COMPLETED, this.onAnimationCompleted.bind(this));
    }

    private onTilesBurned(data?: Position[]): void {
        if (!data) return;
        this.animateTileDestruction(data);
    }

    private onTilesFell(data?: Position[]): void {
        if (!data) return;
        this.animateTileFall(data);
    }

    private onAnimationCompleted(data?: { type?: string; positions?: Position[] }): void {
        if (!data) return;
        if (data.type === 'destruction' && data.positions) {
            this.eventSystem.emit(Events.TILES_DESTROYED, data.positions);
        }
    }

    public animateTileDestruction(positions: Position[]): void {
        let completedAnimations = 0;
        const totalAnimations = positions.length;
        
        for (const pos of positions) {
            const tileNode = this.getTileNodeAt(pos);
            if (tileNode) {
                const tween = cc.tween(tileNode)
                    .to(0.3, { opacity: 0, scale: 0 })
                    .call(() => {
                        completedAnimations++;
                        if (completedAnimations >= totalAnimations) {
                            this.eventSystem.emit(Events.ANIMATION_COMPLETED, { type: 'destruction', positions });
                        }
                    })
                    .start();
                
                const stopTween = () => {
                    if (tween) {
                        tween.stop();
                    }
                };
                
                tileNode.on('destroy', stopTween);
                tileNode.on('remove', stopTween);
            } else {
                completedAnimations++;
                if (completedAnimations >= totalAnimations) {
                    this.eventSystem.emit(Events.ANIMATION_COMPLETED, { type: 'destruction', positions });
                }
            }
        }
    }

    public animateTileFall(positions: Position[]): void {
        for (const pos of positions) {
            const tileNode = this.getTileNodeAt(pos);
            if (tileNode) {
                const targetPos = this.getWorldPosition(pos);
                const tween = cc.tween(tileNode)
                    .to(0.15, { position: cc.v3(targetPos.x, targetPos.y, 0) })
                    .start();
                
                const stopTween = () => {
                    if (tween) {
                        tween.stop();
                    }
                };
                
                tileNode.on('destroy', stopTween);
                tileNode.on('remove', stopTween);
            }
        }
    }

    public animateNewTilesCreation(positions: Position[]): void {
        for (let i = 0; i < positions.length; i++) {
            const pos = positions[i];
            const tileNode = this.getTileNodeAt(pos);
            
            if (tileNode) {
                const targetWorldPos = this.getWorldPosition(pos);
                const startY = targetWorldPos.y + 200;
                tileNode.y = startY;
                
                const tween = cc.tween(tileNode)
                    .to(0.2, { position: cc.v3(targetWorldPos.x, targetWorldPos.y, 0) })
                    .start();
                
                const stopTween = () => {
                    if (tween) {
                        tween.stop();
                    }
                };
                
                tileNode.on('destroy', stopTween);
                tileNode.on('remove', stopTween);
            }
        }
    }

    private getTileNodeAt(position: Position): cc.Node | null {
        const tileContainer = cc.find("Canvas/HUD/GameField/TileContainer");
        if (tileContainer && tileContainer.children) {
            const children = tileContainer.children;
            for (const child of children) {
                const tileComponent = child.getComponent("Tile");
                if (tileComponent && tileComponent.position && 
                    tileComponent.position.x === position.x && 
                    tileComponent.position.y === position.y) {
                    return child;
                }
            }
        }
        return null;
    }

    private getWorldPosition(position: Position): cc.Vec2 {
        return WorldPositionUtils.getWorldPosition(position);
    }

    onDestroy() {
        this.eventSystem.off(Events.TILES_BURNED, this.onTilesBurned.bind(this));
        this.eventSystem.off(Events.TILES_FELL, this.onTilesFell.bind(this));
    }
}
