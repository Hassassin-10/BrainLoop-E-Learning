
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { PlusCircle, Save, Trash2, Edit3, Loader2, ListChecks, BookCopy, BarChart3, DatabaseZap, FlaskConical, Info } from 'lucide-react';
import type { Course, CourseModule, LearningStyle, ModuleType, DifficultyLevel } from '@/types/course';
import { mockCourses as initialCourses, learningStyleIcons, moduleTypeIcons, difficultyLevels } from '@/data/mockCourses';


export default function AdminPage() {
  const { studentId, isAuthenticated } = useAuth();
  const [courses, setCourses] = useState<Course[]>(initialCourses);
  const [currentCourse, setCurrentCourse] = useState<Partial<Course>>({});
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const [mounted, setMounted] = useState(false);

  const isAdmin = isAuthenticated && studentId === '8918';
  const adminOnlyMessage = "Only Admin (ID: 8918) has permission for this action.";

  useEffect(() => {
    setMounted(true);
    // Here you would typically fetch courses from your backend
  }, []);


  const handleInputChange = (field: keyof Course, value: any) => {
    if (!isAdmin) return;
    setCurrentCourse((prev) => ({ ...prev, [field]: value }));
  };

  const handleModuleChange = (index: number, field: keyof CourseModule, value: any) => {
    if (!isAdmin) return;
    const updatedModules = [...(currentCourse.modules || [])];
    updatedModules[index] = { ...updatedModules[index], [field]: value };
    setCurrentCourse((prev) => ({ ...prev, modules: updatedModules }));
  };

  const addModule = () => {
    if (!isAdmin) return;
    const newModule: CourseModule = {
      id: `mod${Date.now()}`,
      type: 'video',
      title: '',
      estimatedDuration: '30 mins',
    };
    setCurrentCourse((prev) => ({
      ...prev,
      modules: [...(prev.modules || []), newModule],
    }));
  };

  const removeModule = (index: number) => {
    if (!isAdmin) return;
    setCurrentCourse((prev) => ({
      ...prev,
      modules: prev.modules?.filter((_, i) => i !== index),
    }));
  };

  const saveCourse = async () => {
    if (!isAdmin) {
      toast({ title: 'Permission Denied', description: adminOnlyMessage, variant: 'destructive' });
      return;
    }
    if (!currentCourse.name || !currentCourse.learningStyle || !currentCourse.difficulty || !currentCourse.category) {
      toast({ title: 'Error', description: 'Course Name, Learning Style, Category, and Difficulty are required.', variant: 'destructive' });
      return;
    }
    
    setIsLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));

    if (isEditing && currentCourse.id) {
      setCourses((prev) =>
        prev.map((c) => (c.id === currentCourse.id ? (currentCourse as Course) : c))
      );
      toast({ title: 'Success', description: 'Course updated!' });
    } else {
      const newCourse = { ...currentCourse, id: `course${Date.now()}` } as Course;
      setCourses((prev) => [...prev, newCourse]);
      toast({ title: 'Success', description: 'Course created!' });
    }
    setIsLoading(false);
    resetForm();
  };

  const editCourse = (course: Course) => {
    if (!isAdmin) {
       toast({ title: 'Permission Denied', description: "Only Admin can edit courses.", variant: 'destructive' });
      return;
    }
    setCurrentCourse(course);
    setIsEditing(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const deleteCourse = async (id: string) => {
    if (!isAdmin) {
      toast({ title: 'Permission Denied', description: "Only Admin can delete courses.", variant: 'destructive' });
      return;
    }
    setIsLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
    setCourses((prev) => prev.filter((c) => c.id !== id));
    toast({ title: 'Success', description: 'Course deleted.' });
    setIsLoading(false);
  };

  const resetForm = () => {
    setCurrentCourse({modules: []});
    setIsEditing(false);
  };


  if (!mounted) {
     return (
       <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  const CourseIcon = currentCourse.learningStyle ? learningStyleIcons[currentCourse.learningStyle] : BookCopy;


  return (
    <TooltipProvider>
    <div className="container mx-auto py-8 px-4 md:px-6 space-y-8">
      <Card className="shadow-xl">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-primary flex items-center">
           <CourseIcon className="mr-2 h-6 w-6" />
            {isAdmin ? (isEditing ? 'Edit Course' : 'Create New Course') : 'View Course Configuration (Admin Only)'}
          </CardTitle>
          <CardDescription>
            {isAdmin ? 'Configure personalized courses with modules tailored to different learning styles, subjects, and difficulties. Include video lectures and AR interactive labs.' : 'Course management is restricted to administrators. (Admin ID: 8918)'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <Label htmlFor="courseName">Course Name</Label>
            <Input
              id="courseName"
              value={currentCourse.name || ''}
              onChange={(e) => handleInputChange('name', e.target.value)}
              placeholder="e.g., Introduction to Calculus"
              className="bg-background"
              disabled={!isAdmin || isLoading}
            />
          </div>
          <div>
            <Label htmlFor="courseDescription">Description</Label>
            <Textarea
              id="courseDescription"
              value={currentCourse.description || ''}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Briefly describe this course."
              className="bg-background"
              disabled={!isAdmin || isLoading}
            />
          </div>
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="learningStyle">Primary Learning Style</Label>
              <Select
                value={currentCourse.learningStyle || ''}
                onValueChange={(value) => handleInputChange('learningStyle', value as LearningStyle)}
                disabled={!isAdmin || isLoading}
              >
                <SelectTrigger id="learningStyle" className="bg-background">
                  <SelectValue placeholder="Select learning style" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(learningStyleIcons).map(([style, IconComponent]) => ( 
                    <SelectItem key={style} value={style}><IconComponent className="mr-2 h-4 w-4 inline-block"/> {style.charAt(0).toUpperCase() + style.slice(1)}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="courseCategory">Category</Label>
              <Input
                id="courseCategory"
                value={currentCourse.category || ''}
                onChange={(e) => handleInputChange('category', e.target.value)}
                placeholder="e.g., Science, Arts"
                className="bg-background"
                disabled={!isAdmin || isLoading}
              />
            </div>
            <div>
              <Label htmlFor="courseDifficulty">Difficulty</Label>
              <Select
                value={currentCourse.difficulty || ''}
                onValueChange={(value) => handleInputChange('difficulty', value as DifficultyLevel)}
                disabled={!isAdmin || isLoading}
              >
                <SelectTrigger id="courseDifficulty" className="bg-background">
                  <SelectValue placeholder="Select difficulty" />
                </SelectTrigger>
                <SelectContent>
                  {difficultyLevels.map(level => (
                    <SelectItem key={level} value={level}>{level}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground flex items-center">
                <ListChecks className="mr-2 h-5 w-5" /> Course Modules
            </h3>
            {(currentCourse.modules || []).map((module, index) => {
              const ModuleIcon = moduleTypeIcons[module.type] || ListChecks;
              return (
              <Card key={module.id} className="p-4 bg-secondary/30 space-y-3">
                <div className="flex justify-between items-center">
                  <p className="font-medium text-primary flex items-center"><ModuleIcon className="mr-2 h-5 w-5" /> Module {index + 1}</p>
                  <Tooltip>
                    <TooltipTrigger asChild>
                        <Button variant="ghost" size="sm" onClick={() => removeModule(index)} className="text-destructive hover:text-destructive/80" disabled={!isAdmin || isLoading}>
                            <Trash2 className="mr-1 h-4 w-4" /> Remove
                        </Button>
                    </TooltipTrigger>
                    {!isAdmin && <TooltipContent><p>{adminOnlyMessage}</p></TooltipContent>}
                  </Tooltip>
                </div>
                <div>
                  <Label htmlFor={`moduleTitle${index}`}>Title</Label>
                  <Input
                    id={`moduleTitle${index}`}
                    value={module.title}
                    onChange={(e) => handleModuleChange(index, 'title', e.target.value)}
                    placeholder="Module title"
                    className="bg-background"
                    disabled={!isAdmin || isLoading}
                  />
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                    <div>
                    <Label htmlFor={`moduleType${index}`}>Type</Label>
                    <Select
                        value={module.type}
                        onValueChange={(value) => handleModuleChange(index, 'type', value as ModuleType)}
                        disabled={!isAdmin || isLoading}
                    >
                        <SelectTrigger id={`moduleType${index}`} className="bg-background">
                           <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(moduleTypeIcons).map(([type, IconComponent]) => ( 
                             <SelectItem key={type} value={type}><IconComponent className="mr-2 h-4 w-4 inline-block"/> {type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</SelectItem>
                          ))}
                        </SelectContent>
                    </Select>
                    </div>
                    <div>
                        <Label htmlFor={`moduleDuration${index}`}>Estimated Duration</Label>
                        <Input
                        id={`moduleDuration${index}`}
                        value={module.estimatedDuration || ''}
                        onChange={(e) => handleModuleChange(index, 'estimatedDuration', e.target.value)}
                        placeholder="e.g., 30 mins"
                        className="bg-background"
                        disabled={!isAdmin || isLoading}
                        />
                    </div>
                </div>
                {(module.type === 'video' || module.type === 'audio' || module.type === 'interactive_exercise' || module.type === 'ar_interactive_lab') && (
                  <div>
                    <Label htmlFor={`moduleUrl${index}`}>{module.type === 'ar_interactive_lab' ? 'AR Lab URL' : 'Resource URL'}</Label>
                    <Input
                      id={`moduleUrl${index}`}
                      value={module.url || ''}
                      onChange={(e) => handleModuleChange(index, 'url', e.target.value)}
                      placeholder={module.type === 'ar_interactive_lab' ? 'https://example.com/ar-lab-link' : 'https://example.com/resource'}
                      className="bg-background"
                      disabled={!isAdmin || isLoading}
                    />
                  </div>
                )}
                {module.type === 'reading_material' && (
                  <div>
                    <Label htmlFor={`moduleContent${index}`}>Content (Markdown supported)</Label>
                    <Textarea
                      id={`moduleContent${index}`}
                      value={module.content || ''}
                      onChange={(e) => handleModuleChange(index, 'content', e.target.value)}
                      placeholder="Enter reading material content here."
                      className="bg-background min-h-[100px]"
                      disabled={!isAdmin || isLoading}
                    />
                  </div>
                )}
              </Card>
            )})}
            <Tooltip>
                <TooltipTrigger asChild>
                     {/* The button itself is wrapped, so its disabled state is handled by the TooltipTrigger correctly */}
                    <span tabIndex={!isAdmin ? 0 : -1}> {/* Make span focusable when button is disabled for tooltip */}
                        <Button variant="outline" onClick={addModule} className="text-accent border-accent hover:bg-accent/10" disabled={!isAdmin || isLoading}>
                            <PlusCircle className="mr-2 h-4 w-4" /> Add Module
                        </Button>
                    </span>
                </TooltipTrigger>
                 {!isAdmin && <TooltipContent><p>{adminOnlyMessage}</p></TooltipContent>}
            </Tooltip>
          </div>
        </CardContent>
        <CardFooter className="flex justify-end gap-2">
          {isEditing && (
            <Tooltip>
                <TooltipTrigger asChild>
                    <span tabIndex={!isAdmin ? 0 : -1}>
                        <Button variant="ghost" onClick={resetForm} disabled={isLoading || !isAdmin}>Cancel</Button>
                    </span>
                </TooltipTrigger>
                {!isAdmin && <TooltipContent><p>{adminOnlyMessage}</p></TooltipContent>}
            </Tooltip>
            )}
            <Tooltip>
                <TooltipTrigger asChild>
                     <span tabIndex={!isAdmin ? 0 : -1}>
                        <Button onClick={saveCourse} disabled={isLoading || !isAdmin} className="bg-primary text-primary-foreground hover:bg-primary/90">
                            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            <Save className="mr-2 h-4 w-4" /> {isEditing ? 'Update Course' : 'Create Course'}
                        </Button>
                    </span>
                </TooltipTrigger>
                {!isAdmin && <TooltipContent><p>{adminOnlyMessage}</p></TooltipContent>}
            </Tooltip>
        </CardFooter>
      </Card>

      <Card className="shadow-xl">
        <CardHeader>
          <CardTitle className="text-xl font-bold text-primary flex items-center">
            <BarChart3 className="mr-2 h-6 w-6" /> Existing Courses
          </CardTitle>
          <CardDescription>Manage and view all configured courses, including video lectures and AR labs.</CardDescription>
        </CardHeader>
        <CardContent>
          {courses.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">{isAdmin ? "No courses created yet." : "No courses available to view."}</p>
          ) : (
            <Accordion type="single" collapsible className="w-full">
              {courses.map((course) => {
                const PathIcon = learningStyleIcons[course.learningStyle];
                return (
                  <AccordionItem value={course.id} key={course.id}>
                    <AccordionTrigger className="hover:no-underline">
                        <div className="flex items-center gap-2">
                            <PathIcon className="h-5 w-5 text-accent"/>
                            <span className="font-medium">{course.name}</span>
                        </div>
                    </AccordionTrigger>
                    <AccordionContent className="p-4 space-y-3 bg-secondary/20 rounded-md">
                      <p><strong className="text-foreground">Description:</strong> {course.description}</p>
                      <div className="grid sm:grid-cols-3 gap-2 text-sm">
                        <p><strong className="text-foreground">Learning Style:</strong> <span className="capitalize">{course.learningStyle}</span></p>
                        <p><strong className="text-foreground">Category:</strong> {course.category}</p>
                        <p><strong className="text-foreground">Difficulty:</strong> {course.difficulty}</p>
                      </div>
                      <h4 className="font-semibold text-foreground mt-2">Modules:</h4>
                      {course.modules.length > 0 ? (
                        <ul className="list-disc pl-5 space-y-1 text-sm">
                          {course.modules.map((mod) => {
                            const ModIcon = moduleTypeIcons[mod.type] || ListChecks;
                            let typeDisplay = mod.type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
                            if (mod.type === 'ar_interactive_lab') typeDisplay = 'AR Interactive Lab';

                            return (
                            <li key={mod.id} className="flex items-center">
                              <ModIcon className="mr-2 h-4 w-4 text-muted-foreground" />
                              <strong>{mod.title}</strong>&nbsp;({typeDisplay})
                              {mod.estimatedDuration && <span className="text-muted-foreground text-xs ml-1">({mod.estimatedDuration})</span>}
                              {mod.url && <a href={mod.url} target="_blank" rel="noopener noreferrer" className="ml-2 text-accent hover:underline">Link</a>}
                              {mod.content && <p className="text-xs text-muted-foreground italic mt-1">Preview: {mod.content.substring(0, 50)}...</p>}
                            </li>
                          )})}
                        </ul>
                      ) : (
                        <p className="text-sm text-muted-foreground">No modules in this course.</p>
                      )}
                      <div className="flex justify-end gap-2 mt-3">
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <span tabIndex={!isAdmin ? 0 : -1}>
                                    <Button variant="outline" size="sm" onClick={() => editCourse(course)} disabled={isLoading || !isAdmin}>
                                    <Edit3 className="mr-1 h-4 w-4" /> Edit
                                    </Button>
                                </span>
                            </TooltipTrigger>
                            {!isAdmin && <TooltipContent><p>{adminOnlyMessage}</p></TooltipContent>}
                        </Tooltip>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                 <span tabIndex={!isAdmin ? 0 : -1}>
                                    <Button variant="destructive" size="sm" onClick={() => deleteCourse(course.id)} disabled={isLoading || (isEditing && currentCourse.id === course.id) || !isAdmin}>
                                        {isLoading && currentCourse.id === course.id && !isEditing ? <Loader2 className="mr-1 h-4 w-4 animate-spin"/> : <Trash2 className="mr-1 h-4 w-4" />}
                                        Delete
                                    </Button>
                                </span>
                            </TooltipTrigger>
                           {!isAdmin && <TooltipContent><p>{adminOnlyMessage}</p></TooltipContent>}
                        </Tooltip>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                );
              })}
            </Accordion>
          )}
        </CardContent>
      </Card>

      <Card className="shadow-xl">
        <CardHeader>
          <CardTitle className="text-xl font-bold text-primary flex items-center">
            <FlaskConical className="mr-2 h-6 w-6" /> AR Labs Management (Placeholder)
          </CardTitle>
          <CardDescription>
            Dedicated section for managing AR interactive labs. This can include uploading AR assets, configuring lab parameters, and linking them to courses.
          </CardDescription>
        </CardHeader>
        <CardContent>
           <p className="text-sm text-muted-foreground">
            Future enhancements will allow direct management of AR labs here. Currently, AR labs are added as modules within courses.
          </p>
        </CardContent>
      </Card>

      <Card className="shadow-xl">
        <CardHeader>
          <CardTitle className="text-xl font-bold text-primary flex items-center">
            <DatabaseZap className="mr-2 h-6 w-6" /> Data Management
          </CardTitle>
          <CardDescription>
            Manage sample data for testing and development purposes.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Data population options can be added here as needed for other features.
          </p>
        </CardContent>
      </Card>

    </div>
    </TooltipProvider>
  );
}

