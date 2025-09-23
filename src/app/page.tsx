'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Monitor, Calendar, Download, Users, Zap, Shield } from 'lucide-react';

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [showLanding, setShowLanding] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    if (status === 'authenticated') {
      if (session.user?.role === 'ADMIN') {
        router.push('/admin');
      } else {
        router.push('/dashboard');
      }
    }
  }, [status, session, router]);

  // Initialize after component mounts
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsInitialized(true);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  // Add timeout for loading state
  useEffect(() => {
    const timer = setTimeout(() => {
      if (status === 'loading') {
        console.log('Session loading timeout - showing landing page');
        setShowLanding(true);
      }
    }, 3000); // 3 second timeout

    return () => clearTimeout(timer);
  }, [status]);

  if (status === 'loading' && !showLanding && !isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading EPG Manager...</p>
        </div>
      </div>
    );
  }

  if (status === 'authenticated') {
    return null; // Will redirect in useEffect
  }

  // Show landing page if loading takes too long or if unauthenticated
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <Monitor className="h-8 w-8 text-indigo-600 mr-3" />
              <h1 className="text-2xl font-bold text-gray-900">EPG Manager</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/auth/signin">
                <Button variant="outline">Sign In</Button>
              </Link>
              <Link href="/auth/signup">
                <Button>Get Started</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Electronic Program Guide
              <span className="text-indigo-600 block">Management System</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Create, manage, and host your EPG files with ease. Perfect for
              live TV channel streamers and distributors.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/auth/signup">
                <Button size="lg" className="text-lg px-8 py-3">
                  Start Free Trial
                </Button>
              </Link>
              <Link href="/auth/signin">
                <Button
                  variant="outline"
                  size="lg"
                  className="text-lg px-8 py-3"
                >
                  Sign In
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="bg-white py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Everything You Need for EPG Management
              </h2>
              <p className="text-xl text-gray-600">
                Powerful features designed for TV channel streamers and
                distributors
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <Card className="text-center">
                <CardHeader>
                  <Monitor className="h-12 w-12 text-indigo-600 mx-auto mb-4" />
                  <CardTitle>Channel Management</CardTitle>
                  <CardDescription>
                    Easily manage your TV channels with logos, descriptions, and
                    streaming URLs
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card className="text-center">
                <CardHeader>
                  <Calendar className="h-12 w-12 text-indigo-600 mx-auto mb-4" />
                  <CardTitle>Program Scheduling</CardTitle>
                  <CardDescription>
                    Create and schedule programs with flexible timing and repeat
                    options
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card className="text-center">
                <CardHeader>
                  <Download className="h-12 w-12 text-indigo-600 mx-auto mb-4" />
                  <CardTitle>XML Export</CardTitle>
                  <CardDescription>
                    Generate and download EPG files in XMLTV format for any
                    compatible system
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card className="text-center">
                <CardHeader>
                  <Users className="h-12 w-12 text-indigo-600 mx-auto mb-4" />
                  <CardTitle>User Management</CardTitle>
                  <CardDescription>
                    Multi-user support with role-based access control for teams
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card className="text-center">
                <CardHeader>
                  <Zap className="h-12 w-12 text-indigo-600 mx-auto mb-4" />
                  <CardTitle>Copy Programs</CardTitle>
                  <CardDescription>
                    Quickly duplicate programs and schedules to save time on
                    repetitive entries
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card className="text-center">
                <CardHeader>
                  <Shield className="h-12 w-12 text-indigo-600 mx-auto mb-4" />
                  <CardTitle>Hosted EPG</CardTitle>
                  <CardDescription>
                    Get a hosted EPG URL that you can share with your
                    distributors
                  </CardDescription>
                </CardHeader>
              </Card>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-indigo-600 py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Ready to streamline your EPG management?
            </h2>
            <p className="text-xl text-indigo-100 mb-8">
              Join thousands of TV channel streamers who trust EPG Manager
            </p>
            <Link href="/auth/signup">
              <Button
                size="lg"
                variant="secondary"
                className="text-lg px-8 py-3"
              >
                Get Started Now
              </Button>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
