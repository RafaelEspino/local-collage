import { useState, useRef, TouchEvent, useEffect, useCallback } from 'react'
import { useCollageStore } from '../../store/collageStore'

interface LayoutSlot {
  id: string
  x: number
  y: number
  width: number
  height: number
  minWidth: number
  minHeight: number
  maxWidth: number
  maxHeight: number
  imageId?: string
  imageOffsetX?: number
  imageOffsetY?: number
  imageScale?: number
}

interface LayoutTemplate {
  id: string
  name: string
  slots: LayoutSlot[]
}

// Pre-defined layout templates
const layoutTemplates: LayoutTemplate[] = [
  {
    id: 'vertical-split',
    name: 'Vertical Split',
    slots: [
      {
        id: 'left',
        x: 0,
        y: 0,
        width: 0.5,
        height: 1,
        minWidth: 0.3,
        minHeight: 0.3,
        maxWidth: 0.7,
        maxHeight: 1
      },
      {
        id: 'right-top',
        x: 0.5,
        y: 0,
        width: 0.5,
        height: 0.5,
        minWidth: 0.3,
        minHeight: 0.3,
        maxWidth: 0.7,
        maxHeight: 0.7
      },
      {
        id: 'right-bottom',
        x: 0.5,
        y: 0.5,
        width: 0.5,
        height: 0.5,
        minWidth: 0.3,
        minHeight: 0.3,
        maxWidth: 0.7,
        maxHeight: 0.7
      }
    ]
  },
  // Add more templates here
]

type ResizeDirection = 'n' | 'ne' | 'e' | 'se' | 's' | 'sw' | 'w' | 'nw'

export const LayoutSystem = () => {
  const [selectedTemplate, setSelectedTemplate] = useState<LayoutTemplate | null>(null)
  const [activeSlot, setActiveSlot] = useState<LayoutSlot | null>(null)
  const [showImageSelector, setShowImageSelector] = useState(false)
  const [isResizing, setIsResizing] = useState(false)
  const [isPanning, setIsPanning] = useState(false)
  const [resizeDirection, setResizeDirection] = useState<ResizeDirection | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const touchStartRef = useRef<{ x: number; y: number } | null>(null)
  const initialSizeRef = useRef<{ width: number; height: number } | null>(null)
  const initialOffsetRef = useRef<{ x: number; y: number } | null>(null)
  const aspectRatioRef = useRef<number | null>(null)
  
  const { images, currentLayout, assignImageToSlot, removeImageFromSlot, setLayout, updateSlot } = useCollageStore()

  // Sync selected template with store
  useEffect(() => {
    if (selectedTemplate) {
      setLayout(selectedTemplate)
    }
  }, [selectedTemplate, setLayout])

  const calculateNewSize = useCallback((
    deltaX: number,
    deltaY: number,
    direction: ResizeDirection,
    maintainAspectRatio: boolean
  ) => {
    if (!activeSlot || !initialSizeRef.current) return { width: 0, height: 0 }

    let newWidth = initialSizeRef.current.width
    let newHeight = initialSizeRef.current.height

    // Calculate new dimensions based on resize direction
    switch (direction) {
      case 'e':
        newWidth += deltaX
        if (maintainAspectRatio) newHeight = newWidth / aspectRatioRef.current!
        break
      case 'w':
        newWidth -= deltaX
        if (maintainAspectRatio) newHeight = newWidth / aspectRatioRef.current!
        break
      case 's':
        newHeight += deltaY
        if (maintainAspectRatio) newWidth = newHeight * aspectRatioRef.current!
        break
      case 'n':
        newHeight -= deltaY
        if (maintainAspectRatio) newWidth = newHeight * aspectRatioRef.current!
        break
      case 'se':
        newWidth += deltaX
        newHeight += deltaY
        if (maintainAspectRatio) {
          const ratio = Math.abs(deltaX) > Math.abs(deltaY) ? deltaX : deltaY
          newWidth = initialSizeRef.current.width + ratio
          newHeight = newWidth / aspectRatioRef.current!
        }
        break
      case 'sw':
        newWidth -= deltaX
        newHeight += deltaY
        if (maintainAspectRatio) {
          const ratio = Math.abs(deltaX) > Math.abs(deltaY) ? deltaX : deltaY
          newWidth = initialSizeRef.current.width - ratio
          newHeight = newWidth / aspectRatioRef.current!
        }
        break
      case 'ne':
        newWidth += deltaX
        newHeight -= deltaY
        if (maintainAspectRatio) {
          const ratio = Math.abs(deltaX) > Math.abs(deltaY) ? deltaX : deltaY
          newWidth = initialSizeRef.current.width + ratio
          newHeight = newWidth / aspectRatioRef.current!
        }
        break
      case 'nw':
        newWidth -= deltaX
        newHeight -= deltaY
        if (maintainAspectRatio) {
          const ratio = Math.abs(deltaX) > Math.abs(deltaY) ? deltaX : deltaY
          newWidth = initialSizeRef.current.width - ratio
          newHeight = newWidth / aspectRatioRef.current!
        }
        break
    }

    // Apply constraints
    newWidth = Math.max(activeSlot.minWidth, Math.min(activeSlot.maxWidth, newWidth))
    newHeight = Math.max(activeSlot.minHeight, Math.min(activeSlot.maxHeight, newHeight))

    return { width: newWidth, height: newHeight }
  }, [activeSlot])

  // Add event listeners with proper passive handling
  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const handleTouchStart = (e: TouchEvent) => {
      e.preventDefault()
      if (e.touches.length === 1) {
        touchStartRef.current = {
          x: e.touches[0].clientX,
          y: e.touches[0].clientY
        }
      }
    }

    const handleTouchMove = (e: TouchEvent) => {
      if (!activeSlot || !containerRef.current || !touchStartRef.current || !initialSizeRef.current || !resizeDirection) return
      
      e.preventDefault()
      const container = containerRef.current
      const rect = container.getBoundingClientRect()
      
      const touch = e.touches[0]
      const deltaX = (touch.clientX - touchStartRef.current.x) / rect.width
      const deltaY = (touch.clientY - touchStartRef.current.y) / rect.height

      if (isResizing) {
        const { width, height } = calculateNewSize(deltaX, deltaY, resizeDirection, false)
        updateSlot(activeSlot.id, { width, height })
      }
    }

    const handleTouchEnd = () => {
      touchStartRef.current = null
      initialSizeRef.current = null
      aspectRatioRef.current = null
      setIsResizing(false)
      setResizeDirection(null)
      setActiveSlot(null)
    }

    // Add event listeners with { passive: false } for touch events that need preventDefault
    container.addEventListener('touchstart', handleTouchStart as unknown as EventListener, { passive: false })
    container.addEventListener('touchmove', handleTouchMove as unknown as EventListener, { passive: false })
    container.addEventListener('touchend', handleTouchEnd, { passive: true })

    return () => {
      container.removeEventListener('touchstart', handleTouchStart as unknown as EventListener)
      container.removeEventListener('touchmove', handleTouchMove as unknown as EventListener)
      container.removeEventListener('touchend', handleTouchEnd)
    }
  }, [activeSlot, isResizing, resizeDirection, updateSlot, calculateNewSize])

  // Add mouse event handlers
  useEffect(() => {
    const handleMouseMove = (e: globalThis.MouseEvent) => {
      if (!activeSlot || !containerRef.current || !initialSizeRef.current || !resizeDirection) return
      
      const container = containerRef.current
      const rect = container.getBoundingClientRect()
      
      const deltaX = (e.clientX - (touchStartRef.current?.x || 0)) / rect.width
      const deltaY = (e.clientY - (touchStartRef.current?.y || 0)) / rect.height

      if (isResizing) {
        const maintainAspectRatio = e.shiftKey
        const { width, height } = calculateNewSize(deltaX, deltaY, resizeDirection, maintainAspectRatio)
        updateSlot(activeSlot.id, { width, height })
      }
    }

    const handleMouseUp = () => {
      touchStartRef.current = null
      initialSizeRef.current = null
      aspectRatioRef.current = null
      setIsResizing(false)
      setResizeDirection(null)
      setActiveSlot(null)
    }

    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
  }, [activeSlot, isResizing, resizeDirection, updateSlot, calculateNewSize])

  const handleImageSelect = (imageId: string) => {
    if (activeSlot) {
      assignImageToSlot(activeSlot.id, imageId)
      setShowImageSelector(false)
      setActiveSlot(null)
    }
  }

  const handleRemoveImage = (slotId: string) => {
    removeImageFromSlot(slotId)
  }

  const handleResetImage = (slotId: string) => {
    updateSlot(slotId, {
      imageOffsetX: 0,
      imageOffsetY: 0,
      imageScale: 1.2
    })
  }

  const handleResizeStart = (e: React.MouseEvent | React.TouchEvent, slot: LayoutSlot, direction: ResizeDirection) => {
    e.stopPropagation()
    setActiveSlot(slot)
    setIsResizing(true)
    setResizeDirection(direction)
    initialSizeRef.current = {
      width: slot.width,
      height: slot.height
    }
    aspectRatioRef.current = slot.width / slot.height
    touchStartRef.current = {
      x: 'clientX' in e ? e.clientX : e.touches[0].clientX,
      y: 'clientY' in e ? e.clientY : e.touches[0].clientY
    }
  }

  const handlePanStart = (e: React.MouseEvent | React.TouchEvent, slot: LayoutSlot) => {
    e.stopPropagation()
    setActiveSlot(slot)
    setIsPanning(true)
    initialOffsetRef.current = {
      x: slot.imageOffsetX || 0,
      y: slot.imageOffsetY || 0
    }
    touchStartRef.current = {
      x: 'clientX' in e ? e.clientX : e.touches[0].clientX,
      y: 'clientY' in e ? e.clientY : e.touches[0].clientY
    }
  }

  const handlePanMove = (e: globalThis.MouseEvent | globalThis.TouchEvent) => {
    if (!activeSlot || !containerRef.current || !touchStartRef.current || !initialOffsetRef.current) return
    
    const container = containerRef.current
    const rect = container.getBoundingClientRect()
    
    const currentX = 'clientX' in e ? e.clientX : e.touches[0].clientX
    const currentY = 'clientY' in e ? e.clientY : e.touches[0].clientY
    
    const deltaX = (currentX - touchStartRef.current.x) / rect.width
    const deltaY = (currentY - touchStartRef.current.y) / rect.height

    // Calculate new offsets with larger bounds to allow panning the full image
    const newOffsetX = Math.max(-1, Math.min(1, initialOffsetRef.current.x + deltaX))
    const newOffsetY = Math.max(-1, Math.min(1, initialOffsetRef.current.y + deltaY))

    updateSlot(activeSlot.id, {
      imageOffsetX: newOffsetX,
      imageOffsetY: newOffsetY
    })
  }

  const handlePanEnd = () => {
    touchStartRef.current = null
    initialOffsetRef.current = null
    setIsPanning(false)
    setActiveSlot(null)
  }

  // Add panning event listeners
  useEffect(() => {
    if (isPanning) {
      document.addEventListener('mousemove', handlePanMove)
      document.addEventListener('mouseup', handlePanEnd)
      document.addEventListener('touchmove', handlePanMove as unknown as EventListener, { passive: false })
      document.addEventListener('touchend', handlePanEnd)
    }

    return () => {
      document.removeEventListener('mousemove', handlePanMove)
      document.removeEventListener('mouseup', handlePanEnd)
      document.removeEventListener('touchmove', handlePanMove as unknown as EventListener)
      document.removeEventListener('touchend', handlePanEnd)
    }
  }, [isPanning, activeSlot, handlePanMove, handlePanEnd])

  const ResizeHandle = ({ direction, slot }: { direction: ResizeDirection, slot: LayoutSlot }) => {
    const positionClasses = {
      n: 'top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 cursor-ns-resize',
      ne: 'top-0 right-0 -translate-y-1/2 translate-x-1/2 cursor-nesw-resize',
      e: 'right-0 top-1/2 -translate-y-1/2 translate-x-1/2 cursor-ew-resize',
      se: 'bottom-0 right-0 translate-y-1/2 translate-x-1/2 cursor-nwse-resize',
      s: 'bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 cursor-ns-resize',
      sw: 'bottom-0 left-0 translate-y-1/2 -translate-x-1/2 cursor-nesw-resize',
      w: 'left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 cursor-ew-resize',
      nw: 'top-0 left-0 -translate-y-1/2 -translate-x-1/2 cursor-nwse-resize'
    }

    return (
      <div
        className={`absolute w-4 h-4 bg-blue-500 rounded-full touch-manipulation ${positionClasses[direction]}`}
        onMouseDown={(e) => handleResizeStart(e, slot, direction)}
        onTouchStart={(e) => handleResizeStart(e, slot, direction)}
      />
    )
  }

  return (
    <div className="space-y-4">
      {/* Layout Template Selection */}
      <div className="flex flex-wrap gap-2">
        {layoutTemplates.map((template) => (
          <button
            key={template.id}
            onClick={() => setSelectedTemplate(template)}
            className="px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 
                     active:bg-gray-300 transition-colors touch-manipulation"
          >
            {template.name}
          </button>
        ))}
      </div>

      {/* Layout Preview/Editor */}
      {currentLayout && (
        <div 
          ref={containerRef}
          className="relative w-full aspect-square bg-gray-50 rounded-lg 
                   overflow-hidden touch-manipulation"
        >
          {currentLayout.slots.map((slot) => {
            const slotImage = images.find(img => slot.imageId === img.id)

            return (
              <div
                key={slot.id}
                className="absolute border-2 border-gray-300 bg-white 
                         touch-manipulation group"
                style={{
                  left: `${slot.x * 100}%`,
                  top: `${slot.y * 100}%`,
                  width: `${slot.width * 100}%`,
                  height: `${slot.height * 100}%`,
                }}
              >
                {slotImage ? (
                  <>
                    <div 
                      className="w-full h-full overflow-hidden cursor-move relative"
                      onMouseDown={(e) => handlePanStart(e, slot)}
                      onTouchStart={(e) => handlePanStart(e, slot)}
                    >
                      <img
                        src={slotImage.preview}
                        alt=""
                        className="absolute inset-0 w-full h-full"
                        style={{
                          objectFit: 'cover',
                          transform: `translate(${(slot.imageOffsetX || 0) * 100}%, ${(slot.imageOffsetY || 0) * 100}%) scale(${slot.imageScale || 1.2})`,
                          transition: isPanning ? 'none' : 'transform 0.2s ease'
                        }}
                      />
                    </div>
                    <div className="absolute top-1 right-1 flex gap-1">
                      <button
                        onClick={() => handleResetImage(slot.id)}
                        className="w-6 h-6 bg-blue-500 text-white rounded-full 
                                 opacity-0 group-hover:opacity-100 transition-opacity 
                                 flex items-center justify-center touch-manipulation"
                        aria-label="Reset image position"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleRemoveImage(slot.id)}
                        className="w-6 h-6 bg-red-500 text-white rounded-full 
                                 opacity-0 group-hover:opacity-100 transition-opacity 
                                 flex items-center justify-center touch-manipulation"
                        aria-label="Remove image"
                      >
                        ×
                      </button>
                    </div>
                  </>
                ) : (
                  <button
                    onClick={() => {
                      setActiveSlot(slot)
                      setShowImageSelector(true)
                    }}
                    className="w-full h-full flex items-center justify-center
                             bg-gray-100 hover:bg-gray-200 transition-colors
                             touch-manipulation"
                  >
                    <span className="text-4xl text-gray-400">+</span>
                  </button>
                )}
                {/* Resize handles */}
                <ResizeHandle direction="n" slot={slot} />
                <ResizeHandle direction="ne" slot={slot} />
                <ResizeHandle direction="e" slot={slot} />
                <ResizeHandle direction="se" slot={slot} />
                <ResizeHandle direction="s" slot={slot} />
                <ResizeHandle direction="sw" slot={slot} />
                <ResizeHandle direction="w" slot={slot} />
                <ResizeHandle direction="nw" slot={slot} />
              </div>
            )
          })}
        </div>
      )}

      {/* Image Selector Modal */}
      {showImageSelector && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-4 max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Select an Image</h3>
              <button
                onClick={() => {
                  setShowImageSelector(false)
                  setActiveSlot(null)
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                ×
              </button>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {images.map((image) => (
                <button
                  key={image.id}
                  onClick={() => handleImageSelect(image.id)}
                  className="aspect-square relative group"
                >
                  <img
                    src={image.preview}
                    alt=""
                    className="w-full h-full object-cover rounded-lg"
                  />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 