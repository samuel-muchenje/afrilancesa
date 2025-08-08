import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { 
  Image, Video, FileText, File, Trash2, Eye, ExternalLink, 
  Calendar, Tag, Globe, Download
} from 'lucide-react';

const API_BASE = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';

const FileGallery = ({ user, onFileDeleted }) => {
  const [userFiles, setUserFiles] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(null);

  useEffect(() => {
    fetchUserFiles();
  }, []);

  const fetchUserFiles = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE}/api/user-files`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const files = await response.json();
        setUserFiles(files);
      }
    } catch (error) {
      console.error('Error fetching user files:', error);
    } finally {
      setLoading(false);
    }
  };

  const getFileIcon = (fileType) => {
    if (fileType?.startsWith('image/')) return <Image className="w-4 h-4" />;
    if (fileType?.startsWith('video/')) return <Video className="w-4 h-4" />;
    if (fileType?.includes('pdf') || fileType?.includes('document')) return <FileText className="w-4 h-4" />;
    return <File className="w-4 h-4" />;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-ZA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return 'Unknown size';
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const deletePortfolioFile = async (filename) => {
    if (!confirm('Are you sure you want to delete this file?')) return;

    setDeleting(filename);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE}/api/delete-portfolio-file/${filename}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        await fetchUserFiles(); // Refresh the file list
        if (onFileDeleted) onFileDeleted();
      } else {
        throw new Error('Failed to delete file');
      }
    } catch (error) {
      console.error('Error deleting file:', error);
      alert('Failed to delete file');
    } finally {
      setDeleting(null);
    }
  };

  const deleteProjectGalleryItem = async (projectId) => {
    if (!confirm('Are you sure you want to delete this project?')) return;

    setDeleting(projectId);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE}/api/delete-project-gallery/${projectId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        await fetchUserFiles(); // Refresh the file list
        if (onFileDeleted) onFileDeleted();
      } else {
        throw new Error('Failed to delete project');
      }
    } catch (error) {
      console.error('Error deleting project:', error);
      alert('Failed to delete project');
    } finally {
      setDeleting(null);
    }
  };

  const isImageFile = (fileType) => {
    return fileType?.startsWith('image/');
  };

  const isVideoFile = (fileType) => {
    return fileType?.startsWith('video/');
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-400 mx-auto"></div>
        <p className="text-gray-400 mt-4">Loading files...</p>
      </div>
    );
  }

  if (!userFiles) {
    return (
      <Card className="bg-gray-800 border-gray-700">
        <CardContent className="text-center py-12">
          <File className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400">Failed to load files</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Profile Picture */}
      {userFiles.profile_picture && (
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">Profile Picture</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-4">
              {isImageFile(userFiles.profile_picture.content_type) ? (
                <img
                  src={`${API_BASE}/uploads/profile_pictures/${userFiles.profile_picture.filename}`}
                  alt="Profile"
                  className="w-20 h-20 rounded-full object-cover"
                />
              ) : (
                <div className="w-20 h-20 bg-gray-700 rounded-full flex items-center justify-center">
                  {getFileIcon(userFiles.profile_picture.content_type)}
                </div>
              )}
              <div className="flex-1">
                <p className="text-white font-medium">{userFiles.profile_picture.original_name}</p>
                <p className="text-gray-400 text-sm">
                  {formatFileSize(userFiles.profile_picture.file_size)} • 
                  Uploaded {formatDate(userFiles.profile_picture.uploaded_at)}
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open(`${API_BASE}/uploads/profile_pictures/${userFiles.profile_picture.filename}`, '_blank')}
                className="border-gray-600 text-gray-300"
              >
                <Eye className="w-4 h-4 mr-2" />
                View
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Resume */}
      {userFiles.resume && user?.role === 'freelancer' && (
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">Resume/CV</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gray-700 rounded-lg flex items-center justify-center">
                {getFileIcon(userFiles.resume.content_type)}
              </div>
              <div className="flex-1">
                <p className="text-white font-medium">{userFiles.resume.original_name}</p>
                <p className="text-gray-400 text-sm">
                  {formatFileSize(userFiles.resume.file_size)} • 
                  Uploaded {formatDate(userFiles.resume.uploaded_at)}
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open(`${API_BASE}/uploads/resumes/${userFiles.resume.filename}`, '_blank')}
                className="border-gray-600 text-gray-300"
              >
                <Download className="w-4 h-4 mr-2" />
                Download
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Portfolio Files */}
      {userFiles.portfolio_files && userFiles.portfolio_files.length > 0 && user?.role === 'freelancer' && (
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">Portfolio Files ({userFiles.portfolio_files.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              {userFiles.portfolio_files.map((file, index) => (
                <div key={index} className="flex items-center space-x-4 p-3 bg-gray-700 rounded-lg">
                  <div className="w-10 h-10 bg-gray-600 rounded-lg flex items-center justify-center">
                    {getFileIcon(file.content_type)}
                  </div>
                  <div className="flex-1">
                    <p className="text-white font-medium">{file.original_name}</p>
                    <p className="text-gray-400 text-sm">
                      {formatFileSize(file.file_size)} • 
                      Uploaded {formatDate(file.uploaded_at)}
                    </p>
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(`${API_BASE}/uploads/portfolios/${file.filename}`, '_blank')}
                      className="border-gray-600 text-gray-300"
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => deletePortfolioFile(file.filename)}
                      disabled={deleting === file.filename}
                      className="border-red-600 text-red-400 hover:bg-red-600 hover:text-white"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Project Gallery */}
      {userFiles.project_gallery && userFiles.project_gallery.length > 0 && user?.role === 'freelancer' && (
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">Project Gallery ({userFiles.project_gallery.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6">
              {userFiles.project_gallery.map((project) => (
                <div key={project.id} className="border border-gray-700 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <h3 className="text-white font-semibold text-lg mb-2">{project.title}</h3>
                      <p className="text-gray-300 mb-3">{project.description}</p>
                      
                      {project.technologies && project.technologies.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-3">
                          {project.technologies.map((tech, index) => (
                            <Badge key={index} className="bg-gray-700 text-gray-300">
                              <Tag className="w-3 h-3 mr-1" />
                              {tech}
                            </Badge>
                          ))}
                        </div>
                      )}
                      
                      <div className="flex items-center space-x-4 text-sm text-gray-400">
                        <span className="flex items-center">
                          <Calendar className="w-4 h-4 mr-1" />
                          {formatDate(project.created_at)}
                        </span>
                        {project.project_url && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => window.open(project.project_url, '_blank')}
                            className="text-blue-400 hover:text-blue-300 p-0 h-auto"
                          >
                            <Globe className="w-4 h-4 mr-1" />
                            View Project
                            <ExternalLink className="w-3 h-3 ml-1" />
                          </Button>
                        )}
                      </div>
                    </div>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => deleteProjectGalleryItem(project.id)}
                      disabled={deleting === project.id}
                      className="border-red-600 text-red-400 hover:bg-red-600 hover:text-white ml-4"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                  
                  {/* Project Media */}
                  <div className="aspect-video bg-gray-700 rounded-lg flex items-center justify-center">
                    {isImageFile(project.file_info.content_type) ? (
                      <img
                        src={`${API_BASE}/uploads/project_gallery/${project.file_info.filename}`}
                        alt={project.title}
                        className="w-full h-full object-cover rounded-lg cursor-pointer"
                        onClick={() => window.open(`${API_BASE}/uploads/project_gallery/${project.file_info.filename}`, '_blank')}
                      />
                    ) : isVideoFile(project.file_info.content_type) ? (
                      <video
                        src={`${API_BASE}/uploads/project_gallery/${project.file_info.filename}`}
                        controls
                        className="w-full h-full rounded-lg"
                      />
                    ) : (
                      <div className="text-center">
                        {getFileIcon(project.file_info.content_type)}
                        <p className="text-gray-400 mt-2">{project.file_info.original_name}</p>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => window.open(`${API_BASE}/uploads/project_gallery/${project.file_info.filename}`, '_blank')}
                          className="border-gray-600 text-gray-300 mt-2"
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          View File
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {!userFiles.profile_picture && 
       !userFiles.resume && 
       (!userFiles.portfolio_files || userFiles.portfolio_files.length === 0) && 
       (!userFiles.project_gallery || userFiles.project_gallery.length === 0) && (
        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="text-center py-12">
            <File className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No Files Uploaded</h3>
            <p className="text-gray-400">Start by uploading your profile picture, resume, or portfolio files.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default FileGallery;