import { create } from 'zustand'

export interface CollageImage {
  id: string
  file: File
  preview: string
  fullSize: string
}

export interface LayoutSlot {
  id: string
  x: number
  y: number
  width: number
  height: number
  minWidth: number
  minHeight: number
  maxWidth: number
  maxHeight: number
  imageId?: string // Reference to the image in this slot
  imageOffsetX?: number
  imageOffsetY?: number
  imageScale?: number
}

export interface LayoutTemplate {
  id: string
  name: string
  slots: LayoutSlot[]
}

interface CollageStore {
  images: CollageImage[]
  currentLayout: LayoutTemplate | null
  currentPage: number
  totalPages: number

  // Image actions
  addImage: (file: File) => void
  removeImage: (id: string) => void

  // Layout actions
  setLayout: (layout: LayoutTemplate) => void
  updateSlot: (slotId: string, updates: Partial<LayoutSlot>) => void
  assignImageToSlot: (slotId: string, imageId: string) => void
  removeImageFromSlot: (slotId: string) => void

  // Page actions
  setCurrentPage: (page: number) => void
  addPage: () => void
  removePage: (page: number) => void
}

export const useCollageStore = create<CollageStore>((set) => ({
  images: [],
  currentLayout: null,
  currentPage: 1,
  totalPages: 1,

  addImage: (file: File) => 
    set((state) => ({
      images: [
        ...state.images,
        {
          id: crypto.randomUUID(),
          file,
          preview: URL.createObjectURL(file),
          fullSize: URL.createObjectURL(file)
        }
      ]
    })),

  removeImage: (id: string) =>
    set((state) => ({
      images: state.images.filter(image => image.id !== id),
      currentLayout: state.currentLayout
        ? {
            ...state.currentLayout,
            slots: state.currentLayout.slots.map((slot) =>
              slot.imageId === id ? { ...slot, imageId: undefined } : slot
            )
          }
        : null
    })),

  setLayout: (layout) =>
    set({
      currentLayout: layout
    }),

  updateSlot: (slotId: string, updates: Partial<LayoutSlot>) =>
    set((state) => ({
      currentLayout: state.currentLayout
        ? {
            ...state.currentLayout,
            slots: state.currentLayout.slots.map((slot) =>
              slot.id === slotId ? { ...slot, ...updates } : slot
            )
          }
        : null
    })),

  assignImageToSlot: (slotId: string, imageId: string) =>
    set((state) => ({
      currentLayout: state.currentLayout
        ? {
            ...state.currentLayout,
            slots: state.currentLayout.slots.map((slot) =>
              slot.id === slotId 
                ? { 
                    ...slot, 
                    imageId,
                    imageOffsetX: 0,
                    imageOffsetY: 0,
                    imageScale: 1.2 // Slightly larger than 1 to ensure no gaps
                  } 
                : slot
            )
          }
        : null
    })),

  removeImageFromSlot: (slotId: string) =>
    set((state) => ({
      currentLayout: state.currentLayout
        ? {
            ...state.currentLayout,
            slots: state.currentLayout.slots.map((slot) =>
              slot.id === slotId ? { ...slot, imageId: undefined } : slot
            )
          }
        : null
    })),

  setCurrentPage: (page: number) =>
    set(() => ({
      currentPage: page
    })),

  addPage: () =>
    set((state) => ({
      totalPages: state.totalPages + 1
    })),

  removePage: (page: number) =>
    set((state) => ({
      totalPages: state.totalPages - 1,
      currentPage: state.currentPage === page ? 1 : state.currentPage
    }))
})) 