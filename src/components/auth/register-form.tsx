'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { useTransition } from 'react';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { Alert, AlertDescription } from '../ui/alert';
import { users } from '@/lib/data';
import { AppUser } from '@/lib/definitions';
import { faker } from '@faker-js/faker';

const formSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters.' }),
  email: z.string().email({ message: 'Please enter a valid email.' }),
  password: z
    .string()
    .min(8, { message: 'Password must be at least 8 characters.' }),
  role: z.enum(['Student', 'Parent'], {
    required_error: 'You must select a role.',
  }),
});

interface CreateUserInput {
  name: string;
  email: string;
  role: 'Student' | 'Parent';
}

function createUser(input: CreateUserInput) {
  const existingUser = users.find((user) => user.email === input.email);
  if (existingUser) {
    return {
      success: false,
      message: 'An account with this email already exists.',
    };
  }

  const newUserBase = {
    id: `user-${faker.string.uuid()}`,
    name: input.name,
    email: input.email,
    avatarUrl: `https://picsum.photos/seed/user-${Math.random()}/100/100`,
  };

  if (input.role === 'Student') {
    const newStudent: AppUser = {
      ...newUserBase,
      role: 'Student',
      parentId: `user-parent-${faker.string.uuid()}`, // Placeholder parent
      courseIds: [],
    };
    users.push(newStudent);
  } else if (input.role === 'Parent') {
    const newParent: AppUser = {
      ...newUserBase,
      role: 'Parent',
      childIds: [], // No children linked by default
    };
    users.push(newParent);
  } else {
    return { success: false, message: 'Invalid role specified.' };
  }

  return { success: true };
}

export function RegisterForm() {
  const { toast } = useToast();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    startTransition(async () => {
      const result = createUser(values);
      if (result.success) {
        toast({
          title: 'Registration Successful',
          description:
            'Your account has been created. Redirecting to login...',
        });

        setTimeout(() => {
          router.push('/login');
        }, 1500);
      } else {
        form.setError('root', { message: result.message });
      }
    });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4">
        {form.formState.errors.root && (
          <Alert variant="destructive">
            <AlertDescription>
              {form.formState.errors.root.message}
            </AlertDescription>
          </Alert>
        )}
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Full Name</FormLabel>
              <FormControl>
                <Input placeholder="John Doe" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input placeholder="name@example.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <Input type="password" placeholder="••••••••" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="role"
          render={({ field }) => (
            <FormItem>
              <FormLabel>I am a...</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select your role" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="Student">Student</SelectItem>
                  <SelectItem value="Parent">Parent</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full mt-2" disabled={isPending}>
          {isPending ? 'Creating Account...' : 'Create Account'}
        </Button>
      </form>
    </Form>
  );
}
