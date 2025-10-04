import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Bell, Mail, MessageSquare, Phone } from 'lucide-react';

const Notifications: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Notifications</h1>
        <p className="text-muted-foreground">Manage notifications and alerts</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Notification Center</CardTitle>
          <CardDescription>Multi-channel notification management</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Bell className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Notification Management</h3>
            <p className="text-muted-foreground">Advanced notification system with email, SMS, and push notifications coming soon.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Notifications;
