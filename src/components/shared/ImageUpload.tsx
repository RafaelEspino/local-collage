import { useCallback } from 'react'
import { useDropzone } from 'react-dropzone'

interface ImageUploadProps {
  onUpload: (files: File[]) => void
}

export const ImageUpload = ({ onUpload }: ImageUploadProps) => {
  const onDrop = useCallback((acceptedFiles: File[]) => {
    onUpload(acceptedFiles)
  }, [onUpload])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/jpeg': [],
      'image/png': [],
      'image/webp': []
    }
  })

  return (
    <div
      {...getRootProps()}
      className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
        ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'}`}
    >
      <input {...getInputProps()} />
      {isDragActive ? (
        <p className="text-blue-500">Drop the images here...</p>
      ) : (
        <div>
          <p className="text-gray-600">Drag 'n' drop some images here, or click to select files</p>
          <p className="text-sm text-gray-500 mt-2">Supports JPG, PNG, and WEBP</p>
        </div>
      )}
    </div>
  )
} 