import { create } from 'zustand'

export interface CollageImage {
  id: string
  file: File
  preview: string
}

export interface CollageLayout {
  id: string
  name: string
  rows: number
  cols: number
  aspectRatio: string
}

interface CollageStore {
  images: CollageImage[]
  selectedLayout: CollageLayout | null
  currentPage: number
  addImage: (file: File) => void
  removeImage: (id: string) => void
  setLayout: (layout: CollageLayout) => void
  setCurrentPage: (page: number) => void
}

export const useCollageStore = create<CollageStore>((set) => ({
  images: [],
  selectedLayout: null,
  currentPage: 0,
  
  addImage: (file: File) => 
    set((state) => ({
      images: [
        ...state.images,
        {
          id: crypto.randomUUID(),
          file,
          preview: URL.createObjectURL(file)
        }
      ]
    })),
    
  removeImage: (id: string) =>
    set((state) => ({
      images: state.images.filter(image => image.id !== id)
    })),
    
  setLayout: (layout: CollageLayout) =>
    set({ selectedLayout: layout }),
    
  setCurrentPage: (page: number) =>
    set({ currentPage: page })
})) 