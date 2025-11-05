import React, { useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { analyzeMedia, clearCurrentAnalysis } from '../../store/slices/detectionSlice'
import MediaUpload from '../../components/detection/MediaUpload'
import DetectionResults from '../../components/detection/DetectionResults'
import DetectionHistory from '../../components/detection/DetectionHistory'

const DetectionPage = () => {
  const dispatch = useDispatch()
  const { currentAnalysis, history, analysisLoading, error } = useSelector((state) => state.detection)
  const [selectedFile, setSelectedFile] = useState(null)

  const handleFileUpload = (file) => {
    setSelectedFile(file)
  }

  const handleAnalyze = async () => {
    if (!selectedFile) return

    const formData = new FormData()
    formData.append('media', selectedFile)
    formData.append('media_type', selectedFile.type.startsWith('video/') ? 'video' : 'image')

    dispatch(analyzeMedia(formData))
  }

  const handleClearResults = () => {
    dispatch(clearCurrentAnalysis())
    setSelectedFile(null)
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Deepfake Detection</h1>
        <p className="mt-1 text-sm text-gray-500">
          Upload media content to analyze for deepfake characteristics.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Media Analysis
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Upload images or videos to detect deepfake content.
              </p>
            </div>
            <div className="px-4 py-5 sm:px-6">
              {!currentAnalysis ? (
                <MediaUpload
                  onFileSelect={handleFileUpload}
                  onAnalyze={handleAnalyze}
                  selectedFile={selectedFile}
                  loading={analysisLoading}
                />
              ) : (
                <DetectionResults
                  result={currentAnalysis}
                  onClear={handleClearResults}
                />
              )}
              {error && (
                <div className="mt-4 rounded-md bg-red-50 p-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-red-800">
                        Analysis Error
                      </h3>
                      <div className="mt-2 text-sm text-red-700">
                        <p>{error.message || 'An error occurred during analysis.'}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div>
          <DetectionHistory history={history} />
        </div>
      </div>
    </div>
  )
}

export default DetectionPage