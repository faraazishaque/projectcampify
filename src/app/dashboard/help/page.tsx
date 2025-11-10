'use client';

import { useState, useTransition, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem } from '@/components/ui/form';
import { generateHelpdeskResponse } from '@/ai/flows/generate-helpdesk-response';
import { HelpCircle, Send, Sparkles } from 'lucide-react';
import { getAuthenticatedUser } from '@/app/actions/auth';
import type { AppUser } from '@/lib/definitions';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';

const formSchema = z.object({
  query: z.string().min(1, 'Please enter a question.'),
});

type Message = {
  role: 'user' | 'model';
  content: string;
};

export default function HelpPage() {
  const [user, setUser] = useState<AppUser | null>(null);
  const [isMounted, setIsMounted] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isPending, startTransition] = useTransition();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { query: '' },
  });

  useEffect(() => {
    setIsMounted(true);
    const fetchUser = async () => {
      const u = await getAuthenticatedUser();
      setUser(u);
    };
    fetchUser();
     setMessages([
      {
        role: 'model',
        content: "Welcome to the Campify Helpdesk! How can I assist you today?",
      },
    ]);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = (values: z.infer<typeof formSchema>) => {
    if (!user) return;

    const userMessage: Message = { role: 'user', content: values.query };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    form.reset();

    startTransition(async () => {
      try {
        const result = await generateHelpdeskResponse({
          query: values.query,
          userRole: user.role,
          history: newMessages.slice(0, -1),
        });
        const modelMessage: Message = { role: 'model', content: result.response };
        setMessages((prev) => [...prev, modelMessage]);
      } catch (error) {
        console.error('AI Helpdesk Error:', error);
        const errorMessage: Message = {
          role: 'model',
          content: 'Sorry, I encountered an error. Please try again.',
        };
        setMessages((prev) => [...prev, errorMessage]);
      }
    });
  };

  const getInitials = (name?: string) => {
    if (!name) return 'U';
    const names = name.split(' ');
    return names.length > 1 ? `${names[0][0]}${names[names.length - 1][0]}` : name.substring(0, 2);
  };
  
  if (!isMounted) {
    return <Skeleton className="h-[70vh] w-full" />;
  }

  return (
    <div className="flex flex-col gap-8 h-full">
      <div>
        <h1 className="font-headline text-3xl font-bold tracking-tight flex items-center gap-2">
          <HelpCircle className="h-8 w-8" />
          AI Help & Support
        </h1>
        <p className="text-muted-foreground">
          Ask our AI assistant anything about using Campify.
        </p>
      </div>

      <Card className="flex-1 flex flex-col">
        <CardHeader>
          <CardTitle>Helpdesk Chat</CardTitle>
          <CardDescription>
            Get instant answers to your questions.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex-1 overflow-y-auto pr-4 space-y-4">
          {messages.map((msg, index) => (
            <div key={index} className={cn('flex items-start gap-3', msg.role === 'user' ? 'justify-end' : 'justify-start')}>
              {msg.role === 'model' && (
                <Avatar className="h-8 w-8 border bg-primary text-primary-foreground">
                    <AvatarFallback><Sparkles size={18} /></AvatarFallback>
                </Avatar>
              )}
              <div className={cn('max-w-lg rounded-lg p-3 text-sm', msg.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted')}>
                <p className="whitespace-pre-wrap">{msg.content}</p>
              </div>
               {msg.role === 'user' && user && (
                 <Avatar className="h-8 w-8">
                   <AvatarImage src={user.avatarUrl} alt={user.name} />
                   <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
                 </Avatar>
               )}
            </div>
          ))}
           {isPending && (
            <div className="flex items-start gap-3 justify-start">
               <Avatar className="h-8 w-8 border bg-primary text-primary-foreground">
                  <AvatarFallback><Sparkles size={18} /></AvatarFallback>
               </Avatar>
               <div className="bg-muted rounded-lg p-3 text-sm">
                 <div className="flex items-center gap-2">
                   <div className="h-2 w-2 bg-foreground rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                   <div className="h-2 w-2 bg-foreground rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                   <div className="h-2 w-2 bg-foreground rounded-full animate-bounce"></div>
                 </div>
               </div>
            </div>
           )}
          <div ref={messagesEndRef} />
        </CardContent>
        <CardFooter className="pt-4 border-t">
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleSubmit)}
              className="flex w-full items-center space-x-2"
            >
              <FormField
                control={form.control}
                name="query"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormControl>
                      <Input
                        placeholder="e.g., How do I generate a report?"
                        {...field}
                        disabled={isPending}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              <Button type="submit" size="icon" disabled={isPending}>
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </Form>
        </CardFooter>
      </Card>
    </div>
  );
}
