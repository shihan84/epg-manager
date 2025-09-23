'use client';

import { useSession } from 'next-auth/react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  CheckCircle,
  XCircle,
  Calendar,
  CreditCard,
  Download,
} from 'lucide-react';

export default function SubscriptionPage() {
  const { data: session } = useSession();

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-96">
          <CardHeader>
            <CardTitle>Access Denied</CardTitle>
            <CardDescription>
              Please sign in to view your subscription.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  // Mock subscription data - replace with real data from API
  const subscription = {
    plan: 'Professional',
    status: 'active',
    billingCycle: 'monthly',
    nextBillingDate: '2024-02-15',
    price: '$29.99',
    features: [
      'Unlimited Channels',
      'Unlimited Programs',
      'Unlimited Schedules',
      'EPG Generation',
      'API Access',
      'Priority Support',
    ],
  };

  const billingHistory = [
    {
      id: 'inv_001',
      date: '2024-01-15',
      amount: '$29.99',
      status: 'paid',
      description: 'Professional Plan - Monthly',
    },
    {
      id: 'inv_002',
      date: '2023-12-15',
      amount: '$29.99',
      status: 'paid',
      description: 'Professional Plan - Monthly',
    },
    {
      id: 'inv_003',
      date: '2023-11-15',
      amount: '$29.99',
      status: 'paid',
      description: 'Professional Plan - Monthly',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Subscription</h1>
          <p className="text-gray-600 mt-2">
            Manage your subscription and view billing history
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Current Plan */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-2xl">
                      {subscription.plan} Plan
                    </CardTitle>
                    <CardDescription>
                      Billed {subscription.billingCycle}
                    </CardDescription>
                  </div>
                  <Badge
                    variant={
                      subscription.status === 'active' ? 'default' : 'secondary'
                    }
                    className="text-sm"
                  >
                    {subscription.status === 'active' ? (
                      <>
                        <CheckCircle className="h-4 w-4 mr-1" /> Active
                      </>
                    ) : (
                      <>
                        <XCircle className="h-4 w-4 mr-1" /> Inactive
                      </>
                    )}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <span className="text-3xl font-bold">
                      {subscription.price}
                    </span>
                    <span className="text-gray-600">per month</span>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-3">Plan Features</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {subscription.features.map((feature, index) => (
                        <div
                          key={index}
                          className="flex items-center space-x-2"
                        >
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          <span className="text-sm">{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex space-x-4">
                    <Button className="flex-1">
                      <CreditCard className="h-4 w-4 mr-2" />
                      Update Payment
                    </Button>
                    <Button variant="outline" className="flex-1">
                      Change Plan
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Billing Info */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Calendar className="h-5 w-5 mr-2" />
                  Billing Info
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600">Next Billing Date</p>
                  <p className="font-semibold">
                    {subscription.nextBillingDate}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Billing Cycle</p>
                  <p className="font-semibold capitalize">
                    {subscription.billingCycle}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Payment Method</p>
                  <p className="font-semibold">•••• •••• •••• 4242</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="outline" className="w-full justify-start">
                  <Download className="h-4 w-4 mr-2" />
                  Download Invoice
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <CreditCard className="h-4 w-4 mr-2" />
                  Update Payment Method
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Calendar className="h-4 w-4 mr-2" />
                  Billing History
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Billing History */}
        <div className="mt-8">
          <Card>
            <CardHeader>
              <CardTitle>Billing History</CardTitle>
              <CardDescription>
                View your past invoices and payments
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {billingHistory.map(invoice => (
                  <div
                    key={invoice.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex items-center space-x-4">
                      <div>
                        <p className="font-semibold">{invoice.description}</p>
                        <p className="text-sm text-gray-600">{invoice.date}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <span className="font-semibold">{invoice.amount}</span>
                      <Badge
                        variant={
                          invoice.status === 'paid' ? 'default' : 'secondary'
                        }
                        className="text-xs"
                      >
                        {invoice.status === 'paid' ? (
                          <>
                            <CheckCircle className="h-3 w-3 mr-1" /> Paid
                          </>
                        ) : (
                          <>
                            <XCircle className="h-3 w-3 mr-1" /> Pending
                          </>
                        )}
                      </Badge>
                      <Button variant="outline" size="sm">
                        <Download className="h-4 w-4 mr-1" />
                        Download
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
