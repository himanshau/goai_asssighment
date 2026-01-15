import { useState, useRef, useCallback } from 'react';
import Draggable, { DraggableEvent, DraggableData } from 'react-draggable';
import { ResizableBox, ResizeCallbackData } from 'react-resizable';
import { Overlay as OverlayType } from '../services/api';
import 'react-resizable/css/styles.css';

interface OverlayProps {
    overlay: OverlayType;
    containerBounds: DOMRect | null;
    onUpdate: (id: string, updates: { position?: { x: number; y: number }; size?: { width: number; height: number } }) => void;
    onEdit: (overlay: OverlayType) => void;
    onDelete: (id: string) => void;
    isSelected: boolean;
    onSelect: (id: string) => void;
}

export default function Overlay({
    overlay,
    containerBounds,
    onUpdate,
    onEdit,
    onDelete,
    isSelected,
    onSelect
}: OverlayProps) {
    const nodeRef = useRef<HTMLDivElement>(null);
    const [isDragging, setIsDragging] = useState(false);

    const handleDragStart = () => {
        setIsDragging(true);
        onSelect(overlay.id);
    };

    const handleDragStop = (_e: DraggableEvent, data: DraggableData) => {
        setIsDragging(false);
        onUpdate(overlay.id, {
            position: { x: data.x, y: data.y }
        });
    };

    const handleResize = useCallback(
        (_e: React.SyntheticEvent, data: ResizeCallbackData) => {
            onUpdate(overlay.id, {
                size: { width: data.size.width, height: data.size.height }
            });
        },
        [overlay.id, onUpdate]
    );

    const handleClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        onSelect(overlay.id);
    };

    // Calculate bounds for dragging
    const bounds = containerBounds
        ? {
            left: 0,
            top: 0,
            right: containerBounds.width - overlay.size.width,
            bottom: containerBounds.height - overlay.size.height
        }
        : undefined;

    return (
        <Draggable
            nodeRef={nodeRef}
            position={{ x: overlay.position.x, y: overlay.position.y }}
            onStart={handleDragStart}
            onStop={handleDragStop}
            bounds={bounds}
            handle=".drag-handle"
        >
            <div
                ref={nodeRef}
                onClick={handleClick}
                className={`absolute cursor-move ${isDragging ? 'z-50' : 'z-10'}`}
                style={{ width: overlay.size.width, height: overlay.size.height }}
            >
                <ResizableBox
                    width={overlay.size.width}
                    height={overlay.size.height}
                    onResizeStop={handleResize}
                    minConstraints={[50, 30]}
                    maxConstraints={containerBounds ? [containerBounds.width, containerBounds.height] : [800, 600]}
                    resizeHandles={isSelected ? ['se', 'sw', 'ne', 'nw', 'e', 'w', 'n', 's'] : []}
                    className="relative"
                >
                    <div
                        className={`
              drag-handle w-full h-full rounded-lg overflow-hidden transition-all
              ${isSelected ? 'ring-2 ring-indigo-500 ring-offset-2 ring-offset-transparent' : ''}
            `}
                        style={{
                            backgroundColor: overlay.type === 'text'
                                ? overlay.style.backgroundColor || 'rgba(0,0,0,0.5)'
                                : 'transparent',
                            opacity: overlay.style.opacity || 1
                        }}
                    >
                        {overlay.type === 'text' ? (
                            <div
                                className="w-full h-full flex items-center justify-center p-2 text-center"
                                style={{
                                    fontSize: overlay.style.fontSize || 16,
                                    color: overlay.style.fontColor || '#ffffff',
                                    fontFamily: overlay.style.fontFamily || 'Inter',
                                    fontWeight: overlay.style.fontWeight || 'normal'
                                }}
                            >
                                {overlay.content}
                            </div>
                        ) : (
                            <img
                                src={overlay.content}
                                alt="Overlay"
                                className="w-full h-full object-contain"
                                draggable={false}
                            />
                        )}

                        {/* Controls - Show on selection */}
                        {isSelected && (
                            <div className="absolute -top-10 left-1/2 -translate-x-1/2 flex items-center gap-1 bg-slate-800 rounded-lg p-1 shadow-lg">
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onEdit(overlay);
                                    }}
                                    className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-700 rounded"
                                    title="Edit"
                                >
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                    </svg>
                                </button>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onDelete(overlay.id);
                                    }}
                                    className="p-1.5 text-red-400 hover:text-red-300 hover:bg-slate-700 rounded"
                                    title="Delete"
                                >
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                </button>
                            </div>
                        )}
                    </div>
                </ResizableBox>
            </div>
        </Draggable>
    );
}
