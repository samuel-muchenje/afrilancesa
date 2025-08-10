import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Badge } from './ui/badge';
import { 
  Tag, Plus, X, Save, Loader2, CheckCircle,
  Briefcase, Code, Palette, Settings, Target
} from 'lucide-react';

const API_BASE = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';

const PortfolioCategoryManager = ({ user, token, onUpdate }) => {
  const [categories, setCategories] = useState({
    primary: '',
    secondary: [],
    tags: [],
    specializations: []
  });
  const [newSecondaryCategory, setNewSecondaryCategory] = useState('');
  const [newTag, setNewTag] = useState('');
  const [newSpecialization, setNewSpecialization] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // Predefined categories for suggestions
  const primaryCategories = [
    'Web Development',
    'Mobile Development',
    'UI/UX Design',
    'Digital Marketing',
    'Content Writing',
    'Data Science',
    'DevOps',
    'Graphic Design',
    'Video Production',
    'Consulting'
  ];

  const suggestionCategories = [
    'Frontend Development',
    'Backend Development',
    'Full-Stack Development',
    'Mobile App Development',
    'E-commerce Development',
    'WordPress Development',
    'React Development',
    'Node.js Development',
    'Python Development',
    'Machine Learning',
    'Data Analysis',
    'SEO Optimization',
    'Social Media Marketing',
    'Brand Identity',
    'Logo Design',
    'Website Design',
    'User Experience',
    'User Interface',
    'Database Design',
    'API Development'
  ];

  const technologyTags = [
    'React', 'Angular', 'Vue.js', 'Node.js', 'Python', 'JavaScript',
    'TypeScript', 'PHP', 'Java', 'C#', '.NET', 'Django', 'Flask',
    'Express.js', 'MongoDB', 'MySQL', 'PostgreSQL', 'Redis',
    'AWS', 'Azure', 'Google Cloud', 'Docker', 'Kubernetes',
    'HTML5', 'CSS3', 'SASS', 'Bootstrap', 'Tailwind CSS',
    'Adobe Photoshop', 'Adobe Illustrator', 'Figma', 'Sketch'
  ];

  useEffect(() => {
    // Load existing categories if user has them
    if (user?.portfolio_categories) {
      setCategories({
        primary: user.portfolio_categories.primary || '',
        secondary: user.portfolio_categories.secondary || [],
        tags: user.portfolio_categories.tags || [],
        specializations: user.portfolio_categories.specializations || []
      });
    }
  }, [user]);

  const handleSave = async () => {
    if (!token) return;

    setSaving(true);
    try {
      const response = await fetch(`${API_BASE}/api/portfolio/category/update`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          primary_category: categories.primary,
          secondary_categories: categories.secondary,
          portfolio_tags: categories.tags,
          specializations: categories.specializations
        })
      });

      if (response.ok) {
        setSaved(true);
        if (onUpdate) onUpdate();
        setTimeout(() => setSaved(false), 3000);
      } else {
        throw new Error('Failed to update categories');
      }
    } catch (error) {
      console.error('Error updating categories:', error);
      alert('Failed to update portfolio categories');
    } finally {
      setSaving(false);
    }
  };

  const addSecondaryCategory = () => {
    if (newSecondaryCategory.trim() && !categories.secondary.includes(newSecondaryCategory.trim())) {
      setCategories(prev => ({
        ...prev,
        secondary: [...prev.secondary, newSecondaryCategory.trim()]
      }));
      setNewSecondaryCategory('');
    }
  };

  const removeSecondaryCategory = (categoryToRemove) => {
    setCategories(prev => ({
      ...prev,
      secondary: prev.secondary.filter(cat => cat !== categoryToRemove)
    }));
  };

  const addTag = () => {
    if (newTag.trim() && !categories.tags.includes(newTag.trim())) {
      setCategories(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove) => {
    setCategories(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const addSpecialization = () => {
    if (newSpecialization.trim() && !categories.specializations.includes(newSpecialization.trim())) {
      setCategories(prev => ({
        ...prev,
        specializations: [...prev.specializations, newSpecialization.trim()]
      }));
      setNewSpecialization('');
    }
  };

  const removeSpecialization = (specializationToRemove) => {
    setCategories(prev => ({
      ...prev,
      specializations: prev.specializations.filter(spec => spec !== specializationToRemove)
    }));
  };

  const addSuggestedItem = (item, type) => {
    if (type === 'secondary' && !categories.secondary.includes(item)) {
      setCategories(prev => ({
        ...prev,
        secondary: [...prev.secondary, item]
      }));
    } else if (type === 'tag' && !categories.tags.includes(item)) {
      setCategories(prev => ({
        ...prev,
        tags: [...prev.tags, item]
      }));
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center justify-between">
            <div className="flex items-center">
              <Settings className="w-5 h-5 mr-2" />
              Portfolio Categories & Organization
            </div>
            <Button
              onClick={handleSave}
              disabled={saving}
              className="bg-gradient-to-r from-yellow-400 to-green-500 hover:from-yellow-500 hover:to-green-600 text-black font-semibold"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : saved ? (
                <>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Saved!
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </>
              )}
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-400">
            Organize your portfolio by setting categories, tags, and specializations to help clients find you more easily.
          </p>
        </CardContent>
      </Card>

      {/* Primary Category */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <Briefcase className="w-5 h-5 mr-2" />
            Primary Category
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <select
              value={categories.primary}
              onChange={(e) => setCategories(prev => ({ ...prev, primary: e.target.value }))}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
            >
              <option value="">Select your primary category</option>
              {primaryCategories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
            
            {categories.primary && (
              <div className="p-3 bg-yellow-400/10 border border-yellow-400/20 rounded-lg">
                <p className="text-yellow-400 text-sm">
                  <strong>Selected:</strong> {categories.primary}
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Secondary Categories */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <Target className="w-5 h-5 mr-2" />
            Secondary Categories
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex space-x-2">
              <Input
                placeholder="Add secondary category..."
                value={newSecondaryCategory}
                onChange={(e) => setNewSecondaryCategory(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addSecondaryCategory()}
                className="bg-gray-700 border-gray-600 text-white"
              />
              <Button
                onClick={addSecondaryCategory}
                className="bg-gray-700 hover:bg-gray-600 border-gray-600"
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>

            {categories.secondary.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {categories.secondary.map((category, index) => (
                  <Badge key={index} className="bg-blue-600 text-white pr-1">
                    {category}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeSecondaryCategory(category)}
                      className="ml-1 h-4 w-4 p-0 hover:bg-blue-700"
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </Badge>
                ))}
              </div>
            )}

            {/* Suggestions */}
            <div>
              <p className="text-gray-400 text-sm mb-2">Suggestions:</p>
              <div className="flex flex-wrap gap-2">
                {suggestionCategories
                  .filter(cat => !categories.secondary.includes(cat))
                  .slice(0, 8)
                  .map((category) => (
                    <Button
                      key={category}
                      variant="outline"
                      size="sm"
                      onClick={() => addSuggestedItem(category, 'secondary')}
                      className="text-xs border-gray-600 text-gray-300 hover:bg-gray-700"
                    >
                      <Plus className="w-3 h-3 mr-1" />
                      {category}
                    </Button>
                  ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Portfolio Tags */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <Tag className="w-5 h-5 mr-2" />
            Portfolio Tags
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex space-x-2">
              <Input
                placeholder="Add technology or skill tag..."
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addTag()}
                className="bg-gray-700 border-gray-600 text-white"
              />
              <Button
                onClick={addTag}
                className="bg-gray-700 hover:bg-gray-600 border-gray-600"
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>

            {categories.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {categories.tags.map((tag, index) => (
                  <Badge key={index} className="bg-green-600 text-white pr-1">
                    <Code className="w-3 h-3 mr-1" />
                    {tag}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeTag(tag)}
                      className="ml-1 h-4 w-4 p-0 hover:bg-green-700"
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </Badge>
                ))}
              </div>
            )}

            {/* Technology Suggestions */}
            <div>
              <p className="text-gray-400 text-sm mb-2">Popular Technologies:</p>
              <div className="flex flex-wrap gap-2">
                {technologyTags
                  .filter(tech => !categories.tags.includes(tech))
                  .slice(0, 12)
                  .map((tech) => (
                    <Button
                      key={tech}
                      variant="outline"
                      size="sm"
                      onClick={() => addSuggestedItem(tech, 'tag')}
                      className="text-xs border-gray-600 text-gray-300 hover:bg-gray-700"
                    >
                      <Plus className="w-3 h-3 mr-1" />
                      {tech}
                    </Button>
                  ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Specializations */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <Palette className="w-5 h-5 mr-2" />
            Specializations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex space-x-2">
              <Input
                placeholder="Add your specialization..."
                value={newSpecialization}
                onChange={(e) => setNewSpecialization(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addSpecialization()}
                className="bg-gray-700 border-gray-600 text-white"
              />
              <Button
                onClick={addSpecialization}
                className="bg-gray-700 hover:bg-gray-600 border-gray-600"
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>

            {categories.specializations.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {categories.specializations.map((specialization, index) => (
                  <Badge key={index} className="bg-purple-600 text-white pr-1">
                    <Palette className="w-3 h-3 mr-1" />
                    {specialization}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeSpecialization(specialization)}
                      className="ml-1 h-4 w-4 p-0 hover:bg-purple-700"
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </Badge>
                ))}
              </div>
            )}

            <div className="p-3 bg-blue-400/10 border border-blue-400/20 rounded-lg">
              <p className="text-blue-400 text-sm">
                <strong>Tip:</strong> Specializations help describe your unique expertise and what makes you stand out from other freelancers.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PortfolioCategoryManager;