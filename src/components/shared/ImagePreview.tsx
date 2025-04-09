import { useCollageStore } from '../../store/collageStore'

export const ImagePreview = () => {
  const { images, removeImage } = useCollageStore()

  const handleDragStart = (e: React.DragEvent, imageId: string) => {
    e.dataTransfer.setData('text/plain', imageId)
  }

  if (images.length === 0) return null

  return (
    <div className="mt-4">
      <p className="text-sm text-gray-600 mb-2">
        {images.length} image{images.length !== 1 ? 's' : ''} uploaded
      </p>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2 sm:gap-4">
        {images.map((image) => (
          <div
            key={image.id}
            className="relative group aspect-square"
          >
            <img
              src={image.preview}
              alt=""
              className="w-full h-full object-cover rounded-lg"
              draggable
              onDragStart={(e) => handleDragStart(e, image.id)}
            />
            <button
              onClick={() => removeImage(image.id)}
              className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white 
                       rounded-full opacity-0 group-hover:opacity-100 
                       transition-opacity flex items-center justify-center
                       touch-manipulation"
              aria-label="Remove image"
            >
              ×
            </button>
          </div>
        ))}
      </div>
    </div>
  )
} 
