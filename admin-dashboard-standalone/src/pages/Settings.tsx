import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Settings, 
  Save,
  RefreshCw,
  Shield,
  Bell,
  Globe,
  Zap,
  DollarSign,
  Key,
  Mail,
  Smartphone,
  AlertTriangle,
  CheckCircle,
  XCircle
} from 'lucide-react';

const SettingsPage: React.FC = () => {
  const { t } = useTranslation();
  const [settings, setSettings] = useState<any>({
    general: {
      platformName: 'EV Charging Platform',
      timezone: 'UTC',
      language: 'en',
      dateFormat: 'MM/DD/YYYY',
      currency: 'USD',
      maintenanceMode: false
    },
    notifications: {
      emailNotifications: true,
      smsNotifications: false,
      pushNotifications: true,
      maintenanceAlerts: true,
      paymentAlerts: true,
      systemAlerts: true,
      userAlerts: false
    },
    charging: {
      defaultSessionTimeout: 30,
      maxSessionDuration: 480,
      idleTimeout: 15,
      pricingModel: 'per_kwh',
      baseRate: 0.15,
      peakRate: 0.25,
      offPeakRate: 0.10,
      peakHours: '08:00-18:00'
    },
    payment: {
      paymentMethods: ['credit_card', 'paypal', 'apple_pay', 'google_pay'],
      autoRefund: true,
      refundTimeout: 24,
      currencyConversion: true,
      taxRate: 8.5,
      processingFee: 2.9
    },
    security: {
      sessionTimeout: 30,
      passwordPolicy: 'strong',
      twoFactorAuth: true,
      ipWhitelist: [],
      apiRateLimit: 1000,
      encryptionLevel: 'AES-256'
    },
    integrations: {
      ocppVersion: '1.6',
      paymentGateway: 'stripe',
      smsProvider: 'twilio',
      emailProvider: 'sendgrid',
      analyticsProvider: 'google_analytics',
      mapsProvider: 'google_maps'
    }
  });
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('general');
  // const [showApiKeyModal] = useState(false);
  // const [newApiKey] = useState({
  //   name: '',
  //   permissions: ['read'],
  //   expiresIn: '30'
  // });

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        // Mock settings data - in production, this would come from API
        setLoading(false);
      } catch (err) {
        console.error('Error fetching settings:', err);
        setError(`Failed to load settings: ${err instanceof Error ? err.message : 'Unknown error'}`);
        setLoading(false);
      }
    };

    fetchSettings();
  }, []);

  const handleSaveSettings = async () => {
    setSaving(true);
    setError(null);
    setSuccess(null);
    
    try {
      // Mock save - in production, this would call API
      await new Promise(resolve => setTimeout(resolve, 1000));
      setSuccess('Settings saved successfully!');
    } catch (err) {
      setError(`Failed to save settings: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setSaving(false);
    }
  };

  const updateSetting = (category: string, key: string, value: any) => {
    setSettings((prev: any) => ({
      ...prev,
      [category]: {
        ...prev[category],
        [key]: value
      }
    }));
  };

  const getStatusIcon = (status: boolean) => {
    return status ? (
      <CheckCircle className="h-5 w-5 text-green-500" />
    ) : (
      <XCircle className="h-5 w-5 text-red-500" />
    );
  };

  const tabs = [
    { id: 'general', label: 'General', icon: Settings },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'charging', label: 'Charging', icon: Zap },
    { id: 'payment', label: 'Payment', icon: DollarSign },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'integrations', label: 'Integrations', icon: Globe }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Settings
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Configure platform settings and preferences
          </p>
        </div>
        <div className="flex space-x-3">
          <Button variant="outline" onClick={() => window.location.reload()}>
            <RefreshCw className="mr-2 h-4 w-4" /> Reset
          </Button>
          <Button onClick={handleSaveSettings} disabled={saving}>
            {saving ? (
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </div>

      {/* Status Messages */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <AlertTriangle className="h-5 w-5 text-red-400" />
            <div className="ml-3">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          </div>
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 rounded-md p-4">
          <div className="flex">
            <CheckCircle className="h-5 w-5 text-green-400" />
            <div className="ml-3">
              <p className="text-sm text-green-800">{success}</p>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="mr-2 h-4 w-4" />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Settings Content */}
      <div className="space-y-6">
        {/* General Settings */}
        {activeTab === 'general' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Platform Configuration</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="platform-name">Platform Name</Label>
                  <Input
                    id="platform-name"
                    type="text"
                    value={settings.general.platformName}
                    onChange={(e) => updateSetting('general', 'platformName', e.target.value)}
                    placeholder="EV Charging Platform"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="timezone">Timezone</Label>
                  <Select value={settings.general.timezone} onValueChange={(value) => updateSetting('general', 'timezone', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select timezone" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="UTC">UTC</SelectItem>
                      <SelectItem value="America/New_York">Eastern Time</SelectItem>
                      <SelectItem value="America/Chicago">Central Time</SelectItem>
                      <SelectItem value="America/Denver">Mountain Time</SelectItem>
                      <SelectItem value="America/Los_Angeles">Pacific Time</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="language">Language</Label>
                  <Select value={settings.general.language} onValueChange={(value) => updateSetting('general', 'language', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select language" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="ar">Arabic</SelectItem>
                      <SelectItem value="fa">Farsi</SelectItem>
                      <SelectItem value="es">Spanish</SelectItem>
                      <SelectItem value="fr">French</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="currency">Currency</Label>
                  <Select value={settings.general.currency} onValueChange={(value) => updateSetting('general', 'currency', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select currency" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USD">USD ($)</SelectItem>
                      <SelectItem value="EUR">EUR (€)</SelectItem>
                      <SelectItem value="GBP">GBP (£)</SelectItem>
                      <SelectItem value="CAD">CAD (C$)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>System Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Maintenance Mode</span>
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(settings.general.maintenanceMode)}
                    <button
                      onClick={() => updateSetting('general', 'maintenanceMode', !settings.general.maintenanceMode)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        settings.general.maintenanceMode ? 'bg-blue-600' : 'bg-gray-200'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          settings.general.maintenanceMode ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">API Status</span>
                  <Badge variant="default" className="bg-green-100 text-green-800">Online</Badge>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Database Status</span>
                  <Badge variant="default" className="bg-green-100 text-green-800">Connected</Badge>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Payment Gateway</span>
                  <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Degraded</Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Notifications Settings */}
        {activeTab === 'notifications' && (
          <Card>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-medium">Communication Channels</h4>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Mail className="h-4 w-4" />
                      <span className="text-sm">Email Notifications</span>
                    </div>
                    <button
                      onClick={() => updateSetting('notifications', 'emailNotifications', !settings.notifications.emailNotifications)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        settings.notifications.emailNotifications ? 'bg-blue-600' : 'bg-gray-200'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          settings.notifications.emailNotifications ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Smartphone className="h-4 w-4" />
                      <span className="text-sm">SMS Notifications</span>
                    </div>
                    <button
                      onClick={() => updateSetting('notifications', 'smsNotifications', !settings.notifications.smsNotifications)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        settings.notifications.smsNotifications ? 'bg-blue-600' : 'bg-gray-200'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          settings.notifications.smsNotifications ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Bell className="h-4 w-4" />
                      <span className="text-sm">Push Notifications</span>
                    </div>
                    <button
                      onClick={() => updateSetting('notifications', 'pushNotifications', !settings.notifications.pushNotifications)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        settings.notifications.pushNotifications ? 'bg-blue-600' : 'bg-gray-200'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          settings.notifications.pushNotifications ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-medium">Alert Types</h4>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Maintenance Alerts</span>
                    <button
                      onClick={() => updateSetting('notifications', 'maintenanceAlerts', !settings.notifications.maintenanceAlerts)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        settings.notifications.maintenanceAlerts ? 'bg-blue-600' : 'bg-gray-200'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          settings.notifications.maintenanceAlerts ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm">Payment Alerts</span>
                    <button
                      onClick={() => updateSetting('notifications', 'paymentAlerts', !settings.notifications.paymentAlerts)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        settings.notifications.paymentAlerts ? 'bg-blue-600' : 'bg-gray-200'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          settings.notifications.paymentAlerts ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm">System Alerts</span>
                    <button
                      onClick={() => updateSetting('notifications', 'systemAlerts', !settings.notifications.systemAlerts)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        settings.notifications.systemAlerts ? 'bg-blue-600' : 'bg-gray-200'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          settings.notifications.systemAlerts ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Charging Settings */}
        {activeTab === 'charging' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Session Configuration</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="session-timeout">Default Session Timeout (minutes)</Label>
                  <Input
                    id="session-timeout"
                    type="number"
                    value={settings.charging.defaultSessionTimeout}
                    onChange={(e) => updateSetting('charging', 'defaultSessionTimeout', parseInt(e.target.value))}
                    placeholder="30"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="max-duration">Max Session Duration (minutes)</Label>
                  <Input
                    id="max-duration"
                    type="number"
                    value={settings.charging.maxSessionDuration}
                    onChange={(e) => updateSetting('charging', 'maxSessionDuration', parseInt(e.target.value))}
                    placeholder="480"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="idle-timeout">Idle Timeout (minutes)</Label>
                  <Input
                    id="idle-timeout"
                    type="number"
                    value={settings.charging.idleTimeout}
                    onChange={(e) => updateSetting('charging', 'idleTimeout', parseInt(e.target.value))}
                    placeholder="15"
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Pricing Configuration</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="pricing-model">Pricing Model</Label>
                  <Select value={settings.charging.pricingModel} onValueChange={(value) => updateSetting('charging', 'pricingModel', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select pricing model" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="per_kwh">Per kWh</SelectItem>
                      <SelectItem value="per_minute">Per Minute</SelectItem>
                      <SelectItem value="flat_rate">Flat Rate</SelectItem>
                      <SelectItem value="tiered">Tiered</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="base-rate">Base Rate ($/kWh)</Label>
                  <Input
                    id="base-rate"
                    type="number"
                    step="0.01"
                    value={settings.charging.baseRate}
                    onChange={(e) => updateSetting('charging', 'baseRate', parseFloat(e.target.value))}
                    placeholder="0.15"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="peak-rate">Peak Rate ($/kWh)</Label>
                  <Input
                    id="peak-rate"
                    type="number"
                    step="0.01"
                    value={settings.charging.peakRate}
                    onChange={(e) => updateSetting('charging', 'peakRate', parseFloat(e.target.value))}
                    placeholder="0.25"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="offpeak-rate">Off-Peak Rate ($/kWh)</Label>
                  <Input
                    id="offpeak-rate"
                    type="number"
                    step="0.01"
                    value={settings.charging.offPeakRate}
                    onChange={(e) => updateSetting('charging', 'offPeakRate', parseFloat(e.target.value))}
                    placeholder="0.10"
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Payment Settings */}
        {activeTab === 'payment' && (
          <Card>
            <CardHeader>
              <CardTitle>Payment Configuration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-medium">Payment Methods</h4>
                  {['credit_card', 'paypal', 'apple_pay', 'google_pay', 'bank_transfer'].map((method) => (
                    <div key={method} className="flex items-center justify-between">
                      <span className="text-sm capitalize">{method.replace('_', ' ')}</span>
                      <button
                        onClick={() => {
                          const currentMethods = settings.payment.paymentMethods;
                          const updatedMethods = currentMethods.includes(method)
                            ? currentMethods.filter((m: string) => m !== method)
                            : [...currentMethods, method];
                          updateSetting('payment', 'paymentMethods', updatedMethods);
                        }}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          settings.payment.paymentMethods.includes(method) ? 'bg-blue-600' : 'bg-gray-200'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            settings.payment.paymentMethods.includes(method) ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>
                  ))}
                </div>

                <div className="space-y-4">
                  <h4 className="font-medium">Payment Settings</h4>
                  
                  <div className="space-y-2">
                    <Label htmlFor="tax-rate">Tax Rate (%)</Label>
                    <Input
                      id="tax-rate"
                      type="number"
                      step="0.1"
                      value={settings.payment.taxRate}
                      onChange={(e) => updateSetting('payment', 'taxRate', parseFloat(e.target.value))}
                      placeholder="8.5"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="processing-fee">Processing Fee (%)</Label>
                    <Input
                      id="processing-fee"
                      type="number"
                      step="0.1"
                      value={settings.payment.processingFee}
                      onChange={(e) => updateSetting('payment', 'processingFee', parseFloat(e.target.value))}
                      placeholder="2.9"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm">Auto Refund</span>
                    <button
                      onClick={() => updateSetting('payment', 'autoRefund', !settings.payment.autoRefund)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        settings.payment.autoRefund ? 'bg-primary' : 'bg-gray-200'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          settings.payment.autoRefund ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Security Settings */}
        {activeTab === 'security' && (
          <Card>
            <CardHeader>
              <CardTitle>Security Configuration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-medium">Authentication</h4>
                  
                  <div className="space-y-2">
                    <Label htmlFor="session-timeout">Session Timeout (minutes)</Label>
                    <Input
                      id="session-timeout"
                      type="number"
                      value={settings.security.sessionTimeout}
                      onChange={(e) => updateSetting('security', 'sessionTimeout', parseInt(e.target.value))}
                      placeholder="30"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password-policy">Password Policy</Label>
                    <Select value={settings.security.passwordPolicy} onValueChange={(value) => updateSetting('security', 'passwordPolicy', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select password policy" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="basic">Basic</SelectItem>
                        <SelectItem value="strong">Strong</SelectItem>
                        <SelectItem value="enterprise">Enterprise</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm">Two-Factor Authentication</span>
                    <button
                      onClick={() => updateSetting('security', 'twoFactorAuth', !settings.security.twoFactorAuth)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        settings.security.twoFactorAuth ? 'bg-primary' : 'bg-gray-200'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          settings.security.twoFactorAuth ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-medium">API Security</h4>
                  
                  <div className="space-y-2">
                    <Label htmlFor="api-rate-limit">API Rate Limit (requests/hour)</Label>
                    <Input
                      id="api-rate-limit"
                      type="number"
                      value={settings.security.apiRateLimit}
                      onChange={(e) => updateSetting('security', 'apiRateLimit', parseInt(e.target.value))}
                      placeholder="1000"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="encryption-level">Encryption Level</Label>
                    <Select value={settings.security.encryptionLevel} onValueChange={(value) => updateSetting('security', 'encryptionLevel', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select encryption level" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="AES-128">AES-128</SelectItem>
                        <SelectItem value="AES-256">AES-256</SelectItem>
                        <SelectItem value="RSA-2048">RSA-2048</SelectItem>
                        <SelectItem value="RSA-4096">RSA-4096</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center justify-between">
                    <Button variant="outline" size="sm" onClick={() => alert('API Key management coming soon!')}>
                      <Key className="mr-2 h-4 w-4" /> Manage API Keys
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Integrations Settings */}
        {activeTab === 'integrations' && (
          <Card>
            <CardHeader>
              <CardTitle>Third-Party Integrations</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-medium">Charging Protocol</h4>
                  
                  <div className="space-y-2">
                    <Label htmlFor="ocpp-version">OCPP Version</Label>
                    <Select value={settings.integrations.ocppVersion} onValueChange={(value) => updateSetting('integrations', 'ocppVersion', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select OCPP version" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1.6">OCPP 1.6</SelectItem>
                        <SelectItem value="2.0.1">OCPP 2.0.1</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-medium">Service Providers</h4>
                  
                  <div className="space-y-2">
                    <Label htmlFor="payment-gateway">Payment Gateway</Label>
                    <Select value={settings.integrations.paymentGateway} onValueChange={(value) => updateSetting('integrations', 'paymentGateway', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select payment gateway" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="stripe">Stripe</SelectItem>
                        <SelectItem value="paypal">PayPal</SelectItem>
                        <SelectItem value="square">Square</SelectItem>
                        <SelectItem value="adyen">Adyen</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="sms-provider">SMS Provider</Label>
                    <Select value={settings.integrations.smsProvider} onValueChange={(value) => updateSetting('integrations', 'smsProvider', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select SMS provider" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="twilio">Twilio</SelectItem>
                        <SelectItem value="aws_sns">AWS SNS</SelectItem>
                        <SelectItem value="sendgrid">SendGrid</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email-provider">Email Provider</Label>
                    <Select value={settings.integrations.emailProvider} onValueChange={(value) => updateSetting('integrations', 'emailProvider', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select email provider" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="sendgrid">SendGrid</SelectItem>
                        <SelectItem value="aws_ses">AWS SES</SelectItem>
                        <SelectItem value="mailgun">Mailgun</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default SettingsPage;
