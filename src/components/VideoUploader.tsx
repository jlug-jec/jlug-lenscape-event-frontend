import { useState, useRef } from 'react'
import { Upload, X, Film, Image as ImageIcon, CheckCircle } from 'lucide-react'
import { AnimatePresence } from 'framer-motion'
import ErrorToast from './UI/ErrorToast'

interface VideoUploaderProps {
  onVideoSelect: (video: File) => void
  onCoverSelect: (cover: File) => void
  videoFile: File | null
  coverFile: File | null
  onRemoveVideo: () => void
  onRemoveCover: () => void
}

export default function VideoUploader({
  onVideoSelect,
  onCoverSelect,
  videoFile,
  coverFile,
  onRemoveVideo,
  onRemoveCover
}: VideoUploaderProps) {
  const videoInputRef = useRef<HTMLInputElement>(null)
  const coverInputRef = useRef<HTMLInputElement>(null)
  const [videoPreview, setVideoPreview] = useState<string | null>(null)
  const [coverPreview, setCoverPreview] = useState<string | null>(null)
  const [showErrorToast, setShowErrorToast] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [errorTitle, setErrorTitle] = useState('Upload Error')

  const triggerError = (title: string, message: string) => {
    setErrorTitle(title)
    setErrorMessage(message)
    setShowErrorToast(true)
    setTimeout(() => setShowErrorToast(false), 4000)
  }

  const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Validate video file
      const validTypes = ['video/mp4', 'video/x-matroska', 'video/mkv']
      if (!validTypes.includes(file.type) && !file.name.endsWith('.mkv')) {
        triggerError('Invalid File Type', 'Please upload a valid video file (MP4 or MKV)')
        return
      }

      // Check file size (max 500MB)
      const maxSize = 500 * 1024 * 1024 // 500MB
      if (file.size > maxSize) {
        triggerError('File Too Large', 'Video file size must be less than 500MB')
        return
      }

      onVideoSelect(file)
      
      // Create video preview
      const videoUrl = URL.createObjectURL(file)
      setVideoPreview(videoUrl)
    }
  }

  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Validate image file
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
      if (!validTypes.includes(file.type)) {
        triggerError('Invalid File Type', 'Please upload a valid image file (JPG, PNG, or WebP)')
        return
      }

      // Check file size (max 10MB)
      const maxSize = 10 * 1024 * 1024 // 10MB
      if (file.size > maxSize) {
        triggerError('File Too Large', 'Cover image size must be less than 10MB')
        return
      }

      onCoverSelect(file)
      
      // Create image preview
      const reader = new FileReader()
      reader.onloadend = () => {
        setCoverPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleRemoveVideo = () => {
    if (videoPreview) {
      URL.revokeObjectURL(videoPreview)
      setVideoPreview(null)
    }
    onRemoveVideo()
    if (videoInputRef.current) {
      videoInputRef.current.value = ''
    }
  }

  const handleRemoveCover = () => {
    setCoverPreview(null)
    onRemoveCover()
    if (coverInputRef.current) {
      coverInputRef.current.value = ''
    }
  }

  return (
    <div className="space-y-6">
      {/* Video Upload */}
      <div>
        <label className="block font-mono text-xs text-exhibition-gold uppercase tracking-widest mb-3">
          Video File (MP4 or MKV) *
        </label>
        
        {!videoFile ? (
          <div
            onClick={() => videoInputRef.current?.click()}
            className="border-2 border-dashed border-exhibition-gold/30 hover:border-exhibition-gold/60 bg-black/20 p-8 rounded-none cursor-pointer transition-colors group"
          >
            <input
              ref={videoInputRef}
              type="file"
              accept=".mp4,.mkv,video/mp4,video/x-matroska"
              onChange={handleVideoChange}
              className="hidden"
            />
            <div className="flex flex-col items-center justify-center text-center">
              <Film size={48} className="text-exhibition-gold/40 group-hover:text-exhibition-gold/60 transition-colors mb-4" />
              <p className="font-mono text-sm text-zinc-400 mb-1">Click to upload video</p>
              <p className="font-mono text-xs text-zinc-600">MP4 or MKV, max 500MB</p>
            </div>
          </div>
        ) : (
          <div className="border border-exhibition-gold/30 bg-black/40 p-4 rounded-none relative">
            <button
              onClick={handleRemoveVideo}
              className="absolute top-2 right-2 w-8 h-8 bg-red-500/80 hover:bg-red-500 flex items-center justify-center transition-colors z-10"
            >
              <X size={16} className="text-white" />
            </button>
            
            {videoPreview && (
              <video
                src={videoPreview}
                controls
                className="w-full max-h-64 bg-black mb-3 relative z-[40]"
              />
            )}
            
            <div className="flex items-center gap-2 text-sm">
              <Film size={16} className="text-exhibition-gold" />
              <span className="font-mono text-zinc-300 truncate flex-1">{videoFile.name}</span>
              <span className="font-mono text-xs text-zinc-500">
                {(videoFile.size / (1024 * 1024)).toFixed(2)} MB
              </span>
              <CheckCircle size={16} className="text-green-500" />
            </div>
          </div>
        )}
      </div>

      {/* Cover Image Upload */}
      <div>
        <label className="block font-mono text-xs text-exhibition-gold uppercase tracking-widest mb-3">
          Cover Image (Thumbnail) *
        </label>
        
        {!coverFile ? (
          <div
            onClick={() => coverInputRef.current?.click()}
            className="border-2 border-dashed border-exhibition-gold/30 hover:border-exhibition-gold/60 bg-black/20 p-8 rounded-none cursor-pointer transition-colors group"
          >
            <input
              ref={coverInputRef}
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/webp"
              onChange={handleCoverChange}
              className="hidden"
            />
            <div className="flex flex-col items-center justify-center text-center">
              <ImageIcon size={48} className="text-exhibition-gold/40 group-hover:text-exhibition-gold/60 transition-colors mb-4" />
              <p className="font-mono text-sm text-zinc-400 mb-1">Click to upload cover image</p>
              <p className="font-mono text-xs text-zinc-600">JPG, PNG or WebP, max 10MB</p>
            </div>
          </div>
        ) : (
          <div className="border border-exhibition-gold/30 bg-black/40 p-4 rounded-none relative">
            <button
              onClick={handleRemoveCover}
              className="absolute top-2 right-2 w-8 h-8 bg-red-500/80 hover:bg-red-500 flex items-center justify-center transition-colors z-10"
            >
              <X size={16} className="text-white" />
            </button>
            
            {coverPreview && (
              <img
                src={coverPreview}
                alt="Cover preview"
                className="w-full h-48 object-cover bg-black mb-3 relative z-[40]"
              />
            )}
            
            <div className="flex items-center gap-2 text-sm">
              <ImageIcon size={16} className="text-exhibition-gold" />
              <span className="font-mono text-zinc-300 truncate flex-1">{coverFile.name}</span>
              <span className="font-mono text-xs text-zinc-500">
                {(coverFile.size / (1024 * 1024)).toFixed(2)} MB
              </span>
              <CheckCircle size={16} className="text-green-500" />
            </div>
          </div>
        )}
      </div>

      {/* Help Text */}
      <div className="bg-exhibition-gold/5 border border-exhibition-gold/20 p-4">
        <p className="font-mono text-xs text-zinc-400 leading-relaxed">
          <strong className="text-exhibition-gold">Note:</strong> For cinematography and motion graphics submissions, 
          both video file and cover image are required. The cover image will be displayed as a thumbnail in the gallery.
        </p>
      </div>

      {/* Error Toast */}
      <AnimatePresence>
        {showErrorToast && (
          <ErrorToast
            setShowErrorToast={setShowErrorToast}
            errorMessage={errorMessage}
            title={errorTitle}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
