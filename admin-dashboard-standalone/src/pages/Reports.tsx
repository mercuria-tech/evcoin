import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  FileText, 
  Download,
  Calendar,
  Search,
  BarChart3,
  TrendingUp,
  Users,
  Zap,
  DollarSign,
  Clock
} from 'lucide-react';

const ReportsPage: React.FC = () => {
  const { t } = useTranslation();
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [dateRange, setDateRange] = useState('last30days');

  useEffect(() => {
    const fetchReports = async () => {
      try {
        // Mock reports data - in production, this would come from API
        const mockReports = [
          {
            id: 'RPT-001',
            title: 'Monthly Revenue Report',
            type: 'revenue',
            description: 'Comprehensive revenue analysis for the current month',
            generatedAt: '2024-01-15T10:30:00Z',
            period: 'January 2024',
            status: 'completed',
            size: '2.4 MB',
            format: 'PDF',
            metrics: {
              totalRevenue: 125800,
              sessions: 1247,
              averageSessionValue: 100.96,
              growthRate: 8.5
            }
          },
          {
            id: 'RPT-002',
            title: 'Station Performance Analysis',
            type: 'performance',
            description: 'Detailed analysis of station utilization and efficiency',
            generatedAt: '2024-01-14T14:20:00Z',
            period: 'Last 30 days',
            status: 'completed',
            size: '1.8 MB',
            format: 'Excel',
            metrics: {
              totalStations: 156,
              averageUtilization: 78.5,
              topPerformingStation: 'Downtown Hub',
              maintenanceAlerts: 3
            }
          },
          {
            id: 'RPT-003',
            title: 'User Behavior Insights',
            type: 'users',
            description: 'Analysis of user patterns and charging behavior',
            generatedAt: '2024-01-13T09:15:00Z',
            period: 'Q4 2023',
            status: 'completed',
            size: '3.2 MB',
            format: 'PDF',
            metrics: {
              totalUsers: 2847,
              newUsers: 234,
              retentionRate: 85.2,
              averageSessionDuration: 45.5
            }
          },
          {
            id: 'RPT-004',
            title: 'Energy Consumption Report',
            type: 'energy',
            description: 'Detailed energy usage patterns and efficiency metrics',
            generatedAt: '2024-01-12T16:45:00Z',
            period: 'December 2023',
            status: 'completed',
            size: '2.1 MB',
            format: 'CSV',
            metrics: {
              totalEnergyDelivered: 125000,
              averageEfficiency: 92.3,
              peakDemand: 450,
              carbonSaved: 12500
            }
          },
          {
            id: 'RPT-005',
            title: 'Financial Summary',
            type: 'financial',
            description: 'Complete financial overview including costs and profits',
            generatedAt: '2024-01-11T11:30:00Z',
            period: '2023 Annual',
            status: 'completed',
            size: '4.5 MB',
            format: 'PDF',
            metrics: {
              totalRevenue: 1250000,
              operatingCosts: 450000,
              netProfit: 800000,
              profitMargin: 64.0
            }
          },
          {
            id: 'RPT-006',
            title: 'Maintenance Schedule Report',
            type: 'maintenance',
            description: 'Upcoming maintenance tasks and equipment status',
            generatedAt: '2024-01-10T08:00:00Z',
            period: 'Next 90 days',
            status: 'generating',
            size: '0 MB',
            format: 'PDF',
            metrics: {
              scheduledMaintenance: 12,
              urgentRepairs: 2,
              preventiveTasks: 45,
              estimatedCost: 25000
            }
          }
        ];
        
        setReports(mockReports);
      } catch (err) {
        console.error('Error fetching reports:', err);
        setError(`Failed to load reports: ${err instanceof Error ? err.message : 'Unknown error'}`);
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
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

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'revenue':
        return <DollarSign className="h-5 w-5" />;
      case 'performance':
        return <BarChart3 className="h-5 w-5" />;
      case 'users':
        return <Users className="h-5 w-5" />;
      case 'energy':
        return <Zap className="h-5 w-5" />;
      case 'financial':
        return <TrendingUp className="h-5 w-5" />;
      case 'maintenance':
        return <Clock className="h-5 w-5" />;
      default:
        return <FileText className="h-5 w-5" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge variant="default" className="bg-green-100 text-green-800">Completed</Badge>;
      case 'generating':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Generating</Badge>;
      case 'failed':
        return <Badge variant="destructive">Failed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getFormatBadge = (format: string) => {
    const colors = {
      PDF: 'bg-red-100 text-red-800',
      Excel: 'bg-green-100 text-green-800',
      CSV: 'bg-blue-100 text-blue-800',
      JSON: 'bg-purple-100 text-purple-800'
    };
    
    return (
      <Badge variant="outline" className={colors[format as keyof typeof colors] || 'bg-gray-100 text-gray-800'}>
        {format}
      </Badge>
    );
  };

  const filteredReports = reports.filter(report => {
    const matchesSearch = report.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         report.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = selectedType === 'all' || report.type === selectedType;
    return matchesSearch && matchesType;
  });

  const generateNewReport = () => {
    alert('Report generation feature will be implemented in the next phase!');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Reports
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Generate and manage comprehensive reports
          </p>
        </div>
        <Button onClick={generateNewReport}>
          <FileText className="mr-2 h-4 w-4" /> Generate Report
        </Button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Reports</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{reports.length}</div>
            <p className="text-xs text-muted-foreground">All time</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{reports.filter(r => r.status === 'completed').length}</div>
            <p className="text-xs text-muted-foreground">Ready for download</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Generating</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{reports.filter(r => r.status === 'generating').length}</div>
            <p className="text-xs text-muted-foreground">In progress</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Size</CardTitle>
            <Download className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {reports.reduce((total, report) => {
                const size = parseFloat(report.size) || 0;
                return total + size;
              }, 0).toFixed(1)} MB
            </div>
            <p className="text-xs text-muted-foreground">All reports</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex items-center space-x-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search reports..."
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 pl-9 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <select
          value={selectedType}
          onChange={(e) => setSelectedType(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All Types</option>
          <option value="revenue">Revenue</option>
          <option value="performance">Performance</option>
          <option value="users">Users</option>
          <option value="energy">Energy</option>
          <option value="financial">Financial</option>
          <option value="maintenance">Maintenance</option>
        </select>
        <select
          value={dateRange}
          onChange={(e) => setDateRange(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="last7days">Last 7 days</option>
          <option value="last30days">Last 30 days</option>
          <option value="last90days">Last 90 days</option>
          <option value="lastyear">Last year</option>
        </select>
      </div>

      {/* Reports List */}
      <div className="grid gap-4">
        {filteredReports.map((report) => (
          <Card key={report.id}>
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4 flex-1">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600">
                      {getTypeIcon(report.type)}
                    </div>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-2">
                      <h3 className="text-lg font-semibold">{report.title}</h3>
                      {getStatusBadge(report.status)}
                      {getFormatBadge(report.format)}
                    </div>
                    
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                      {report.description}
                    </p>
                    
                    <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-1" />
                        <span>{report.period}</span>
                      </div>
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-1" />
                        <span>{new Date(report.generatedAt).toLocaleString()}</span>
                      </div>
                      <div className="flex items-center">
                        <FileText className="h-4 w-4 mr-1" />
                        <span>{report.size}</span>
                      </div>
                    </div>
                    
                    {/* Key Metrics */}
                    <div className="mt-4 grid grid-cols-2 lg:grid-cols-4 gap-4">
                      {Object.entries(report.metrics).slice(0, 4).map(([key, value]) => (
                        <div key={key} className="text-sm">
                          <div className="text-gray-500 dark:text-gray-400 capitalize">
                            {key.replace(/([A-Z])/g, ' $1').trim()}
                          </div>
                          <div className="font-semibold">
                            {typeof value === 'number' && key.includes('Revenue') ? `$${value.toLocaleString()}` :
                             typeof value === 'number' && key.includes('Rate') ? `${value}%` :
                             typeof value === 'number' ? value.toLocaleString() : String(value)}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                
                <div className="flex space-x-2 ml-4">
                  {report.status === 'completed' && (
                    <Button variant="outline" size="sm">
                      <Download className="mr-2 h-4 w-4" /> Download
                    </Button>
                  )}
                  <Button variant="outline" size="sm">
                    <BarChart3 className="mr-2 h-4 w-4" /> View Details
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredReports.length === 0 && (
        <div className="text-center py-12">
          <FileText className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100">No reports found</h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Try adjusting your search or filter criteria.
          </p>
        </div>
      )}
    </div>
  );
};

export default ReportsPage;
