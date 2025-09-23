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
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import {
  Plus,
  Edit,
  Trash2,
  DollarSign,
  Users,
  TrendingUp,
  AlertCircle,
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface SubscriptionPlan {
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
  isActive: boolean;
}

interface Subscription {
  id: string;
  status: string;
  startDate: string;
  endDate?: string;
  nextBillingDate: string;
  autoRenew: boolean;
  plan: SubscriptionPlan;
  user: {
    id: string;
    name?: string;
    email: string;
    companyName?: string;
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
  subscription: {
    plan: SubscriptionPlan;
  };
  user: {
    name?: string;
    email: string;
    companyName?: string;
  };
}

export default function AdminSubscriptionsPage() {
  const { data: session } = useSession();
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [billingHistory, setBillingHistory] = useState<BillingRecord[]>([]);
  const [stats, setStats] = useState<any>({});
  const [isLoading, setIsLoading] = useState(true);
  const [showPlanDialog, setShowPlanDialog] = useState(false);
  const [showSubscriptionDialog, setShowSubscriptionDialog] = useState(false);
  const [showBillingDialog, setShowBillingDialog] = useState(false);
  const [editingPlan, setEditingPlan] = useState<SubscriptionPlan | null>(null);
  const [editingSubscription, setEditingSubscription] =
    useState<Subscription | null>(null);

  // Form states
  const [planForm, setPlanForm] = useState({
    name: '',
    description: '',
    price: 0,
    features: [] as string[],
    limits: {
      channels: 10,
      programs: 100,
      schedules: 500,
      epgGenerations: 50,
      apiCalls: 10000,
    },
  });

  const [subscriptionForm, setSubscriptionForm] = useState({
    userId: '',
    planId: '',
    startDate: '',
    autoRenew: true,
  });

  const [billingForm, setBillingForm] = useState({
    userId: '',
    subscriptionId: '',
    amount: 0,
    dueDate: '',
    notes: '',
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [plansRes, subscriptionsRes, billingRes, statsRes] =
        await Promise.all([
          fetch('/api/admin/subscription-plans'),
          fetch('/api/admin/subscriptions'),
          fetch('/api/admin/billing'),
          fetch('/api/admin/stats'),
        ]);

      if (plansRes.ok) setPlans(await plansRes.json());
      if (subscriptionsRes.ok) setSubscriptions(await subscriptionsRes.json());
      if (billingRes.ok) setBillingHistory(await billingRes.json());
      if (statsRes.ok) setStats(await statsRes.json());
    } catch (error) {
      console.error('Failed to fetch data:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch subscription data',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreatePlan = async () => {
    try {
      const response = await fetch('/api/admin/subscription-plans', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(planForm),
      });

      if (response.ok) {
        toast({ title: 'Success', description: 'Subscription plan created' });
        setShowPlanDialog(false);
        setPlanForm({
          name: '',
          description: '',
          price: 0,
          features: [],
          limits: {
            channels: 10,
            programs: 100,
            schedules: 500,
            epgGenerations: 50,
            apiCalls: 10000,
          },
        });
        fetchData();
      } else {
        throw new Error('Failed to create plan');
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to create subscription plan',
        variant: 'destructive',
      });
    }
  };

  const handleCreateSubscription = async () => {
    try {
      const response = await fetch('/api/admin/subscriptions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(subscriptionForm),
      });

      if (response.ok) {
        toast({ title: 'Success', description: 'Subscription created' });
        setShowSubscriptionDialog(false);
        setSubscriptionForm({
          userId: '',
          planId: '',
          startDate: '',
          autoRenew: true,
        });
        fetchData();
      } else {
        throw new Error('Failed to create subscription');
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to create subscription',
        variant: 'destructive',
      });
    }
  };

  const handleCreateBilling = async () => {
    try {
      const response = await fetch('/api/admin/billing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(billingForm),
      });

      if (response.ok) {
        toast({ title: 'Success', description: 'Billing record created' });
        setShowBillingDialog(false);
        setBillingForm({
          userId: '',
          subscriptionId: '',
          amount: 0,
          dueDate: '',
          notes: '',
        });
        fetchData();
      } else {
        throw new Error('Failed to create billing record');
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to create billing record',
        variant: 'destructive',
      });
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

  if (isLoading) {
    return <div className="container mx-auto py-8">Loading...</div>;
  }

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Subscription Management</h1>
        <p className="text-muted-foreground">
          Manage subscription plans, client subscriptions, and billing
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${stats.totalRevenue?.toFixed(2) || '0.00'}
            </div>
            <p className="text-xs text-muted-foreground">
              Monthly: ${stats.monthlyRevenue?.toFixed(2) || '0.00'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Active Subscriptions
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.activeSubscriptions || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Total: {stats.totalSubscriptions || 0}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cancelled</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.cancelledSubscriptions || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Suspended: {stats.suspendedSubscriptions || 0}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Plans Available
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{plans.length}</div>
            <p className="text-xs text-muted-foreground">Active plans</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="plans" className="space-y-6">
        <TabsList>
          <TabsTrigger value="plans">Subscription Plans</TabsTrigger>
          <TabsTrigger value="subscriptions">Client Subscriptions</TabsTrigger>
          <TabsTrigger value="billing">Billing History</TabsTrigger>
        </TabsList>

        <TabsContent value="plans" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-semibold">Subscription Plans</h2>
            <Dialog open={showPlanDialog} onOpenChange={setShowPlanDialog}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Plan
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Create Subscription Plan</DialogTitle>
                  <DialogDescription>
                    Create a new subscription plan for clients
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="name">Plan Name</Label>
                    <Input
                      id="name"
                      value={planForm.name}
                      onChange={e =>
                        setPlanForm({ ...planForm, name: e.target.value })
                      }
                      placeholder="e.g., Basic, Professional, Enterprise"
                    />
                  </div>
                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={planForm.description}
                      onChange={e =>
                        setPlanForm({
                          ...planForm,
                          description: e.target.value,
                        })
                      }
                      placeholder="Plan description..."
                    />
                  </div>
                  <div>
                    <Label htmlFor="price">Monthly Price ($)</Label>
                    <Input
                      id="price"
                      type="number"
                      value={planForm.price}
                      onChange={e =>
                        setPlanForm({
                          ...planForm,
                          price: parseFloat(e.target.value),
                        })
                      }
                      placeholder="0.00"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="channels">Channels Limit</Label>
                      <Input
                        id="channels"
                        type="number"
                        value={planForm.limits.channels}
                        onChange={e =>
                          setPlanForm({
                            ...planForm,
                            limits: {
                              ...planForm.limits,
                              channels: parseInt(e.target.value),
                            },
                          })
                        }
                      />
                    </div>
                    <div>
                      <Label htmlFor="programs">Programs Limit</Label>
                      <Input
                        id="programs"
                        type="number"
                        value={planForm.limits.programs}
                        onChange={e =>
                          setPlanForm({
                            ...planForm,
                            limits: {
                              ...planForm.limits,
                              programs: parseInt(e.target.value),
                            },
                          })
                        }
                      />
                    </div>
                    <div>
                      <Label htmlFor="schedules">Schedules Limit</Label>
                      <Input
                        id="schedules"
                        type="number"
                        value={planForm.limits.schedules}
                        onChange={e =>
                          setPlanForm({
                            ...planForm,
                            limits: {
                              ...planForm.limits,
                              schedules: parseInt(e.target.value),
                            },
                          })
                        }
                      />
                    </div>
                    <div>
                      <Label htmlFor="apiCalls">API Calls Limit</Label>
                      <Input
                        id="apiCalls"
                        type="number"
                        value={planForm.limits.apiCalls}
                        onChange={e =>
                          setPlanForm({
                            ...planForm,
                            limits: {
                              ...planForm.limits,
                              apiCalls: parseInt(e.target.value),
                            },
                          })
                        }
                      />
                    </div>
                  </div>
                  <Button onClick={handleCreatePlan} className="w-full">
                    Create Plan
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {plans.map(plan => (
              <Card key={plan.id}>
                <CardHeader>
                  <CardTitle className="flex justify-between items-center">
                    {plan.name}
                    <Badge variant={plan.isActive ? 'default' : 'secondary'}>
                      {plan.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </CardTitle>
                  <CardDescription>{plan.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold mb-4">
                    ${plan.price}/month
                  </div>
                  <div className="space-y-2 text-sm">
                    <div>Channels: {plan.limits.channels}</div>
                    <div>Programs: {plan.limits.programs}</div>
                    <div>Schedules: {plan.limits.schedules}</div>
                    <div>
                      API Calls: {plan.limits.apiCalls.toLocaleString()}
                    </div>
                  </div>
                  <div className="flex space-x-2 mt-4">
                    <Button size="sm" variant="outline">
                      <Edit className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                    <Button size="sm" variant="outline">
                      <Trash2 className="h-4 w-4 mr-1" />
                      Delete
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="subscriptions" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-semibold">Client Subscriptions</h2>
            <Dialog
              open={showSubscriptionDialog}
              onOpenChange={setShowSubscriptionDialog}
            >
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Subscription
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create Subscription</DialogTitle>
                  <DialogDescription>
                    Assign a subscription plan to a client
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="userId">User ID</Label>
                    <Input
                      id="userId"
                      value={subscriptionForm.userId}
                      onChange={e =>
                        setSubscriptionForm({
                          ...subscriptionForm,
                          userId: e.target.value,
                        })
                      }
                      placeholder="User ID"
                    />
                  </div>
                  <div>
                    <Label htmlFor="planId">Plan</Label>
                    <Select
                      value={subscriptionForm.planId}
                      onValueChange={value =>
                        setSubscriptionForm({
                          ...subscriptionForm,
                          planId: value,
                        })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a plan" />
                      </SelectTrigger>
                      <SelectContent>
                        {plans.map(plan => (
                          <SelectItem key={plan.id} value={plan.id}>
                            {plan.name} - ${plan.price}/month
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="startDate">Start Date</Label>
                    <Input
                      id="startDate"
                      type="date"
                      value={subscriptionForm.startDate}
                      onChange={e =>
                        setSubscriptionForm({
                          ...subscriptionForm,
                          startDate: e.target.value,
                        })
                      }
                    />
                  </div>
                  <Button onClick={handleCreateSubscription} className="w-full">
                    Create Subscription
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Client</TableHead>
                    <TableHead>Plan</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Start Date</TableHead>
                    <TableHead>Next Billing</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {subscriptions.map(subscription => (
                    <TableRow key={subscription.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">
                            {subscription.user.name || subscription.user.email}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {subscription.user.companyName}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">
                            {subscription.plan.name}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            ${subscription.plan.price}/month
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(subscription.status)}
                      </TableCell>
                      <TableCell>
                        {new Date(subscription.startDate).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        {new Date(
                          subscription.nextBillingDate
                        ).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button size="sm" variant="outline">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="outline">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="billing" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-semibold">Billing History</h2>
            <Dialog
              open={showBillingDialog}
              onOpenChange={setShowBillingDialog}
            >
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Billing Record
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create Billing Record</DialogTitle>
                  <DialogDescription>
                    Create a manual billing record
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="billingUserId">User ID</Label>
                    <Input
                      id="billingUserId"
                      value={billingForm.userId}
                      onChange={e =>
                        setBillingForm({
                          ...billingForm,
                          userId: e.target.value,
                        })
                      }
                      placeholder="User ID"
                    />
                  </div>
                  <div>
                    <Label htmlFor="subscriptionId">Subscription ID</Label>
                    <Input
                      id="subscriptionId"
                      value={billingForm.subscriptionId}
                      onChange={e =>
                        setBillingForm({
                          ...billingForm,
                          subscriptionId: e.target.value,
                        })
                      }
                      placeholder="Subscription ID"
                    />
                  </div>
                  <div>
                    <Label htmlFor="amount">Amount ($)</Label>
                    <Input
                      id="amount"
                      type="number"
                      value={billingForm.amount}
                      onChange={e =>
                        setBillingForm({
                          ...billingForm,
                          amount: parseFloat(e.target.value),
                        })
                      }
                      placeholder="0.00"
                    />
                  </div>
                  <div>
                    <Label htmlFor="dueDate">Due Date</Label>
                    <Input
                      id="dueDate"
                      type="date"
                      value={billingForm.dueDate}
                      onChange={e =>
                        setBillingForm({
                          ...billingForm,
                          dueDate: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="notes">Notes</Label>
                    <Textarea
                      id="notes"
                      value={billingForm.notes}
                      onChange={e =>
                        setBillingForm({
                          ...billingForm,
                          notes: e.target.value,
                        })
                      }
                      placeholder="Optional notes..."
                    />
                  </div>
                  <Button onClick={handleCreateBilling} className="w-full">
                    Create Billing Record
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Client</TableHead>
                    <TableHead>Plan</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Billing Date</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead>Paid Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {billingHistory.map(billing => (
                    <TableRow key={billing.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">
                            {billing.user.name || billing.user.email}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {billing.user.companyName}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{billing.subscription.plan.name}</TableCell>
                      <TableCell>${billing.amount.toFixed(2)}</TableCell>
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
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
