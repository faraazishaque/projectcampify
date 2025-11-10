'use client';

import { getAuthenticatedUser } from '@/app/actions/auth';
import { redirect } from 'next/navigation';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useEffect, useState, useTransition } from 'react';
import type { AppUser } from '@/lib/definitions';
import { useToast } from '@/hooks/use-toast';
import { updateProfile, updatePassword } from '@/app/actions/profile';
import { Skeleton } from '@/components/ui/skeleton';

function ProfileSkeleton() {
  return (
    <div className="flex flex-col gap-8">
      <div>
        <Skeleton className="h-9 w-48" />
        <Skeleton className="h-5 w-72 mt-2" />
      </div>
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-4 w-64 mt-2" />
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-start gap-6 sm:flex-row">
            <Skeleton className="h-24 w-24 rounded-full" />
            <div className="grid gap-2">
              <Skeleton className="h-8 w-40" />
              <Skeleton className="h-5 w-48" />
              <Skeleton className="h-5 w-24 pt-2" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function ProfilePage() {
  const [user, setUser] = useState<AppUser | null>(null);
  const { toast } = useToast();
  const [infoPending, startInfoTransition] = useTransition();
  const [passPending, startPassTransition] = useTransition();

  useEffect(() => {
    const fetchUser = async () => {
      const u = await getAuthenticatedUser();
      if (!u) {
        redirect('/login');
      }
      setUser(u);
    };
    fetchUser();
  }, []);

  const getInitials = (name: string) => {
    const names = name.split(' ');
    if (names.length > 1) {
      return `${names[0][0]}${names[names.length - 1][0]}`;
    }
    return name.substring(0, 2);
  };

  const handleUpdateInfo = (formData: FormData) => {
    startInfoTransition(async () => {
      const result = await updateProfile(formData);
      if (result.success) {
        toast({ title: 'Success', description: result.message });
      } else {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: result.message,
        });
      }
    });
  };

  const handleUpdatePassword = (formData: FormData) => {
    startPassTransition(async () => {
      const result = await updatePassword(formData);
       if (result.success) {
        toast({ title: 'Success', description: result.message });
      } else {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: result.message,
        });
      }
    });
  };

  if (!user) {
    return <ProfileSkeleton />;
  }

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="font-headline text-3xl font-bold tracking-tight">
          Your Profile
        </h1>
        <p className="text-muted-foreground">
          Manage your account settings and personal information.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Profile Details</CardTitle>
          <CardDescription>
            This is how your profile appears to others on the platform.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-start gap-6 sm:flex-row">
            <Avatar className="h-24 w-24">
              <AvatarImage src={user.avatarUrl} alt={user.name} />
              <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
            </Avatar>
            <div className="grid gap-1">
              <div className="text-2xl font-bold font-headline">
                {user.name}
              </div>
              <p className="text-muted-foreground">{user.email}</p>
              <p className="text-sm text-foreground/80 pt-2">
                Role:{' '}
                <span className="font-semibold text-primary">{user.role}</span>
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <form action={handleUpdateInfo}>
            <CardHeader>
              <CardTitle>Update Information</CardTitle>
              <CardDescription>
                Change your personal details here.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Full Name</Label>
                <Input id="name" name="name" defaultValue={user.name} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  defaultValue={user.email}
                  disabled
                />
                <p className="text-xs text-muted-foreground pt-1">
                  Email address cannot be changed.
                </p>
              </div>
              <Button
                type="submit"
                className="w-full sm:w-auto"
                disabled={infoPending}
              >
                {infoPending ? 'Saving...' : 'Save Changes'}
              </Button>
            </CardContent>
          </form>
        </Card>
        <Card>
          <form action={handleUpdatePassword}>
            <CardHeader>
              <CardTitle>Change Password</CardTitle>
              <CardDescription>
                Set a new password for your account.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="current-password">Current Password</Label>
                <Input
                  id="current-password"
                  name="current-password"
                  type="password"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="new-password">New Password</Label>
                <Input id="new-password" name="new-password" type="password" />
              </div>
              <Button
                type="submit"
                className="w-full sm:w-auto"
                disabled={passPending}
              >
                {passPending ? 'Updating...' : 'Update Password'}
              </Button>
            </CardContent>
          </form>
        </Card>
      </div>
    </div>
  );
}
