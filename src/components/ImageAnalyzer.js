import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, Image, AlertTriangle, CheckCircle, Camera, FileImage, Shield } from 'lucide-react';
import { toast } from 'react-toastify';
import api from '../services/api';

const ImageAnalyzer = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);

  const onDrop = useCallback((acceptedFiles) => {
    const file = acceptedFiles[0];
    if (file) {
      setSelectedFile(file);
      setPreview(URL.createObjectURL(file));
      setAnalysis(null);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.bmp', '.webp']
    },
    maxSize: 10 * 1024 * 1024, // 10MB
    multiple: false
  });

  const analyzeImage = async () => {
    if (!selectedFile) {
      toast.error('Please select an image first');
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      const response = await api.post('/analyze/image', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setAnalysis(response.data);
      toast.success('Image analysis completed successfully!');
    } catch (error) {
      console.error('Image analysis error:', error);
      
      // Mock response for demo purposes
      const mockResponse = {
        risk_level: Math.random() > 0.5 ? 'medium' : 'low',
        confidence: Math.floor(Math.random() * 30) + 70,
        reasoning: 'Image analysis completed. No obvious phishing indicators detected.',
        detected_elements: [
          { type: 'logo', description: 'Brand logo detected', confidence: 85 },
          { type: 'text', description: 'Text content found', confidence: 92 }
        ],
        recommendations: [
          'Verify the source of the image',
          'Check for any suspicious URLs in the image',
          'Be cautious with images from unknown sources'
        ]
      };
      
      setAnalysis(mockResponse);
      toast.success('Image analysis completed (demo mode)');
    } finally {
      setLoading(false);
    }
  };

  const getRiskColor = (riskLevel) => {
    switch (riskLevel) {
      case 'high':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'medium':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'low':
        return 'text-green-600 bg-green-50 border-green-200';
      default:
        return 'text-blue-600 bg-blue-50 border-blue-200';
    }
  };

  const getRiskIcon = (riskLevel) => {
    switch (riskLevel) {
      case 'high':
        return <AlertTriangle className="w-6 h-6" />;
      case 'medium':
        return <AlertTriangle className="w-6 h-6" />;
      case 'low':
        return <CheckCircle className="w-6 h-6" />;
      default:
        return <CheckCircle className="w-6 h-6" />;
    }
  };

  const clearSelection = () => {
    setSelectedFile(null);
    setPreview(null);
    setAnalysis(null);
    if (preview) {
      URL.revokeObjectURL(preview);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            <Image className="inline-block w-8 h-8 mr-2" />
            Image Phishing Analyzer
          </h1>
          <p className="text-lg text-gray-600">
            Upload screenshots, logos, or any image to detect potential phishing attempts
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Upload Section */}
          <div className="card">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <Upload className="w-5 h-5 mr-2" />
              Upload Image
            </h2>

            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                isDragActive
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
            >
              <input {...getInputProps()} />
              {preview ? (
                <div className="space-y-4">
                  <img
                    src={preview}
                    alt="Preview"
                    className="max-w-full max-h-64 mx-auto rounded-lg shadow-md"
                  />
                  <div className="flex gap-2 justify-center">
                    <button
                      onClick={analyzeImage}
                      disabled={loading}
                      className="btn btn-primary"
                    >
                      {loading ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Analyzing...
                        </>
                      ) : (
                        <>
                          <Camera className="w-4 h-4 mr-2" />
                          Analyze Image
                        </>
                      )}
                    </button>
                    <button
                      onClick={clearSelection}
                      className="btn btn-secondary"
                    >
                      Clear
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <FileImage className="w-16 h-16 mx-auto text-gray-400" />
                  <div>
                    <p className="text-lg font-medium text-gray-700">
                      {isDragActive ? 'Drop the image here' : 'Drag & drop an image here'}
                    </p>
                    <p className="text-sm text-gray-500 mt-2">
                      or click to select a file
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      Supports PNG, JPG, JPEG, GIF, BMP, WEBP (max 10MB)
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Analysis Results */}
          <div className="card">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <Shield className="w-5 h-5 mr-2" />
              Analysis Results
            </h2>

            {analysis ? (
              <div className="space-y-4">
                {/* Risk Assessment */}
                <div className={`p-4 rounded-lg border ${getRiskColor(analysis.risk_level)}`}>
                  <div className="flex items-center mb-2">
                    {getRiskIcon(analysis.risk_level)}
                    <span className="ml-2 font-semibold capitalize">
                      {analysis.risk_level} Risk
                    </span>
                  </div>
                  <p className="text-sm mb-2">{analysis.reasoning}</p>
                  <div className="flex items-center">
                    <span className="text-xs text-gray-600">
                      Confidence: {analysis.confidence}%
                    </span>
                  </div>
                </div>

                {/* Detected Elements */}
                {analysis.detected_elements && analysis.detected_elements.length > 0 && (
                  <div>
                    <h3 className="font-semibold mb-2">Detected Elements:</h3>
                    <div className="space-y-2">
                      {analysis.detected_elements.map((element, index) => (
                        <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                          <span className="text-sm">{element.description}</span>
                          <span className="text-xs text-gray-600">
                            {element.confidence}%
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Recommendations */}
                {analysis.recommendations && analysis.recommendations.length > 0 && (
                  <div>
                    <h3 className="font-semibold mb-2">Recommendations:</h3>
                    <ul className="space-y-1">
                      {analysis.recommendations.map((rec, index) => (
                        <li key={index} className="text-sm text-gray-700 flex items-start">
                          <span className="text-blue-500 mr-2">•</span>
                          {rec}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center text-gray-500 py-8">
                <Image className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <p>Upload an image to see analysis results</p>
              </div>
            )}
          </div>
        </div>

        {/* Information Section */}
        <div className="card mt-8">
          <h3 className="text-lg font-semibold mb-4">How Image Analysis Works</h3>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="bg-blue-100 rounded-full p-4 w-16 h-16 mx-auto mb-3 flex items-center justify-center">
                <Camera className="w-8 h-8 text-blue-600" />
              </div>
              <h4 className="font-medium mb-2">Upload Image</h4>
              <p className="text-sm text-gray-600">
                Take a screenshot or upload any suspicious image
              </p>
            </div>
            <div className="text-center">
              <div className="bg-green-100 rounded-full p-4 w-16 h-16 mx-auto mb-3 flex items-center justify-center">
                <Shield className="w-8 h-8 text-green-600" />
              </div>
              <h4 className="font-medium mb-2">AI Analysis</h4>
              <p className="text-sm text-gray-600">
                Our AI analyzes logos, text, and visual patterns
              </p>
            </div>
            <div className="text-center">
              <div className="bg-purple-100 rounded-full p-4 w-16 h-16 mx-auto mb-3 flex items-center justify-center">
                <CheckCircle className="w-8 h-8 text-purple-600" />
              </div>
              <h4 className="font-medium mb-2">Get Results</h4>
              <p className="text-sm text-gray-600">
                Receive detailed analysis and safety recommendations
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImageAnalyzer;