'use client';

import { useState, useEffect, useTransition } from 'react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import type { Parent, SharedReport, ReportComment } from '@/lib/definitions';
import { sharedReports, users, courses } from '@/lib/data';
import { formatDistanceToNow, parseISO } from 'date-fns';
import { Send, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { faker } from '@faker-js/faker';

const getInitials = (name?: string) => {
  if (!name) return '?';
  const names = name.split(' ');
  if (names.length > 1) {
    return `${names[0][0]}${names[names.length - 1][0]}`;
  }
  return name.substring(0, 2);
};

export function ParentReportViewer({ user }: { user: Parent }) {
  const [isMounted, setIsMounted] = useState(false);
  const [comments, setComments] = useState<Record<string, string>>({});
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();
  
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // For demo purposes, we focus on the first child
  const childId = user.childIds[0];
  const reports = sharedReports
    .filter((r) => r.studentId === childId)
    .sort((a, b) => parseISO(b.sentDate).getTime() - parseISO(a.sentDate).getTime());

  // In a real app, this would be an API call to save the comment
  const handleAddComment = (reportId: string) => {
    const newCommentContent = comments[reportId];
    if (!newCommentContent || !newCommentContent.trim()) return;

    startTransition(() => {
        // Simulate API call
        setTimeout(() => {
            const report = sharedReports.find(r => r.id === reportId);
            if (report) {
                const newComment: ReportComment = {
                    id: `comment-${faker.string.uuid()}`,
                    reportId,
                    authorId: user.id,
                    content: newCommentContent,
                    timestamp: new Date().toISOString(),
                };
                report.comments.push(newComment);
            }
            
            toast({
                title: 'Comment Sent',
                description: 'Your comment has been added to the report thread.',
            });
            setComments((prev) => ({ ...prev, [reportId]: '' }));
        }, 500);
    });
  };

  if (!isMounted) {
    // You can return a loading skeleton here if you want
    return null;
  }

  if (reports.length === 0) {
    return (
        <Card>
            <CardContent className="pt-6">
                <p>You have not received any reports from teachers yet.</p>
            </CardContent>
        </Card>
    )
  }

  return (
    <Accordion type="single" collapsible className="w-full space-y-4">
      {reports.map((report) => {
        const teacher = users.find((u) => u.id === report.teacherId);
        const course = courses.find((c) => c.id === report.courseId);

        return (
          <AccordionItem value={report.id} key={report.id} className="border-b-0">
            <Card>
              <AccordionTrigger className="p-6 text-left hover:no-underline">
                <div className="flex w-full items-center justify-between">
                  <div className="flex items-center gap-4">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={teacher?.avatarUrl} />
                      <AvatarFallback>{getInitials(teacher?.name)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-semibold">{course?.name || 'Unknown Course'}</p>
                      <p className="text-sm text-muted-foreground">
                        From: {teacher?.name || 'Unknown Teacher'}
                      </p>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {formatDistanceToNow(parseISO(report.sentDate), { addSuffix: true })}
                  </p>
                </div>
              </AccordionTrigger>
              <AccordionContent className="p-6 pt-0">
                <div className="space-y-6">
                  {/* Report Content */}
                  <div className="prose prose-sm max-w-none rounded-md border bg-muted p-4 whitespace-pre-wrap">
                    {report.reportContent}
                  </div>

                  {/* Comments Section */}
                  <div className="space-y-4">
                    <h4 className="font-medium">Discussion Thread</h4>
                    <div className="space-y-4">
                      {report.comments.sort((a,b) => parseISO(a.timestamp).getTime() - parseISO(b.timestamp).getTime()).map((comment) => {
                        const author = users.find(u => u.id === comment.authorId);
                        const isAuthorParent = author?.role === 'Parent';
                        return (
                          <div key={comment.id} className={`flex items-start gap-3 ${isAuthorParent ? 'justify-end' : ''}`}>
                             {!isAuthorParent && (
                                <Avatar className="h-8 w-8 border">
                                    <AvatarImage src={author?.avatarUrl} />
                                    <AvatarFallback>{getInitials(author?.name)}</AvatarFallback>
                                </Avatar>
                             )}
                            <div className={`max-w-md rounded-lg p-3 text-sm ${isAuthorParent ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                              <p className="font-semibold">{author?.name || 'Unknown'}</p>
                              <p className="whitespace-pre-wrap">{comment.content}</p>
                              <p className="text-xs opacity-70 mt-1 text-right">{formatDistanceToNow(parseISO(comment.timestamp), { addSuffix: true })}</p>
                            </div>
                            {isAuthorParent && (
                                <Avatar className="h-8 w-8 border">
                                    <AvatarImage src={author?.avatarUrl} />
                                    <AvatarFallback>{getInitials(author?.name)}</AvatarFallback>
                                </Avatar>
                             )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                  
                  {/* Add Comment Form */}
                  <div className="flex w-full flex-col gap-2">
                    <Textarea
                      placeholder="Write your response..."
                      value={comments[report.id] || ''}
                      onChange={(e) => setComments((prev) => ({ ...prev, [report.id]: e.target.value }))}
                      disabled={isPending}
                    />
                    <Button
                      className="self-end"
                      onClick={() => handleAddComment(report.id)}
                      disabled={isPending || !comments[report.id]?.trim()}
                    >
                      {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
                      {isPending ? 'Sending...' : 'Send Comment'}
                    </Button>
                  </div>
                </div>
              </AccordionContent>
            </Card>
          </AccordionItem>
        );
      })}
    </Accordion>
  );
}
