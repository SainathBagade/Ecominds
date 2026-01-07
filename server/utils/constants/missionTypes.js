/**
 * Mission Types Constants
 * Defines all mission types, categories, and templates
 */

// Mission Types
const MISSION_TYPES = {
  ECO_ACTION: 'eco_action',
  LEARNING: 'learning',
  COMMUNITY: 'community',
  RECYCLING: 'recycling',
  CONSERVATION: 'conservation',
  AWARENESS: 'awareness',
  RESEARCH: 'research',
  VOLUNTEER: 'volunteer',
};

// Mission Categories
const MISSION_CATEGORIES = {
  WATER: 'water',
  ENERGY: 'energy',
  WASTE: 'waste',
  BIODIVERSITY: 'biodiversity',
  AIR: 'air',
  CLIMATE: 'climate',
  POLLUTION: 'pollution',
  SUSTAINABILITY: 'sustainability',
};

// Mission Difficulties
const MISSION_DIFFICULTIES = {
  EASY: 'easy',
  MEDIUM: 'medium',
  HARD: 'hard',
  EXPERT: 'expert',
};

// Mission Status
const MISSION_STATUS = {
  DRAFT: 'draft',
  ACTIVE: 'active',
  COMPLETED: 'completed',
  EXPIRED: 'expired',
  CANCELLED: 'cancelled',
};

// Mission Verification Status
const VERIFICATION_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  NEEDS_REVISION: 'needs_revision',
};

// Predefined Mission Templates
const MISSION_TEMPLATES = {
  // Water Conservation Missions
  WATER_SAVE: {
    title: 'Save Water Challenge',
    description: 'Reduce your daily water usage by implementing water-saving techniques',
    type: MISSION_TYPES.ECO_ACTION,
    category: MISSION_CATEGORIES.WATER,
    difficulty: MISSION_DIFFICULTIES.EASY,
    points: 30,
    requirements: [
      'Turn off taps while brushing teeth',
      'Take shorter showers (max 5 minutes)',
      'Fix any leaking faucets',
      'Collect rainwater for plants',
    ],
    duration: 7, // days
  },
  
  WATER_AUDIT: {
    title: 'Home Water Audit',
    description: 'Conduct a water audit of your home and identify areas to reduce consumption',
    type: MISSION_TYPES.RESEARCH,
    category: MISSION_CATEGORIES.WATER,
    difficulty: MISSION_DIFFICULTIES.MEDIUM,
    points: 50,
    requirements: [
      'Check all faucets for leaks',
      'Measure shower flow rate',
      'Calculate daily water usage',
      'Create improvement plan',
    ],
    duration: 3,
  },
  
  // Energy Conservation Missions
  ENERGY_SAVER: {
    title: 'Energy Saving Hero',
    description: 'Reduce household energy consumption by 20%',
    type: MISSION_TYPES.ECO_ACTION,
    category: MISSION_CATEGORIES.ENERGY,
    difficulty: MISSION_DIFFICULTIES.MEDIUM,
    points: 40,
    requirements: [
      'Switch to LED bulbs',
      'Unplug unused devices',
      'Use natural light when possible',
      'Track energy usage',
    ],
    duration: 14,
  },
  
  SOLAR_RESEARCH: {
    title: 'Solar Energy Explorer',
    description: 'Research and present benefits of solar energy',
    type: MISSION_TYPES.RESEARCH,
    category: MISSION_CATEGORIES.ENERGY,
    difficulty: MISSION_DIFFICULTIES.HARD,
    points: 75,
    requirements: [
      'Research solar panel technology',
      'Calculate potential savings',
      'Create presentation (min 5 slides)',
      'Share findings with class',
    ],
    duration: 7,
  },
  
  // Waste Management Missions
  ZERO_WASTE_WEEK: {
    title: 'Zero Waste Week',
    description: 'Minimize waste production for one week',
    type: MISSION_TYPES.ECO_ACTION,
    category: MISSION_CATEGORIES.WASTE,
    difficulty: MISSION_DIFFICULTIES.HARD,
    points: 60,
    requirements: [
      'Refuse single-use plastics',
      'Compost organic waste',
      'Recycle properly',
      'Track waste reduction',
    ],
    duration: 7,
  },
  
  RECYCLING_CHAMPION: {
    title: 'Recycling Champion',
    description: 'Set up and maintain a recycling system at home',
    type: MISSION_TYPES.RECYCLING,
    category: MISSION_CATEGORIES.WASTE,
    difficulty: MISSION_DIFFICULTIES.EASY,
    points: 25,
    requirements: [
      'Create recycling bins (paper, plastic, glass)',
      'Label bins clearly',
      'Educate family members',
      'Maintain for 2 weeks',
    ],
    duration: 14,
  },
  
  // Biodiversity Missions
  PLANT_TREES: {
    title: 'Tree Planting Initiative',
    description: 'Plant and care for trees in your community',
    type: MISSION_TYPES.CONSERVATION,
    category: MISSION_CATEGORIES.BIODIVERSITY,
    difficulty: MISSION_DIFFICULTIES.MEDIUM,
    points: 50,
    requirements: [
      'Plant at least 3 trees',
      'Choose native species',
      'Water regularly',
      'Take progress photos',
    ],
    duration: 30,
  },
  
  BIRD_WATCH: {
    title: 'Backyard Biodiversity',
    description: 'Document bird species in your area',
    type: MISSION_TYPES.RESEARCH,
    category: MISSION_CATEGORIES.BIODIVERSITY,
    difficulty: MISSION_DIFFICULTIES.EASY,
    points: 20,
    requirements: [
      'Observe birds for 1 week',
      'Identify at least 5 species',
      'Take photos or sketches',
      'Create species log',
    ],
    duration: 7,
  },
  
  // Community Missions
  COMMUNITY_CLEANUP: {
    title: 'Community Clean-up Drive',
    description: 'Organize or participate in a local cleanup event',
    type: MISSION_TYPES.COMMUNITY,
    category: MISSION_CATEGORIES.POLLUTION,
    difficulty: MISSION_DIFFICULTIES.MEDIUM,
    points: 70,
    requirements: [
      'Gather at least 5 participants',
      'Collect and properly dispose trash',
      'Document before/after photos',
      'Report total waste collected',
    ],
    duration: 1,
  },
  
  ECO_AWARENESS: {
    title: 'Eco Awareness Campaign',
    description: 'Create and share environmental awareness content',
    type: MISSION_TYPES.AWARENESS,
    category: MISSION_CATEGORIES.SUSTAINABILITY,
    difficulty: MISSION_DIFFICULTIES.HARD,
    points: 80,
    requirements: [
      'Create poster or video',
      'Share on social media',
      'Reach at least 50 people',
      'Document engagement',
    ],
    duration: 7,
  },
  
  // Learning Missions
  CLIMATE_EXPERT: {
    title: 'Climate Change Expert',
    description: 'Complete climate change learning module',
    type: MISSION_TYPES.LEARNING,
    category: MISSION_CATEGORIES.CLIMATE,
    difficulty: MISSION_DIFFICULTIES.MEDIUM,
    points: 45,
    requirements: [
      'Complete 5 lessons on climate',
      'Pass quiz with 80%+ score',
      'Write summary (200 words)',
      'Share one action item',
    ],
    duration: 7,
  },
  
  // Volunteer Missions
  ECO_VOLUNTEER: {
    title: 'Environmental Volunteer',
    description: 'Volunteer with local environmental organization',
    type: MISSION_TYPES.VOLUNTEER,
    category: MISSION_CATEGORIES.SUSTAINABILITY,
    difficulty: MISSION_DIFFICULTIES.HARD,
    points: 100,
    requirements: [
      'Complete 10 hours of service',
      'Get verification from organization',
      'Document activities',
      'Write reflection essay',
    ],
    duration: 30,
  },
};

// Mission Requirements Types
const REQUIREMENT_TYPES = {
  ACTION: 'action',
  DOCUMENTATION: 'documentation',
  MEASUREMENT: 'measurement',
  EDUCATION: 'education',
  SOCIAL: 'social',
  TIME_BASED: 'time_based',
};

// Evidence Types
const EVIDENCE_TYPES = {
  PHOTO: 'photo',
  VIDEO: 'video',
  DOCUMENT: 'document',
  LINK: 'link',
  MEASUREMENT: 'measurement',
  TESTIMONIAL: 'testimonial',
  CERTIFICATE: 'certificate',
};

// Mission Icons (for UI)
const MISSION_ICONS = {
  [MISSION_TYPES.ECO_ACTION]: '🌱',
  [MISSION_TYPES.LEARNING]: '📚',
  [MISSION_TYPES.COMMUNITY]: '👥',
  [MISSION_TYPES.RECYCLING]: '♻️',
  [MISSION_TYPES.CONSERVATION]: '🌳',
  [MISSION_TYPES.AWARENESS]: '📢',
  [MISSION_TYPES.RESEARCH]: '🔬',
  [MISSION_TYPES.VOLUNTEER]: '🤝',
};

// Category Icons
const CATEGORY_ICONS = {
  [MISSION_CATEGORIES.WATER]: '💧',
  [MISSION_CATEGORIES.ENERGY]: '⚡',
  [MISSION_CATEGORIES.WASTE]: '🗑️',
  [MISSION_CATEGORIES.BIODIVERSITY]: '🦋',
  [MISSION_CATEGORIES.AIR]: '💨',
  [MISSION_CATEGORIES.CLIMATE]: '🌍',
  [MISSION_CATEGORIES.POLLUTION]: '🏭',
  [MISSION_CATEGORIES.SUSTAINABILITY]: '🔄',
};

// Mission Colors (for UI)
const MISSION_COLORS = {
  [MISSION_DIFFICULTIES.EASY]: '#4CAF50',      // Green
  [MISSION_DIFFICULTIES.MEDIUM]: '#FF9800',    // Orange
  [MISSION_DIFFICULTIES.HARD]: '#F44336',      // Red
  [MISSION_DIFFICULTIES.EXPERT]: '#9C27B0',    // Purple
};

// Points by Difficulty
const DIFFICULTY_POINTS = {
  [MISSION_DIFFICULTIES.EASY]: { min: 10, max: 30 },
  [MISSION_DIFFICULTIES.MEDIUM]: { min: 30, max: 60 },
  [MISSION_DIFFICULTIES.HARD]: { min: 60, max: 100 },
  [MISSION_DIFFICULTIES.EXPERT]: { min: 100, max: 200 },
};

// Mission Duration Limits (in days)
const DURATION_LIMITS = {
  MIN: 1,
  MAX: 90,
  RECOMMENDED: {
    [MISSION_DIFFICULTIES.EASY]: 7,
    [MISSION_DIFFICULTIES.MEDIUM]: 14,
    [MISSION_DIFFICULTIES.HARD]: 21,
    [MISSION_DIFFICULTIES.EXPERT]: 30,
  },
};

// Participation Limits
const PARTICIPATION_LIMITS = {
  MIN_PARTICIPANTS: 1,
  MAX_PARTICIPANTS: 1000,
  RECOMMENDED_GROUP_SIZE: {
    [MISSION_TYPES.COMMUNITY]: 10,
    [MISSION_TYPES.VOLUNTEER]: 5,
    [MISSION_TYPES.LEARNING]: 1,
  },
};

// Helper Functions
const getMissionTemplate = (templateKey) => {
  return MISSION_TEMPLATES[templateKey] || null;
};

const getAllMissionTemplates = () => {
  return Object.values(MISSION_TEMPLATES);
};

const getMissionsByCategory = (category) => {
  return Object.values(MISSION_TEMPLATES).filter(
    mission => mission.category === category
  );
};

const getMissionsByType = (type) => {
  return Object.values(MISSION_TEMPLATES).filter(
    mission => mission.type === type
  );
};

const getMissionsByDifficulty = (difficulty) => {
  return Object.values(MISSION_TEMPLATES).filter(
    mission => mission.difficulty === difficulty
  );
};

const getPointsForDifficulty = (difficulty) => {
  return DIFFICULTY_POINTS[difficulty] || { min: 10, max: 50 };
};

const getRecommendedDuration = (difficulty) => {
  return DURATION_LIMITS.RECOMMENDED[difficulty] || 7;
};

module.exports = {
  MISSION_TYPES,
  MISSION_CATEGORIES,
  MISSION_DIFFICULTIES,
  MISSION_STATUS,
  VERIFICATION_STATUS,
  MISSION_TEMPLATES,
  REQUIREMENT_TYPES,
  EVIDENCE_TYPES,
  MISSION_ICONS,
  CATEGORY_ICONS,
  MISSION_COLORS,
  DIFFICULTY_POINTS,
  DURATION_LIMITS,
  PARTICIPATION_LIMITS,
  
  // Helper functions
  getMissionTemplate,
  getAllMissionTemplates,
  getMissionsByCategory,
  getMissionsByType,
  getMissionsByDifficulty,
  getPointsForDifficulty,
  getRecommendedDuration,
};