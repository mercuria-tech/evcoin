import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { cn } from '../../lib/utils';

interface DashboardProps {
  locale: string;
}

const Dashboard: React.FC<DashboardProps> = ({ locale }) => {
  const isRTL = ['ar', 'fa'].includes(locale);

  const data = [
    { name: 'Jan', revenue: 4000, sessions: 2400 },
    { name: 'Feb', revenue: 3000, sessions: 1398 },
    { name: 'Mar', revenue: 2000, sessions: 9800 },
    { name: 'Apr', revenue: 2780, sessions: 3908 },
    { name: 'May', revenue: 1890, sessions: 4800 },
    { name: 'Jun', revenue: 2390, sessions: 3800 },
    { name: 'Jul', revenue: 3490, sessions: 4300 },
  ];

  // Translation function
  const t = (key: string) => {
    const translations: Record<string, Record<string, string>> = {
      en: {
        totalRevenue: 'Total Revenue',
        activeSessions: 'Active Charging Sessions',
        totalStations: 'Total Stations',
        newUsers: 'New Users',
        revenueOverTime: 'Revenue Over Time',
        liveActivityFeed: 'Live Activity Feed',
        systemHealth: 'System Health',
        userJohnDoe: 'User John Doe started charging',
        stationId: 'Station ID: CH001, Connector: A1',
        userJaneSmith: 'Payment received from Jane Smith',
        amount: 'Amount: $15.00',
        stationCH005: 'Station CH005 reported an error',
        connectorB2: 'Connector B2 offline',
        apiGateway: 'API Gateway:',
        database: 'Database:',
        paymentGateway: 'Payment Gateway:',
        operational: 'Operational'
      },
      ar: {
        totalRevenue: 'إجمالي الإيرادات',
        activeSessions: 'جلسات الشحن النشطة',
        totalStations: 'إجمالي المحطات',
        newUsers: 'مستخدمون جدد',
        revenueOverTime: 'الإيرادات عبر الوقت',
        liveActivityFeed: 'تغذية النشاط المباشر',
        systemHealth: 'صحة النظام',
        userJohnDoe: 'بدأ المستخدم جون دو بالشحن',
        stationId: 'معرف المحطة: CH001، الموصل: A1',
        userJaneSmith: 'تم استلام دفعة من جين سميث',
        amount: 'المبلغ: $15.00',
        stationCH005: 'أبلغت المحطة CH005 عن خطأ',
        connectorB2: 'الموصل B2 غير متصل',
        apiGateway: 'بوابة واجهة برمجة التطبيقات:',
        database: 'قاعدة البيانات:',
        paymentGateway: 'بوابة الدفع:',
        operational: 'تشغيلي'
      },
      fa: {
        totalRevenue: 'کل درآمد',
        activeSessions: 'جلسات شارژ فعال',
        totalStations: 'کل ایستگاه‌ها',
        newUsers: 'کاربران جدید',
        revenueOverTime: 'درآمد در طول زمان',
        liveActivityFeed: 'خوراک فعالیت زنده',
        systemHealth: 'سلامت سیستم',
        userJohnDoe: 'کاربر جان دو شروع به شارژ کرد',
        stationId: 'شناسه ایستگاه: CH001، اتصال: A1',
        userJaneSmith: 'پرداخت از جین اسمیت دریافت شد',
        amount: 'مبلغ: $15.00',
        stationCH005: 'ایستگاه CH005 خطا گزارش داد',
        connectorB2: 'اتصال B2 آفلاین',
        apiGateway: 'درگاه API:',
        database: 'پایگاه داده:',
        paymentGateway: 'درگاه پرداخت:',
        operational: 'عملیاتی'
      }
    };
    return translations[locale]?.[key] || key;
  };

  return (
    <div className={cn("grid gap-6 md:grid-cols-2 lg:grid-cols-4", isRTL && "rtl")}>
      <Card className="col-span-1 bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg transform hover:scale-105 transition-transform duration-300">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">{t('totalRevenue')}</CardTitle>
          <CreditCard className="h-4 w-4 text-white" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">$45,231.89</div>
          <p className="text-xs text-blue-100">+20.1% from last month</p>
        </CardContent>
      </Card>
      
      <Card className="col-span-1 bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg transform hover:scale-105 transition-transform duration-300">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">{t('activeSessions')}</CardTitle>
          <Zap className="h-4 w-4 text-white" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">2,350</div>
          <p className="text-xs text-green-100">+180.1% from last hour</p>
        </CardContent>
      </Card>
      
      <Card className="col-span-1 bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-lg transform hover:scale-105 transition-transform duration-300">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">{t('totalStations')}</CardTitle>
          <MapPin className="h-4 w-4 text-white" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">573</div>
          <p className="text-xs text-purple-100">+19% from last month</p>
        </CardContent>
      </Card>
      
      <Card className="col-span-1 bg-gradient-to-r from-red-500 to-red-600 text-white shadow-lg transform hover:scale-105 transition-transform duration-300">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">{t('newUsers')}</CardTitle>
          <Users className="h-4 w-4 text-white" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">+2,150</div>
          <p className="text-xs text-red-100">+201 since last month</p>
        </CardContent>
      </Card>

      <Card className="col-span-full lg:col-span-2 shadow-lg">
        <CardHeader>
          <CardTitle>{t('revenueOverTime')}</CardTitle>
        </CardHeader>
        <CardContent className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="revenue" stroke="#8884d8" activeDot={{ r: 8 }} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card className="col-span-full lg:col-span-2 shadow-lg">
        <CardHeader>
          <CardTitle>{t('liveActivityFeed')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className={cn("flex items-center", isRTL && "flex-row-reverse")}>
              <div className="h-9 w-9 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                <Zap className="h-5 w-5" />
              </div>
              <div className={cn("space-y-1", isRTL ? "ml-4" : "ml-4")}>
                <p className="text-sm font-medium leading-none">{t('userJohnDoe')}</p>
                <p className="text-sm text-muted-foreground">{t('stationId')}</p>
              </div>
              <div className={cn("font-medium text-green-600", isRTL ? "mr-auto" : "ml-auto")}>
                <Badge variant="secondary">Active</Badge>
              </div>
            </div>
            
            <div className={cn("flex items-center", isRTL && "flex-row-reverse")}>
              <div className="h-9 w-9 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                <CreditCard className="h-5 w-5" />
              </div>
              <div className={cn("space-y-1", isRTL ? "ml-4" : "ml-4")}>
                <p className="text-sm font-medium leading-none">{t('userJaneSmith')}</p>
                <p className="text-sm text-muted-foreground">{t('amount')}</p>
              </div>
              <div className={cn("font-medium text-green-600", isRTL ? "mr-auto" : "ml-auto")}>
                <Badge variant="default">Completed</Badge>
              </div>
            </div>
            
            <div className={cn("flex items-center", isRTL && "flex-row-reverse")}>
              <div className="h-9 w-9 rounded-full bg-red-100 flex items-center justify-center text-red-600">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <div className={cn("space-y-1", isRTL ? "ml-4" : "ml-4")}>
                <p className="text-sm font-medium leading-none">{t('stationCH005')}</p>
                <p className="text-sm text-muted-foreground">{t('connectorB2')}</p>
              </div>
              <div className={cn("font-medium text-red-600", isRTL ? "mr-auto" : "ml-auto")}>
                <Badge variant="destructive">Alert</Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="col-span-full shadow-lg">
        <CardHeader>
          <CardTitle>{t('systemHealth')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className={cn("flex items-center space-x-2", isRTL && "flex-row-reverse space-x-reverse")}>
              <Server className="h-5 w-5 text-blue-500" />
              <p className="text-sm font-medium">{t('apiGateway')}</p>
              <Badge variant="default" className="bg-green-500">{t('operational')}</Badge>
            </div>
            <div className={cn("flex items-center space-x-2", isRTL && "flex-row-reverse space-x-reverse")}>
              <Database className="h-5 w-5 text-blue-500" />
              <p className="text-sm font-medium">{t('database')}</p>
              <Badge variant="default" className="bg-green-500">{t('operational')}</Badge>
            </div>
            <div className={cn("flex items-center space-x-2", isRTL && "flex-row-reverse space-x-reverse")}>
              <CreditCard className="h-5 w-5 text-blue-500" />
              <p className="text-sm font-medium">{t('paymentGateway')}</p>
              <Badge variant="default" className="bg-green-500">{t('operational')}</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;