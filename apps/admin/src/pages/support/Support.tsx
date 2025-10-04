import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { HelpCircle, MessageSquare, Phone, Mail } from 'lucide-react';

const Support: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Support</h1>
        <p className="text-muted-foreground">Customer support and help center</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Support Center</CardTitle>
          <CardDescription>Customer support and ticket management</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <HelpCircle className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Support Dashboard</h3>
            <p className="text-muted-foreground">Advanced support system with ticket management and live chat coming soon.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Support;
