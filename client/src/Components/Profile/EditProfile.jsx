
// EditProfile.jsx
import React, { useState } from 'react';
import { User, Mail, School, BookOpen, Edit2, Save, X, Camera } from 'lucide-react';

const EditProfile = ({ initialProfile = {}, onSave, loading = false }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState({
    name: initialProfile.name || 'Eco Learner',
    email: initialProfile.email || 'ecolearner@ecominds.com',
    school: initialProfile.school || 'Green Valley High School',
    grade: initialProfile.grade || '10th Grade',
    bio: initialProfile.bio || 'Passionate about climate action and sustainable living!',
    avatar: initialProfile.avatar || null
  });

  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};

    if (!profile.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!profile.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(profile.email)) {
      newErrors.email = 'Email is invalid';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (validateForm()) {
      if (onSave) {
        onSave(profile);
      }
      setIsEditing(false);
    }
  };

  const handleCancel = () => {
    setProfile({
      name: initialProfile.name || 'Eco Learner',
      email: initialProfile.email || 'ecolearner@ecominds.com',
      school: initialProfile.school || 'Green Valley High School',
      grade: initialProfile.grade || '10th Grade',
      bio: initialProfile.bio || 'Passionate about climate action and sustainable living!',
      avatar: initialProfile.avatar || null
    });
    setErrors({});
    setIsEditing(false);
  };

  const handleChange = (field, value) => {
    setProfile(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <User className="w-6 h-6 text-gray-600" />
          Profile Settings
        </h2>
        {!isEditing ? (
          <button
            onClick={() => setIsEditing(true)}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            disabled={loading}
          >
            <Edit2 className="w-4 h-4" />
            Edit
          </button>
        ) : (
          <div className="flex gap-2">
            <button
              onClick={handleSave}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              disabled={loading}
            >
              <Save className="w-4 h-4" />
              Save
            </button>
            <button
              onClick={handleCancel}
              className="flex items-center gap-2 px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
              disabled={loading}
            >
              <X className="w-4 h-4" />
              Cancel
            </button>
          </div>
        )}
      </div>

      {/* Avatar Section */}
      <div className="flex justify-center mb-6">
        <div className="relative">
          <div className="w-24 h-24 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center text-white text-3xl font-bold">
            {profile.avatar ? (
              <img src={profile.avatar} alt="Avatar" className="w-full h-full rounded-full object-cover" />
            ) : (
              profile.name.split(' ').map(n => n[0]).join('').toUpperCase()
            )}
          </div>
          {isEditing && (
            <button className="absolute bottom-0 right-0 bg-green-600 text-white p-2 rounded-full hover:bg-green-700 transition-colors">
              <Camera className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
            <User className="w-4 h-4" />
            Name *
          </label>
          <input
            type="text"
            value={profile.name}
            onChange={(e) => handleChange('name', e.target.value)}
            disabled={!isEditing}
            className={`w-full px-4 py-2 border-2 rounded-lg focus:outline-none transition-colors ${
              errors.name 
                ? 'border-red-500 focus:border-red-600' 
                : 'border-gray-200 focus:border-green-500'
            } ${!isEditing && 'bg-gray-50'}`}
          />
          {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
            <Mail className="w-4 h-4" />
            Email *
          </label>
          <input
            type="email"
            value={profile.email}
            onChange={(e) => handleChange('email', e.target.value)}
            disabled={!isEditing}
            className={`w-full px-4 py-2 border-2 rounded-lg focus:outline-none transition-colors ${
              errors.email 
                ? 'border-red-500 focus:border-red-600' 
                : 'border-gray-200 focus:border-green-500'
            } ${!isEditing && 'bg-gray-50'}`}
          />
          {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
            <School className="w-4 h-4" />
            School
          </label>
          <input
            type="text"
            value={profile.school}
            onChange={(e) => handleChange('school', e.target.value)}
            disabled={!isEditing}
            className={`w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-green-500 focus:outline-none ${!isEditing && 'bg-gray-50'}`}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
            <BookOpen className="w-4 h-4" />
            Grade
          </label>
          <input
            type="text"
            value={profile.grade}
            onChange={(e) => handleChange('grade', e.target.value)}
            disabled={!isEditing}
            className={`w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-green-500 focus:outline-none ${!isEditing && 'bg-gray-50'}`}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
          <textarea
            value={profile.bio}
            onChange={(e) => handleChange('bio', e.target.value)}
            disabled={!isEditing}
            rows="4"
            maxLength="200"
            className={`w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-green-500 focus:outline-none resize-none ${!isEditing && 'bg-gray-50'}`}
          />
          <p className="text-xs text-gray-500 mt-1">{profile.bio.length}/200 characters</p>
        </div>
      </div>
    </div>
  );
};

export default EditProfile;