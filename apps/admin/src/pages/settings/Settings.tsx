import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Settings, Shield, Key, Database, Globe } from 'lucide-react';

const Settings: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Settings</h1>
        <p className="text-muted-foreground">Platform configuration and settings</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Shield className="w-5 h-5 mr-2" />
              Security Settings
            </CardTitle>
            <CardDescription>Configure security and access controls</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span>Two-Factor Authentication</span>
                <span className="text-green-600">Enabled</span>
              </div>
              <div className="flex items-center justify-between">
                <span>API Rate Limiting</span>
                <span className="text-green-600">Active</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Session Timeout</span>
                <span>30 minutes</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Database className="w-5 h-5 mr-2" />
              Database Settings
            </CardTitle>
            <CardDescription>Database configuration and maintenance</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span>Database Status</span>
                <span className="text-green-600">Connected</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Backup Frequency</span>
                <span>Daily</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Storage Used</span>
                <span>2.4 GB</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Globe className="w-5 h-5 mr-2" />
              API Settings
            </CardTitle>
            <CardDescription>API configuration and endpoints</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span>API Version</span>
                <span>v1.0.0</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Rate Limit</span>
                <span>1000/hour</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Documentation</span>
                <span className="text-blue-600">Available</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Key className="w-5 h-5 mr-2" />
              Integration Settings
            </CardTitle>
            <CardDescription>Third-party integrations and APIs</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span>Payment Providers</span>
                <span className="text-green-600">3 Active</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Maps Integration</span>
                <span className="text-green-600">Google Maps</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Notification Services</span>
                <span className="text-green-600">5 Channels</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Settings;
