import { useState, memo, useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '../hooks/useRedux';
import { setEditingOverlay } from '../store/slices/overlaysSlice';
import { Button, Input, Modal } from './ui';
import { Overlay, CreateOverlayData } from '../services/api';
import config from '../config/config';

interface OverlayPanelProps {
    onAdd: (data: CreateOverlayData) => Promise<void>;
    onEdit: (id: string, data: Partial<CreateOverlayData>) => Promise<void>;
    onDelete: (id: string) => Promise<void>;
}

// Memoized overlay list item
const OverlayListItem = memo(function OverlayListItem({
    overlay,
    onEdit,
    onDelete
}: {
    overlay: Overlay;
    onEdit: () => void;
    onDelete: () => void;
}) {
    return (
        <div className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg hover:bg-slate-700 transition-colors">
            <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded flex items-center justify-center ${overlay.type === 'text' ? 'bg-indigo-500/20 text-indigo-400' : 'bg-purple-500/20 text-purple-400'
                    }`}>
                    {overlay.type === 'text' ? (
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M5 4v3h5.5v12h3V7H19V4H5z" />
                        </svg>
                    ) : (
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                    )}
                </div>
                <div>
                    <p className="text-sm text-white truncate max-w-[150px]">
                        {overlay.content.substring(0, 30)}{overlay.content.length > 30 ? '...' : ''}
                    </p>
                    <p className="text-xs text-slate-500">
                        {overlay.size.width}×{overlay.size.height}px
                    </p>
                </div>
            </div>
            <div className="flex items-center gap-1">
                <button
                    onClick={onEdit}
                    className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-600 rounded transition-colors"
                >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                </button>
                <button
                    onClick={onDelete}
                    className="p-1.5 text-red-400 hover:text-red-300 hover:bg-slate-600 rounded transition-colors"
                >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                </button>
            </div>
        </div>
    );
});

// Add/Edit Modal Form
const OverlayForm = memo(function OverlayForm({
    overlayType,
    initialContent = '',
    initialFontSize = 18,
    initialFontColor = '#ffffff',
    initialBgColor = 'rgba(0, 0, 0, 0.5)',
    onSubmit,
    isLoading
}: {
    overlayType: 'text' | 'image';
    initialContent?: string;
    initialFontSize?: number;
    initialFontColor?: string;
    initialBgColor?: string;
    onSubmit: (data: { content: string; fontSize: number; fontColor: string; backgroundColor: string }) => void;
    isLoading: boolean;
}) {
    const [content, setContent] = useState(initialContent);
    const [fontSize, setFontSize] = useState(initialFontSize);
    const [fontColor, setFontColor] = useState(initialFontColor);
    const [backgroundColor, setBackgroundColor] = useState(initialBgColor);

    const handleSubmit = useCallback(() => {
        onSubmit({ content, fontSize, fontColor, backgroundColor });
    }, [content, fontSize, fontColor, backgroundColor, onSubmit]);

    return (
        <div className="space-y-4">
            {overlayType === 'text' ? (
                <>
                    <Input
                        label="Text Content"
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        placeholder="Enter overlay text..."
                    />
                    <div className="grid grid-cols-2 gap-4">
                        <Input
                            label="Font Size"
                            type="number"
                            value={fontSize}
                            onChange={(e) => setFontSize(Number(e.target.value))}
                            min={8}
                            max={72}
                        />
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">Font Color</label>
                            <input
                                type="color"
                                value={fontColor}
                                onChange={(e) => setFontColor(e.target.value)}
                                className="w-full h-10 rounded-lg border border-slate-700 bg-slate-800 cursor-pointer"
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">Background Color</label>
                        <input
                            type="color"
                            value={backgroundColor.startsWith('rgba') ? '#000000' : backgroundColor}
                            onChange={(e) => setBackgroundColor(e.target.value + '80')}
                            className="w-full h-10 rounded-lg border border-slate-700 bg-slate-800 cursor-pointer"
                        />
                    </div>
                </>
            ) : (
                <Input
                    label="Image URL"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Enter image URL..."
                    icon={
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                        </svg>
                    }
                />
            )}
            <Button onClick={handleSubmit} loading={isLoading} fullWidth>
                Save
            </Button>
        </div>
    );
});

export default function OverlayPanel({
    onAdd,
    onEdit,
    onDelete
}: OverlayPanelProps) {
    const dispatch = useAppDispatch();
    const { items: overlays, editingOverlay } = useAppSelector((state) => state.overlays);

    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [overlayType, setOverlayType] = useState<'text' | 'image'>('text');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const openAddModal = useCallback((type: 'text' | 'image') => {
        setOverlayType(type);
        setIsAddModalOpen(true);
    }, []);

    const handleAdd = useCallback(async (formData: { content: string; fontSize: number; fontColor: string; backgroundColor: string }) => {
        if (!formData.content.trim()) return;

        setIsSubmitting(true);
        try {
            const overlayData: CreateOverlayData = {
                type: overlayType,
                content: formData.content.trim(),
                position: { x: 100, y: 100 },
                size: overlayType === 'text'
                    ? config.OVERLAY_DEFAULTS.text
                    : config.OVERLAY_DEFAULTS.image,
                style: overlayType === 'text' ? {
                    fontSize: formData.fontSize,
                    fontColor: formData.fontColor,
                    backgroundColor: formData.backgroundColor,
                    fontFamily: 'Inter',
                    fontWeight: 'normal',
                    opacity: 1
                } : { opacity: 1 }
            };
            await onAdd(overlayData);
            setIsAddModalOpen(false);
        } finally {
            setIsSubmitting(false);
        }
    }, [overlayType, onAdd]);

    const handleEditSubmit = useCallback(async (formData: { content: string; fontSize: number; fontColor: string; backgroundColor: string }) => {
        if (!editingOverlay || !formData.content.trim()) return;

        setIsSubmitting(true);
        try {
            await onEdit(editingOverlay.id, {
                content: formData.content.trim(),
                style: editingOverlay.type === 'text' ? {
                    fontSize: formData.fontSize,
                    fontColor: formData.fontColor,
                    backgroundColor: formData.backgroundColor,
                    fontFamily: 'Inter',
                    fontWeight: 'normal',
                    opacity: 1
                } : { opacity: 1 }
            });
            dispatch(setEditingOverlay(null));
        } finally {
            setIsSubmitting(false);
        }
    }, [editingOverlay, onEdit, dispatch]);

    return (
        <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-5">
            <h3 className="text-lg font-semibold text-white mb-4">Overlay Management</h3>

            {/* Add Buttons */}
            <div className="flex gap-3 mb-6">
                <Button
                    variant="primary"
                    size="sm"
                    onClick={() => openAddModal('text')}
                    icon={
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                    }
                >
                    Add Text
                </Button>
                <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => openAddModal('image')}
                    icon={
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                    }
                >
                    Add Image
                </Button>
            </div>

            {/* Overlays List */}
            <div className="space-y-3">
                <h4 className="text-sm font-medium text-slate-400">Active Overlays ({overlays.length})</h4>
                {overlays.length === 0 ? (
                    <p className="text-sm text-slate-500 py-4 text-center">No overlays added yet</p>
                ) : (
                    <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                        {overlays.map((overlay) => (
                            <OverlayListItem
                                key={overlay.id}
                                overlay={overlay}
                                onEdit={() => dispatch(setEditingOverlay(overlay))}
                                onDelete={() => onDelete(overlay.id)}
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* Add Modal */}
            <Modal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                title={`Add ${overlayType === 'text' ? 'Text' : 'Image'} Overlay`}
                size="md"
            >
                <OverlayForm
                    overlayType={overlayType}
                    onSubmit={handleAdd}
                    isLoading={isSubmitting}
                />
            </Modal>

            {/* Edit Modal */}
            <Modal
                isOpen={!!editingOverlay}
                onClose={() => dispatch(setEditingOverlay(null))}
                title="Edit Overlay"
                size="md"
            >
                {editingOverlay && (
                    <OverlayForm
                        overlayType={editingOverlay.type}
                        initialContent={editingOverlay.content}
                        initialFontSize={editingOverlay.style?.fontSize}
                        initialFontColor={editingOverlay.style?.fontColor}
                        initialBgColor={editingOverlay.style?.backgroundColor}
                        onSubmit={handleEditSubmit}
                        isLoading={isSubmitting}
                    />
                )}
            </Modal>
        </div>
    );
}
