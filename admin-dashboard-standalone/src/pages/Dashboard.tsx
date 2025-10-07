import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { analyticsAPI } from '@/services/api';
import { 
  Zap, 
  Users, 
  TrendingUp,
  Activity,
  Clock,
  DollarSign
} from 'lucide-react';

const Dashboard: React.FC = () => {
  const { t, i18n } = useTranslation();
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const isRTL = i18n.language === 'ar' || i18n.language === 'fa';

  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log('Fetching dashboard data...');
        const response = await analyticsAPI.getDashboard();
        console.log('Dashboard data received:', response.data);
        setDashboardData(response.data);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        // Use mock data as fallback
        const mockData = {
          totalStations: 156,
          activeSessions: 23,
          totalUsers: 2847,
          revenueToday: 12847.5,
          systemHealth: {
            api: 'healthy',
            database: 'online',
            paymentGateway: 'degraded'
          },
          recentActivity: [
            {
              id: 1,
              user: 'John Doe',
              action: 'Started charging session',
              station: 'Station ST-001',
              time: '2 minutes ago',
              type: 'session'
            },
            {
              id: 2,
              user: 'Jane Smith',
              action: 'Completed payment',
              amount: '$45.20',
              time: '5 minutes ago',
              type: 'payment'
            }
          ],
          quickStats: {
            stationsGrowth: '+12%',
            sessionsGrowth: '+5%',
            usersGrowth: '+18%',
            revenueGrowth: '+8%'
          }
        };
        console.log('Using mock data as fallback');
        setDashboardData(mockData);
        setError(null);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

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

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-red-600 dark:text-red-400">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const stats = [
    {
      title: t('dashboard.total_stations'),
      value: dashboardData?.totalStations?.toString() || '0',
      change: dashboardData?.quickStats?.stationsGrowth || '+0%',
      changeType: 'positive' as const,
      icon: Zap,
    },
    {
      title: t('dashboard.active_sessions'),
      value: dashboardData?.activeSessions?.toString() || '0',
      change: dashboardData?.quickStats?.sessionsGrowth || '+0%',
      changeType: 'positive' as const,
      icon: Activity,
    },
    {
      title: t('dashboard.total_users'),
      value: dashboardData?.totalUsers?.toString() || '0',
      change: dashboardData?.quickStats?.usersGrowth || '+0%',
      changeType: 'positive' as const,
      icon: Users,
    },
    {
      title: t('dashboard.revenue_today'),
      value: `$${dashboardData?.revenueToday?.toLocaleString() || '0'}`,
      change: dashboardData?.quickStats?.revenueGrowth || '+0%',
      changeType: 'positive' as const,
      icon: DollarSign,
    },
  ];

  const recentActivity = dashboardData?.recentActivity || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          {t('dashboard.title')}
        </h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          {t('dashboard.quick_stats')}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className={`flex flex-row items-center justify-between space-y-0 pb-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
              <CardTitle className={`text-sm font-medium ${isRTL ? 'text-right' : 'text-left'}`}>
                {stat.title}
              </CardTitle>
              <stat.icon className={`h-4 w-4 text-muted-foreground ${isRTL ? 'ml-3' : 'mr-3'}`} />
            </CardHeader>
            <CardContent className={`${isRTL ? 'text-right' : 'text-left'}`}>
              <div className="text-2xl font-bold">{stat.value}</div>
              <div className={`flex items-center text-xs text-muted-foreground ${isRTL ? 'flex-row-reverse space-x-reverse space-x-2' : 'space-x-2'}`}>
                <Badge variant={stat.changeType === 'positive' ? 'default' : 'destructive'}>
                  {stat.change}
                </Badge>
                <span>{t('dashboard.from_last_month')}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts and Activity */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Revenue Chart */}
        <Card>
          <CardHeader>
            <CardTitle>{t('analytics.revenue_analytics')}</CardTitle>
            <CardDescription>
              Monthly revenue trends
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] flex items-center justify-center text-muted-foreground">
              <div className="text-center">
                <TrendingUp className="h-12 w-12 mx-auto mb-4" />
                <p>Revenue chart will be displayed here</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className={`${isRTL ? 'text-right' : 'text-left'}`}>{t('dashboard.recent_activity')}</CardTitle>
            <CardDescription className={`${isRTL ? 'text-right' : 'text-left'}`}>
              {t('dashboard.latest_activities')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.map((activity: any) => (
                <div key={activity.id} className={`flex items-center ${isRTL ? 'flex-row-reverse space-x-reverse space-x-4' : 'space-x-4'}`}>
                  <div className="flex-shrink-0">
                    <div className="h-8 w-8 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                      <Users className="h-4 w-4 text-gray-600 dark:text-gray-300" />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium text-gray-900 dark:text-white ${isRTL ? 'text-right' : 'text-left'}`}>
                      {activity.user}
                    </p>
                    <p className={`text-sm text-gray-500 dark:text-gray-400 ${isRTL ? 'text-right' : 'text-left'}`}>
                      {activity.action}
                      {activity.station && ` at ${activity.station}`}
                      {activity.amount && ` - ${activity.amount}`}
                    </p>
                  </div>
                  <div className={`flex-shrink-0 text-xs text-gray-500 dark:text-gray-400 ${isRTL ? 'text-left' : 'text-right'}`}>
                    <Clock className={`h-3 w-3 inline ${isRTL ? 'ml-1' : 'mr-1'}`} />
                    {activity.time}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* System Health */}
      <Card>
        <CardHeader>
          <CardTitle>{t('dashboard.system_health')}</CardTitle>
          <CardDescription>
            Current system status and performance metrics
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {Object.entries(dashboardData?.systemHealth || {}).map(([key, value]: [string, any]) => (
              <div key={key} className="flex items-center space-x-3">
                <div className={`h-3 w-3 rounded-full ${
                  value === 'healthy' || value === 'online' ? 'bg-green-500' : 
                  value === 'degraded' ? 'bg-yellow-500' : 'bg-red-500'
                }`}></div>
                <span className="text-sm font-medium capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
                <Badge variant={
                  value === 'healthy' || value === 'online' ? 'default' : 
                  value === 'degraded' ? 'secondary' : 'destructive'
                }>
                  {value}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;