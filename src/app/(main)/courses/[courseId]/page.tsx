
'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useParams, notFound, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { mockCourses, learningStyleIcons, moduleTypeIcons } from '@/data/mockCourses';
import type { Course, CourseModule } from '@/types/course';
import type { DoubtMessage, DoubtReply } from '@/types/doubt';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { getDoubtsForModule, addDoubt, addReplyToDoubt, togglePinDoubt } from '@/services/doubtService';
import { ArrowLeft, ExternalLink, Loader2, ListChecks, Info, Youtube, MessageSquare, Send, Reply, Bookmark, User, CornerDownRight, ThumbsUp } from 'lucide-react';
import { formatDistanceToNowStrict, format } from 'date-fns';
import type { Timestamp } from 'firebase/firestore';

// Helper function to get YouTube embed URL
function getYoutubeEmbedUrl(url?: string): string | null {
  if (!url) return null;
  const youtubeRegex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
  const match = url.match(youtubeRegex);
  return match && match[1] ? `https://www.youtube.com/embed/${match[1]}` : null;
}

function DoubtChatSection({ courseId, module, studentId, studentName }: { courseId: string, module: CourseModule, studentId: string | null, studentName: string | null }) {
  const [doubts, setDoubts] = useState<DoubtMessage[]>([]);
  const [isLoadingDoubts, setIsLoadingDoubts] = useState(true);
  const [newDoubtText, setNewDoubtText] = useState('');
  const [replyingTo, setReplyingTo] = useState<{ doubtId: string; doubtText: string } | null>(null);
  const [newReplyText, setNewReplyText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const doubtsEndRef = useRef<HTMLDivElement>(null);

  const allowedStudentIdsForChat = ["8918", "8946", "8947"]; 
  const canChat = studentId && allowedStudentIdsForChat.includes(studentId);

  useEffect(() => {
    if (!courseId || !module.id) return;
    setIsLoadingDoubts(true);
    const unsubscribe = getDoubtsForModule(
      courseId,
      module.id,
      (fetchedDoubts) => {
        setDoubts(fetchedDoubts);
        setIsLoadingDoubts(false);
      },
      (error) => {
        console.error("Failed to load doubts:", error);
        toast({ title: "Error", description: "Could not load doubts for this module.", variant: "destructive" });
        setIsLoadingDoubts(false);
      }
    );
    return () => unsubscribe();
  }, [courseId, module.id, toast]);

  useEffect(() => {
    doubtsEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [doubts]);

  const handleSendDoubt = async () => {
    if (!newDoubtText.trim() || !studentId || !studentName) return;
    setIsSubmitting(true);
    try {
      await addDoubt(courseId, module.id, newDoubtText, studentId, studentName);
      setNewDoubtText('');
      toast({ title: "Doubt posted!" });
    } catch (error: any) {
      toast({ title: "Error", description: `Failed to post doubt: ${error.message}`, variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSendReply = async (doubtId: string) => {
    if (!newReplyText.trim() || !studentId || !studentName) return;
    setIsSubmitting(true);
    try {
      await addReplyToDoubt(courseId, module.id, doubtId, newReplyText, studentId, studentName);
      setNewReplyText('');
      setReplyingTo(null);
      toast({ title: "Reply posted!" });
    } catch (error: any) {
      toast({ title: "Error", description: `Failed to post reply: ${error.message}`, variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTogglePin = async (doubt: DoubtMessage) => {
    if (!studentId) return;
    setIsSubmitting(true);
    try {
      await togglePinDoubt(courseId, module.id, doubt.id, doubt.pinned, studentId);
      toast({ title: doubt.pinned ? "Doubt unpinned" : "Doubt pinned!" });
    } catch (error: any) {
      toast({ title: "Error", description: `Failed to toggle pin: ${error.message}`, variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const formatTimestamp = (timestamp: Timestamp | Date | undefined): string => {
    if (!timestamp) return '';
    const date = timestamp instanceof Date ? timestamp : (timestamp && typeof (timestamp as Timestamp).toDate === 'function' ? (timestamp as Timestamp).toDate() : new Date(0));
    if (isNaN(date.getTime()) || date.getTime() === 0) return 'Date N/A'; // Invalid date check
    return formatDistanceToNowStrict(date, { addSuffix: true });
  };

  return (
    <div className="mt-6 p-4 border-t border-border bg-secondary/20 rounded-b-lg">
      <h3 className="text-lg font-semibold text-primary mb-3 flex items-center">
        <MessageSquare className="mr-2 h-5 w-5" /> Module Doubts & Discussion
      </h3>
      {isLoadingDoubts && <div className="flex justify-center p-4"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>}
      
      {!isLoadingDoubts && doubts.length === 0 && !canChat && (
         <p className="text-sm text-muted-foreground italic">No doubts posted for this module yet.</p>
      )}
       {!isLoadingDoubts && doubts.length === 0 && canChat && (
         <p className="text-sm text-muted-foreground italic">No doubts posted yet. Be the first to ask a question!</p>
      )}

      <div className="space-y-4 max-h-[400px] overflow-y-auto mb-4 pr-2">
        {doubts.sort((a, b) => {
          const pinnedComparison = (b.pinned ? 1 : -1) - (a.pinned ? 1 : -1);
          if (pinnedComparison !== 0) {
            return pinnedComparison;
          }
          // Fallback to 0 if timestamp is not a valid Timestamp object with toMillis
          const timeA = a.timestamp && typeof (a.timestamp as Timestamp)?.toMillis === 'function' 
                        ? (a.timestamp as Timestamp).toMillis() 
                        : 0;
          const timeB = b.timestamp && typeof (b.timestamp as Timestamp)?.toMillis === 'function' 
                        ? (b.timestamp as Timestamp).toMillis() 
                        : 0;

          if (timeA === 0 && timeB === 0) { 
            return a.id.localeCompare(b.id); // Sort by ID if timestamps are unusable
          }
          if (timeA === 0) return 1; // Treat items with missing/invalid timestamp as newer (or older)
          if (timeB === 0) return -1;

          return timeA - timeB; // Sort by timestamp ascending
        }).map((doubt) => (
          <Card key={doubt.id} className={`shadow-sm ${doubt.pinned ? 'bg-yellow-100 dark:bg-yellow-700/30 border-yellow-400' : 'bg-card'}`}>
            <CardContent className="p-3 space-y-2">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-semibold text-primary">{doubt.senderName || doubt.senderId}</p>
                  <p className="text-xs text-muted-foreground">{formatTimestamp(doubt.timestamp as Timestamp | undefined)}</p>
                </div>
                {canChat && studentId === doubt.senderId && (
                  <Button variant="ghost" size="sm" onClick={() => handleTogglePin(doubt)} disabled={isSubmitting} title={doubt.pinned ? "Unpin Doubt" : "Pin Doubt"}>
                    <Bookmark className={`h-4 w-4 ${doubt.pinned ? 'fill-yellow-500 text-yellow-600' : 'text-muted-foreground'}`} />
                  </Button>
                )}
              </div>
              <p className="text-sm text-foreground whitespace-pre-wrap">{doubt.text}</p>
              
              {doubt.replies && doubt.replies.length > 0 && (
                <div className="pl-4 mt-2 space-y-2 border-l-2 border-primary/30">
                  {doubt.replies.map(reply => (
                    <div key={reply.id} className="text-sm bg-secondary/50 p-2 rounded">
                      <div className="flex justify-between items-center">
                         <p className="font-medium text-accent">{reply.senderName || reply.senderId}</p>
                         <p className="text-xs text-muted-foreground">{formatTimestamp(reply.timestamp as Timestamp | undefined)}</p>
                      </div>
                      <p className="text-foreground whitespace-pre-wrap">{reply.text}</p>
                    </div>
                  ))}
                </div>
              )}

              {canChat && (
                <div className="mt-2">
                  {replyingTo?.doubtId === doubt.id ? (
                    <div className="mt-2 space-y-2">
                      <Textarea
                        value={newReplyText}
                        onChange={(e) => setNewReplyText(e.target.value)}
                        placeholder={`Replying to ${doubt.senderName || doubt.senderId}...`}
                        rows={2}
                        className="bg-background"
                        disabled={isSubmitting}
                      />
                      <div className="flex gap-2">
                        <Button size="sm" onClick={() => handleSendReply(doubt.id)} disabled={isSubmitting || !newReplyText.trim()} className="bg-accent text-accent-foreground">
                          {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4"/>} Send Reply
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => setReplyingTo(null)} disabled={isSubmitting}>Cancel</Button>
                      </div>
                    </div>
                  ) : (
                    <Button size="sm" variant="outline" onClick={() => { setReplyingTo({doubtId: doubt.id, doubtText: doubt.text}); setNewReplyText('');}} className="text-accent border-accent hover:bg-accent/10">
                      <Reply className="mr-1 h-3 w-3" /> Reply
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
        <div ref={doubtsEndRef} />
      </div>

      {canChat && (
        <div className="mt-4 pt-4 border-t">
          <Label htmlFor={`new-doubt-${module.id}`} className="font-semibold text-foreground">Post a new doubt for this module:</Label>
          <Textarea
            id={`new-doubt-${module.id}`}
            value={newDoubtText}
            onChange={(e) => setNewDoubtText(e.target.value)}
            placeholder="Type your question or doubt here..."
            rows={3}
            className="mt-1 bg-background"
            disabled={isSubmitting}
          />
          <Button onClick={handleSendDoubt} disabled={isSubmitting || !newDoubtText.trim()} className="mt-2 bg-primary text-primary-foreground hover:bg-primary/90">
            {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
            Post Doubt
          </Button>
        </div>
      )}
      {!canChat && studentId && (
        <p className="text-sm text-muted-foreground italic mt-4">
          Real-time chat for this module is currently available for specific student IDs. You can view existing doubts.
        </p>
      )}
       {!studentId && (
        <p className="text-sm text-muted-foreground italic mt-4">
          Please log in to participate in the discussion.
        </p>
      )}
    </div>
  );
}


export default function CourseDetailPage() {
  const params = useParams();
  const courseId = params.courseId as string;
  const [course, setCourse] = useState<Course | null>(null);
  const [mounted, setMounted] = useState(false);
  const { studentId, studentProfile, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
    const foundCourse = mockCourses.find(c => c.id === courseId);
    if (foundCourse) {
      setCourse(foundCourse);
    } else if (mounted && courseId) { 
      // Delay notFound call slightly to ensure auth state is potentially resolved
      // This helps avoid flashing "not found" if course exists but auth is slow
      const timer = setTimeout(() => {
        if (!mockCourses.find(c => c.id === courseId)) {
             notFound();
        }
      }, 100); // Small delay
      return () => clearTimeout(timer);
    }
  }, [courseId, mounted]);

  if (!mounted || (!course && courseId)) { // Show loader if not mounted or if courseId exists but course is not yet found
    if (mounted && courseId && !course) { // If mounted and course is definitively not found
      // This state is now handled by the notFound() in useEffect,
      // but this can be a fallback or styled loading page for "course not found"
       return (
             <div className="flex flex-col items-center justify-center min-h-[calc(100vh-10rem)]">
                <Info className="h-12 w-12 text-destructive mb-4" />
                <h2 className="text-2xl font-semibold mb-2">Course Not Found</h2>
                <p className="text-muted-foreground mb-4">The course you are looking for might not exist or is loading.</p>
                <Button asChild variant="outline">
                    <Link href="/courses">Back to Courses</Link>
                </Button>
            </div>
        );
    }
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-10rem)]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }
  
  // If course is null after checks and not loading, it truly wasn't found
  if (!course) {
    notFound();
    return null; // Should be unreachable due to notFound()
  }


  const LearningIcon = learningStyleIcons[course.learningStyle];

  return (
    <div className="container mx-auto py-8 px-4 md:px-6">
      <Button asChild variant="outline" className="mb-6">
        <Link href="/courses">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Courses
        </Link>
      </Button>

      <Card className="shadow-xl overflow-hidden">
        <CardHeader className="bg-secondary/50 p-6">
          <div className="flex items-center mb-2">
            <LearningIcon className="h-8 w-8 text-primary mr-3" />
            <CardTitle className="text-3xl font-bold text-primary">{course.name}</CardTitle>
          </div>
          <div className="flex gap-2 mt-1">
            {course.category && <Badge variant="secondary">{course.category}</Badge>}
            {course.difficulty && <Badge variant="outline">{course.difficulty}</Badge>}
            <Badge variant="outline" className="capitalize flex items-center gap-1">
               {course.learningStyle}
            </Badge>
          </div>
          <CardDescription className="mt-3 text-base">{course.description}</CardDescription>
        </CardHeader>

        <CardContent className="p-6">
          <h2 className="text-2xl font-semibold text-primary mb-4 flex items-center">
            <ListChecks className="mr-2 h-6 w-6" /> Course Modules
          </h2>
          {course.modules.length === 0 ? (
            <p className="text-muted-foreground">No modules available for this course yet.</p>
          ) : (
            <Accordion type="multiple" className="w-full space-y-3">
              {course.modules.map((module, index) => {
                const ModuleIcon = moduleTypeIcons[module.type] || ListChecks;
                const youtubeEmbedUrl = module.type === 'video' ? getYoutubeEmbedUrl(module.url) : null;

                return (
                  <AccordionItem value={module.id} key={module.id} className="border bg-card rounded-lg shadow-sm">
                    <AccordionTrigger className="px-4 py-3 hover:no-underline hover:bg-secondary/20 rounded-t-lg data-[state=open]:rounded-b-none">
                      <div className="flex items-center gap-3">
                        <ModuleIcon className="h-5 w-5 text-accent" />
                        <span className="font-medium text-lg">{module.title}</span>
                        {module.estimatedDuration && (
                          <Badge variant="outline" className="text-xs">{module.estimatedDuration}</Badge>
                        )}
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="px-4 py-3 border-t bg-secondary/10 rounded-b-lg space-y-3">
                      {module.description && (
                        <p className="text-sm text-muted-foreground">{module.description}</p>
                      )}

                      {module.type === 'video' && youtubeEmbedUrl ? (
                        <div className="aspect-video">
                          <iframe
                            className="w-full h-full rounded-lg"
                            src={youtubeEmbedUrl}
                            title={module.title}
                            frameBorder="0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                            allowFullScreen
                          ></iframe>
                        </div>
                      ) : module.url && module.type !== 'ar_interactive_lab' ? (
                        <Button asChild size="sm" variant="default" className="bg-primary text-primary-foreground hover:bg-primary/90">
                          <a href={module.url} target="_blank" rel="noopener noreferrer">
                            {module.type === 'video' ? <Youtube className="mr-2 h-4 w-4" /> : null}
                            {module.type === 'video' ? 'Watch Video' : 
                             module.type === 'audio' ? 'Listen Audio' :
                             'Access Resource'}
                            <ExternalLink className="ml-2 h-4 w-4" />
                          </a>
                        </Button>
                      ) : null}

                       {module.type === 'ar_interactive_lab' && module.url && (
                         <Button asChild size="sm" variant="default" className="bg-accent text-accent-foreground hover:bg-accent/90">
                           <a href={module.url} target="_blank" rel="noopener noreferrer">
                             {moduleTypeIcons.ar_interactive_lab ? <moduleTypeIcons.ar_interactive_lab className="mr-2 h-4 w-4" /> : null}
                             Launch AR Lab
                             <ExternalLink className="ml-2 h-4 w-4" />
                           </a>
                         </Button>
                       )}
                      
                      {module.content && (
                        <div className="prose prose-sm max-w-none text-muted-foreground">
                          <h4 className="font-semibold text-foreground">Content Preview:</h4>
                          <pre className="whitespace-pre-wrap bg-background p-2 rounded text-xs">{module.content.substring(0,200)}{module.content.length > 200 ? '...' : ''}</pre>
                        </div>
                      )}

                      {!module.url && !module.content && !youtubeEmbedUrl && (
                        <p className="text-sm text-muted-foreground italic">No direct content or link for this module. It might be an in-person activity or integrated differently.</p>
                      )}

                      {/* Doubt Chat Section */}
                      <DoubtChatSection 
                        courseId={course.id} 
                        module={module} 
                        studentId={isAuthenticated ? studentId : null} 
                        studentName={isAuthenticated && studentProfile ? studentProfile.name : null} 
                      />
                    </AccordionContent>
                  </AccordionItem>
                );
              })}
            </Accordion>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

