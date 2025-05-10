
import type { Course, LearningStyle, ModuleType, DifficultyLevel } from '@/types/course';
import { Eye, Ear, Zap, Video, AudioLines, Gamepad2, FileTextIcon, ScanSearch, ListChecks } from 'lucide-react';

export const learningStyleIcons: Record<LearningStyle, React.ElementType> = {
  visual: Eye,
  auditory: Ear,
  kinesthetic: Zap,
};

export const moduleTypeIcons: Record<ModuleType, React.ElementType> = {
    video: Video,
    audio: AudioLines,
    interactive_exercise: Gamepad2,
    reading_material: FileTextIcon,
    ar_interactive_lab: ScanSearch,
};

export const difficultyLevels: DifficultyLevel[] = ['Beginner', 'Intermediate', 'Advanced'];

export const mockCourses: Course[] = [
  {
    id: 'course1',
    name: 'Visual Learners: Intro to Algebra',
    description: 'A course focusing on visual aids for understanding algebraic concepts. Learn about variables, equations, and basic algebraic operations through engaging videos and interactive simulations.',
    learningStyle: 'visual',
    category: 'Mathematics',
    difficulty: 'Beginner',
    modules: [
      { id: 'mod1_vid', type: 'video', title: 'Understanding Variables', url: 'https://www.youtube.com/embed/WZdZhuUSmpM', description: 'A short video explaining the concept of variables in algebra with visual examples.', estimatedDuration: '10 mins' },
      { id: 'mod1_ex', type: 'interactive_exercise', title: 'Algebra Tiles Simulation', url: 'https://example.com/algebra-tiles', description: 'Practice algebraic concepts using virtual algebra tiles.', estimatedDuration: '25 mins' },
      { id: 'mod1_read', type: 'reading_material', title: 'Key Algebraic Terms', content: '# Key Terms\n\n- **Variable**: A symbol (usually a letter) that represents a number.\n- **Equation**: A statement that two expressions are equal.\n- **Coefficient**: A numerical or constant quantity placed before and multiplying the variable in an algebraic expression (e.g., *4* in 4x y).', estimatedDuration: '15 mins'},
      { id: 'mod_ar_1', type: 'ar_interactive_lab', title: 'AR Equation Balancer', url: 'https://phet.colorado.edu/en/simulation/equation-grapher', description: 'Balance chemical equations in an augmented reality environment.', estimatedDuration: '30 mins'}
    ],
  },
  {
    id: 'course2',
    name: 'Auditory Learners: History of Science',
    description: 'Explore the fascinating history of scientific discoveries through engaging podcasts and audio lectures. This course is perfect for those who learn best by listening.',
    learningStyle: 'auditory',
    category: 'Science',
    difficulty: 'Intermediate',
    modules: [
      { id: 'mod2_aud', type: 'audio', title: 'Podcast: The Scientific Revolution', url: 'https://example.com/podcast-revolution', description: 'Listen to a podcast discussing the major figures and events of the Scientific Revolution.', estimatedDuration: '40 mins' },
      { id: 'mod2_vid', type: 'video', title: 'Animated Timeline of Discoveries', url: 'https://www.youtube.com/embed/YvtCLceNf30', description: 'A visually engaging animated timeline of key scientific discoveries throughout history.', estimatedDuration: '20 mins' },
      { id: 'mod2_read', type: 'reading_material', title: 'Biographies of Famous Scientists (Text for TTS)', content: '## Notable Scientists\n\n- **Isaac Newton**: Developed laws of motion and universal gravitation.\n- **Marie Curie**: Pioneer in radioactivity research and the first woman to win a Nobel Prize.', estimatedDuration: '30 mins' },
    ],
  },
   {
    id: 'course3',
    name: 'Kinesthetic Learning: Basics of Programming',
    description: 'Get hands-on with programming fundamentals. This course uses interactive exercises and coding challenges to teach you the basics of Python.',
    learningStyle: 'kinesthetic',
    category: 'Computer Science',
    difficulty: 'Beginner',
    modules: [
      { id: 'mod3_vid', type: 'video', title: 'What is Programming? (Engaging Explanation)', url: 'https://www.youtube.com/embed/zOjov-2OZ0E', description: 'An engaging video that explains what programming is, suitable for absolute beginners.', estimatedDuration: '12 mins' },
      { id: 'mod3_ex', type: 'interactive_exercise', title: 'Python Code Playground: Variables & Data Types', url: 'https://example.com/python-playground1', description: 'Practice Python syntax for variables and data types in an interactive playground.', estimatedDuration: '45 mins' },
      { id: 'mod3_ar', type: 'ar_interactive_lab', title: 'AR Algorithm Visualizer', url: 'https://visualgo.net/en', description: 'Visualize common algorithms in augmented reality to understand their step-by-step execution.', estimatedDuration: '35 mins'}
    ],
  },
   {
    id: 'course4',
    name: 'Advanced AR Chemistry Lab',
    description: 'Dive deep into chemical reactions and molecular structures with advanced AR interactive laboratory simulations. Perfect for hands-on virtual experiments.',
    learningStyle: 'visual', 
    category: 'Science',
    difficulty: 'Advanced',
    modules: [
      { id: 'mod4_vid', type: 'video', title: 'Introduction to AR Lab Safety', url: 'https://www.youtube.com/embed/Qi3h18wJJiI', description: 'Learn about safety protocols when working with AR chemistry labs.', estimatedDuration: '10 mins' },
      { id: 'mod4_ar1', type: 'ar_interactive_lab', title: 'AR Titration Experiment', url: 'https://example.com/ar-titration', description: 'Perform a virtual titration experiment in augmented reality.', estimatedDuration: '50 mins'}, // URL not in user mapping, kept as example.com
      { id: 'mod4_ar2', type: 'ar_interactive_lab', title: 'AR Molecular Building', url: 'https://example.com/ar-molecules', description: 'Build and inspect molecular structures in an interactive AR environment.', estimatedDuration: '45 mins'}, // URL not in user mapping, kept as example.com
      { id: 'mod4_read', type: 'reading_material', title: 'Lab Report Guidelines', content: 'Your lab reports should follow standard scientific formatting...', estimatedDuration: '20 mins'}
    ],
  },
  // Adding courses for the other AR labs mentioned by the user
  {
    id: 'course5',
    name: 'Physics Explorations with AR',
    description: 'Explore fundamental physics concepts using interactive AR simulations.',
    learningStyle: 'kinesthetic',
    category: 'Physics',
    difficulty: 'Intermediate',
    modules: [
        { id: 'mod5_ar1', type: 'ar_interactive_lab', title: 'AR Electric Fields Explorer', url: 'https://ophysics.com/electricity.html', description: 'Visualize and interact with electric fields in AR.', estimatedDuration: '40 mins'},
        { id: 'mod5_ar2', type: 'ar_interactive_lab', title: 'AR Free Body Diagrams', url: 'https://www.physicsclassroom.com/Physics-Interactives/Newtons-Laws/Free-Body-Diagram/Free-Body-Diagram-Interactive', description: 'Construct and analyze free body diagrams in an AR environment.', estimatedDuration: '35 mins'}
    ]
  },
  {
    id: 'course6',
    name: 'Signal Processing with AR',
    description: 'Understand complex signal processing concepts like Fourier series through AR visualization.',
    learningStyle: 'visual',
    category: 'Engineering',
    difficulty: 'Advanced',
    modules: [
        { id: 'mod6_ar1', type: 'ar_interactive_lab', title: 'AR Fourier Simulator', url: 'https://www.falstad.com/fourier/', description: 'Simulate and visualize Fourier series in augmented reality.', estimatedDuration: '50 mins'}
    ]
  }
];

