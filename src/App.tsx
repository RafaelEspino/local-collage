import { MainLayout } from './components/layout/MainLayout'
import { ImageUpload } from './components/shared/ImageUpload'
import { ImagePreview } from './components/shared/ImagePreview'
import { useCollageStore } from './store/collageStore'

function App() {
  const addImage = useCollageStore(state => state.addImage)

  const handleUpload = (files: File[]) => {
    files.forEach(file => addImage(file))
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        <section>
          <h2 className="text-lg font-semibold mb-4">Upload Photos</h2>
          <ImageUpload onUpload={handleUpload} />
          <ImagePreview />
        </section>
      </div>
    </MainLayout>
  )
}

export default App
