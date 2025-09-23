'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  CheckCircle,
  XCircle,
  Clock,
  DollarSign,
  Calendar,
  AlertCircle,
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface Subscription {
  id: string;
  status: string;
  startDate: string;
  endDate?: string;
  nextBillingDate: string;
  autoRenew: boolean;
  plan: {
    id: string;
    name: string;
    description?: string;
    price: number;
    features: string[];
    limits: {
      channels: number;
      programs: number;
      schedules: number;
      epgGenerations: number;
      apiCalls: number;
    };
  };
}

interface BillingRecord {
  id: string;
  amount: number;
  status: string;
  billingDate: string;
  dueDate: string;
  paidDate?: string;
  notes?: string;
}

interface Limits {
  channels: number;
  programs: number;
  schedules: number;
  epgGenerations: number;
  apiCalls: number;
}

export default function SubscriptionPage() {
  const { data: session } = useSession();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [billingHistory, setBillingHistory] = useState<BillingRecord[]>([]);
  const [limits, setLimits] = useState<Limits | null>(null);
  const [hasActiveSubscription, setHasActiveSubscription] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchSubscriptionData();
  }, []);

  const fetchSubscriptionData = async () => {
    try {
      const [subscriptionRes, billingRes] = await Promise.all([
        fetch('/api/subscription'),
        fetch('/api/subscription/billing'),
      ]);

      if (subscriptionRes.ok) {
        const data = await subscriptionRes.json();
        setSubscription(data.subscription);
        setLimits(data.limits);
        setHasActiveSubscription(data.hasActiveSubscription);
      }

      if (billingRes.ok) {
        setBillingHistory(await billingRes.json());
      }
    } catch (error) {
      console.error('Failed to fetch subscription data:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch subscription data',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<
      string,
      'default' | 'secondary' | 'destructive' | 'outline'
    > = {
      ACTIVE: 'default',
      SUSPENDED: 'secondary',
      CANCELLED: 'destructive',
      EXPIRED: 'outline',
      PENDING: 'secondary',
    };
    return <Badge variant={variants[status] || 'default'}>{status}</Badge>;
  };

  const getBillingStatusBadge = (status: string) => {
    const variants: Record<
      string,
      'default' | 'secondary' | 'destructive' | 'outline'
    > = {
      PAID: 'default',
      PENDING: 'secondary',
      FAILED: 'destructive',
      CANCELLED: 'outline',
      REFUNDED: 'secondary',
    };
    return <Badge variant={variants[status] || 'default'}>{status}</Badge>;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'SUSPENDED':
        return <AlertCircle className="h-5 w-5 text-yellow-500" />;
      case 'CANCELLED':
      case 'EXPIRED':
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Clock className="h-5 w-5 text-gray-500" />;
    }
  };

  if (isLoading) {
    return <div className="container mx-auto py-8">Loading...</div>;
  }

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">My Subscription</h1>
        <p className="text-muted-foreground">
          Manage your subscription and view billing history
        </p>
      </div>

      {!hasActiveSubscription ? (
        <Card>
          <CardContent className="text-center py-12">
            <XCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              No Active Subscription
            </h3>
            <p className="text-muted-foreground mb-4">
              You don't have an active subscription. Contact your administrator
              to get started.
            </p>
            <Button onClick={() => (window.location.href = '/admin')}>
              Contact Admin
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="billing">Billing History</TabsTrigger>
            <TabsTrigger value="limits">Usage Limits</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    {getStatusIcon(subscription?.status || '')}
                    <span>Current Plan</span>
                  </CardTitle>
                  <CardDescription>
                    Your current subscription details
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h3 className="text-2xl font-bold">
                      {subscription?.plan.name}
                    </h3>
                    <p className="text-muted-foreground">
                      {subscription?.plan.description}
                    </p>
                  </div>
                  <div className="text-3xl font-bold">
                    ${subscription?.plan.price}/month
                  </div>
                  <div className="flex items-center space-x-2">
                    <span>Status:</span>
                    {getStatusBadge(subscription?.status || '')}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    <div>
                      Started:{' '}
                      {subscription?.startDate
                        ? new Date(subscription.startDate).toLocaleDateString()
                        : 'N/A'}
                    </div>
                    <div>
                      Next Billing:{' '}
                      {subscription?.nextBillingDate
                        ? new Date(
                            subscription.nextBillingDate
                          ).toLocaleDateString()
                        : 'N/A'}
                    </div>
                    <div>
                      Auto Renew: {subscription?.autoRenew ? 'Yes' : 'No'}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <DollarSign className="h-5 w-5" />
                    <span>Billing Summary</span>
                  </CardTitle>
                  <CardDescription>Recent billing activity</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Total Records:</span>
                      <span className="font-medium">
                        {billingHistory.length}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Paid Records:</span>
                      <span className="font-medium text-green-600">
                        {billingHistory.filter(b => b.status === 'PAID').length}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Pending Records:</span>
                      <span className="font-medium text-yellow-600">
                        {
                          billingHistory.filter(b => b.status === 'PENDING')
                            .length
                        }
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Failed Records:</span>
                      <span className="font-medium text-red-600">
                        {
                          billingHistory.filter(b => b.status === 'FAILED')
                            .length
                        }
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Plan Features</CardTitle>
                <CardDescription>
                  What's included in your current plan
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {subscription?.plan.features.map((feature, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="billing" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Billing History</CardTitle>
                <CardDescription>Your complete billing history</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                {billingHistory.length === 0 ? (
                  <div className="text-center py-8">
                    <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">
                      No Billing History
                    </h3>
                    <p className="text-muted-foreground">
                      You don't have any billing records yet.
                    </p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Amount</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Billing Date</TableHead>
                        <TableHead>Due Date</TableHead>
                        <TableHead>Paid Date</TableHead>
                        <TableHead>Notes</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {billingHistory.map(billing => (
                        <TableRow key={billing.id}>
                          <TableCell className="font-medium">
                            ${billing.amount.toFixed(2)}
                          </TableCell>
                          <TableCell>
                            {getBillingStatusBadge(billing.status)}
                          </TableCell>
                          <TableCell>
                            {new Date(billing.billingDate).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            {new Date(billing.dueDate).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            {billing.paidDate
                              ? new Date(billing.paidDate).toLocaleDateString()
                              : '-'}
                          </TableCell>
                          <TableCell>{billing.notes || '-'}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="limits" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Usage Limits</CardTitle>
                <CardDescription>
                  Your current plan's usage limits
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex justify-between items-center p-4 border rounded-lg">
                      <div>
                        <h4 className="font-medium">Channels</h4>
                        <p className="text-sm text-muted-foreground">
                          Maximum channels allowed
                        </p>
                      </div>
                      <div className="text-2xl font-bold">
                        {limits?.channels || 0}
                      </div>
                    </div>
                    <div className="flex justify-between items-center p-4 border rounded-lg">
                      <div>
                        <h4 className="font-medium">Programs</h4>
                        <p className="text-sm text-muted-foreground">
                          Maximum programs allowed
                        </p>
                      </div>
                      <div className="text-2xl font-bold">
                        {limits?.programs || 0}
                      </div>
                    </div>
                    <div className="flex justify-between items-center p-4 border rounded-lg">
                      <div>
                        <h4 className="font-medium">Schedules</h4>
                        <p className="text-sm text-muted-foreground">
                          Maximum schedules allowed
                        </p>
                      </div>
                      <div className="text-2xl font-bold">
                        {limits?.schedules || 0}
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center p-4 border rounded-lg">
                      <div>
                        <h4 className="font-medium">EPG Generations</h4>
                        <p className="text-sm text-muted-foreground">
                          Monthly EPG generations
                        </p>
                      </div>
                      <div className="text-2xl font-bold">
                        {limits?.epgGenerations || 0}
                      </div>
                    </div>
                    <div className="flex justify-between items-center p-4 border rounded-lg">
                      <div>
                        <h4 className="font-medium">API Calls</h4>
                        <p className="text-sm text-muted-foreground">
                          Monthly API calls
                        </p>
                      </div>
                      <div className="text-2xl font-bold">
                        {limits?.apiCalls?.toLocaleString() || 0}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
