import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DateRangePicker } from '@/components/ui/date-range-picker';
import { DateRange } from 'react-day-picker';
import { format, subDays, startOfWeek, endOfWeek, startOfDay, endOfDay } from 'date-fns';
import { Button } from '@/components/ui/button';
import { BarChart3, Users, Car, Building2, Calendar, CircleDollarSign, TrendingUp, TrendingDown } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend, LineChart, Line } from 'recharts';

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#0088fe', '#00c49f', '#ffbb28', '#ff8042'];

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ElementType;
  trend?: 'up' | 'down';
  trendValue?: string;
  bgClass?: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon: Icon, trend, trendValue, bgClass = 'bg-white' }) => {
  return (
    <Card className={bgClass}>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-gray-600">{title}</CardTitle>
        <Icon className="h-4 w-4 text-gray-600" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {trend && trendValue && (
          <div className="flex items-center text-xs mt-1">
            {trend === 'up' ? (
              <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
            ) : (
              <TrendingDown className="h-4 w-4 text-red-500 mr-1" />
            )}
            <span className={trend === 'up' ? 'text-green-500' : 'text-red-500'}>
              {trendValue}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

const Analytics: React.FC = () => {
  const [dateRange, setDateRange] = useState<DateRange>({
    from: startOfWeek(new Date()),
    to: endOfWeek(new Date()),
  });

  // Fetch analytics data
  const { data: analytics, isLoading } = useQuery({
    queryKey: ['/api/admin/analytics', dateRange],
    queryFn: async () => {
      const response = await fetch('/api/admin/analytics', {
        credentials: 'include',
      });
      if (!response.ok) {
        throw new Error('Failed to fetch analytics');
      }
      return response.json();
    },
  });

  // Quick date range presets
  const setDateRangePreset = (preset: string) => {
    const today = new Date();
    switch (preset) {
      case "today":
        setDateRange({
          from: startOfDay(today),
          to: endOfDay(today),
        });
        break;
      case "week":
        setDateRange({
          from: startOfWeek(today),
          to: endOfWeek(today),
        });
        break;
      case "month":
        setDateRange({
          from: new Date(today.getFullYear(), today.getMonth(), 1),
          to: new Date(today.getFullYear(), today.getMonth() + 1, 0),
        });
        break;
    }
  };

  // Sample data for charts (replace with real data from API)
  const revenueData = [
    { name: 'Mon', revenue: 4000 },
    { name: 'Tue', revenue: 3000 },
    { name: 'Wed', revenue: 5000 },
    { name: 'Thu', revenue: 2780 },
    { name: 'Fri', revenue: 1890 },
    { name: 'Sat', revenue: 2390 },
    { name: 'Sun', revenue: 3490 },
  ];

  const bookingData = [
    { name: 'Mon', bookings: 24 },
    { name: 'Tue', bookings: 13 },
    { name: 'Wed', bookings: 98 },
    { name: 'Thu', bookings: 39 },
    { name: 'Fri', bookings: 48 },
    { name: 'Sat', bookings: 38 },
    { name: 'Sun', bookings: 43 },
  ];

  const vehicleTypeData = [
    { name: 'Sedan', value: 400 },
    { name: 'SUV', value: 300 },
    { name: 'Truck', value: 300 },
    { name: 'Van', value: 200 },
  ];

  return (
    <div className="space-y-6">
      {/* Date Range Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setDateRangePreset("today")}
          >
            Today
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setDateRangePreset("week")}
          >
            This Week
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setDateRangePreset("month")}
          >
            This Month
          </Button>
        </div>
        <DateRangePicker
          value={dateRange}
          onChange={setDateRange}
        />
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Total Revenue" 
          value={analytics?.totalRevenue || "$0"} 
          icon={CircleDollarSign} 
          trend="up" 
          trendValue="+12% from last period"
          bgClass="bg-gradient-to-r from-purple-500 to-pink-500 text-white"
        />
        <StatCard 
          title="Total Bookings" 
          value={analytics?.totalBookings || "0"} 
          icon={Calendar} 
          trend="up" 
          trendValue="+8% from last period"
          bgClass="bg-gradient-to-r from-blue-500 to-cyan-500 text-white"
        />
        <StatCard 
          title="Active Users" 
          value={analytics?.activeUsers || "0"} 
          icon={Users} 
          trend="up" 
          trendValue="+5% from last period"
          bgClass="bg-gradient-to-r from-green-500 to-emerald-500 text-white"
        />
        <StatCard 
          title="Available Vehicles" 
          value={analytics?.availableVehicles || "0"} 
          icon={Car} 
          trend="up" 
          trendValue="+3% from last period"
          bgClass="bg-gradient-to-r from-amber-500 to-orange-500 text-white"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Revenue Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="revenue" stroke="#8884d8" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Bookings Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Booking Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={bookingData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="bookings" fill="#82ca9d" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Vehicle Type Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Vehicle Type Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={vehicleTypeData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {vehicleTypeData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Additional Metrics */}
        <Card>
          <CardHeader>
            <CardTitle>Key Performance Indicators</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Average Booking Value</span>
                <span className="font-medium">$150</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Booking Completion Rate</span>
                <span className="font-medium">95%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Customer Satisfaction</span>
                <span className="font-medium">4.8/5</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Vehicle Utilization</span>
                <span className="font-medium">78%</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Analytics; 