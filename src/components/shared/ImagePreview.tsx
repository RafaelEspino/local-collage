import { useCollageStore } from '../../store/collageStore'
import { LuX } from 'react-icons/lu'

export const ImagePreview = () => {
  const images = useCollageStore(state => state.images)
  const removeImage = useCollageStore(state => state.removeImage)

  return (
    <div className="mt-4 sm:mt-6">
      <p className="text-sm sm:text-base text-gray-600 mb-3 sm:mb-4">
        {images.length} {images.length === 1 ? 'image' : 'images'} uploaded
      </p>
        {images.length > 0 ? 
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {images.map((image) => (
            <div key={image.id} className="relative group">
              <img
                src={image.preview}
                alt="Uploaded preview"
                className="w-full h-32 object-cover rounded-lg"
              />
              <button
                onClick={() => removeImage(image.id)}
                className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full"
                aria-label="Remove image"
              >
                <LuX color="white" size="1rem"/>
              </button>
            </div>
          ))}
        </div>
        : undefined}
      
    </div>
  )
} 
