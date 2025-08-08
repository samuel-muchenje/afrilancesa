import React, { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Upload, File, Image, Video, FileText, X, Eye } from 'lucide-react';

const API_BASE = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';

const FileUpload = ({ 
  uploadType, 
  title, 
  accept, 
  maxSize, 
  onUploadSuccess, 
  showMetadata = false,
  className = "" 
}) => {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [metadata, setMetadata] = useState({
    title: '',
    description: '',
    technologies: '',
    project_url: ''
  });

  const getFileIcon = (fileType) => {
    if (fileType?.startsWith('image/')) return <Image className="w-4 h-4" />;
    if (fileType?.startsWith('video/')) return <Video className="w-4 h-4" />;
    if (fileType?.includes('pdf') || fileType?.includes('document')) return <FileText className="w-4 h-4" />;
    return <File className="w-4 h-4" />;
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleFileSelect = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);
    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      formData.append('file', file);

      // Add metadata for project gallery uploads
      if (showMetadata && uploadType === 'project-gallery') {
        formData.append('title', metadata.title);
        formData.append('description', metadata.description);
        formData.append('technologies', metadata.technologies);
        if (metadata.project_url) {
          formData.append('project_url', metadata.project_url);
        }
      }

      const endpoint = getUploadEndpoint(uploadType);
      const response = await fetch(`${API_BASE}${endpoint}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const result = await response.json();
      
      // Reset form
      setFile(null);
      setMetadata({
        title: '',
        description: '',
        technologies: '',
        project_url: ''
      });
      
      // Clear file input
      const fileInput = document.querySelector(`input[type="file"][data-upload-type="${uploadType}"]`);
      if (fileInput) {
        fileInput.value = '';
      }

      if (onUploadSuccess) {
        onUploadSuccess(result);
      }

    } catch (error) {
      console.error('Upload error:', error);
      alert(`Upload failed: ${error.message}`);
    } finally {
      setUploading(false);
    }
  };

  const getUploadEndpoint = (type) => {
    switch (type) {
      case 'profile-picture': return '/api/upload-profile-picture';
      case 'resume': return '/api/upload-resume';
      case 'portfolio': return '/api/upload-portfolio-file';
      case 'project-gallery': return '/api/upload-project-gallery';
      default: return '/api/upload-file';
    }
  };

  const clearFile = () => {
    setFile(null);
    const fileInput = document.querySelector(`input[type="file"][data-upload-type="${uploadType}"]`);
    if (fileInput) {
      fileInput.value = '';
    }
  };

  return (
    <Card className={`bg-gray-800 border-gray-700 ${className}`}>
      <CardHeader>
        <CardTitle className="text-white flex items-center">
          <Upload className="w-5 h-5 mr-2" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* File Input */}
        <div>
          <Input
            type="file"
            accept={accept}
            onChange={handleFileSelect}
            data-upload-type={uploadType}
            className="bg-gray-700 border-gray-600 text-white file:bg-gradient-to-r file:from-yellow-400 file:to-green-500 file:text-black file:border-0 file:px-4 file:py-2 file:rounded file:font-semibold file:cursor-pointer"
          />
          <p className="text-xs text-gray-400 mt-1">
            Max size: {maxSize}MB
          </p>
        </div>

        {/* File Preview */}
        {file && (
          <div className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
            <div className="flex items-center space-x-3">
              {getFileIcon(file.type)}
              <div>
                <p className="text-white text-sm font-medium">{file.name}</p>
                <p className="text-gray-400 text-xs">{formatFileSize(file.size)}</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFile}
              className="text-gray-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        )}

        {/* Metadata Fields for Project Gallery */}
        {showMetadata && file && uploadType === 'project-gallery' && (
          <div className="space-y-3">
            <Input
              placeholder="Project Title *"
              value={metadata.title}
              onChange={(e) => setMetadata(prev => ({ ...prev, title: e.target.value }))}
              className="bg-gray-700 border-gray-600 text-white"
              required
            />
            <Textarea
              placeholder="Project Description *"
              value={metadata.description}
              onChange={(e) => setMetadata(prev => ({ ...prev, description: e.target.value }))}
              className="bg-gray-700 border-gray-600 text-white"
              rows={3}
              required
            />
            <Input
              placeholder="Technologies (comma-separated)"
              value={metadata.technologies}
              onChange={(e) => setMetadata(prev => ({ ...prev, technologies: e.target.value }))}
              className="bg-gray-700 border-gray-600 text-white"
            />
            <Input
              placeholder="Project URL (optional)"
              value={metadata.project_url}
              onChange={(e) => setMetadata(prev => ({ ...prev, project_url: e.target.value }))}
              className="bg-gray-700 border-gray-600 text-white"
            />
          </div>
        )}

        {/* Upload Button */}
        <Button
          onClick={handleUpload}
          disabled={!file || uploading || (showMetadata && uploadType === 'project-gallery' && (!metadata.title || !metadata.description))}
          className="w-full bg-gradient-to-r from-yellow-400 to-green-500 hover:from-yellow-500 hover:to-green-600 text-black font-semibold"
        >
          {uploading ? 'Uploading...' : 'Upload'}
        </Button>
      </CardContent>
    </Card>
  );
};

export default FileUpload;