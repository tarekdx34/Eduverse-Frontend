import { useState } from 'react';
import { Cloud, Server, Database, DollarSign, Globe, TrendingDown, TrendingUp, Activity, Settings, Scale, Square, CheckCircle, AlertTriangle, MapPin } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const providers = ['All', 'AWS', 'Azure', 'GCP'] as const;
type Provider = typeof providers[number];

const costData = [
  { month: 'Sep', AWS: 1900, Azure: 1300, GCP: 600 },
  { month: 'Oct', AWS: 2000, Azure: 1350, GCP: 650 },
  { month: 'Nov', AWS: 1950, Azure: 1400, GCP: 680 },
  { month: 'Dec', AWS: 2100, Azure: 1500, GCP: 700 },
  { month: 'Jan', AWS: 2050, Azure: 1420, GCP: 710 },
  { month: 'Feb', AWS: 2100, Azure: 1450, GCP: 730 },
];

const services = [
  { name: 'EC2 Instances', provider: 'AWS', type: 'Compute', status: 'Running', cost: 850, usage: 78 },
  { name: 'S3 Storage', provider: 'AWS', type: 'Storage', status: 'Active', cost: 320, usage: 65 },
  { name: 'RDS Database', provider: 'AWS', type: 'Database', status: 'Running', cost: 580, usage: 82 },
  { name: 'Azure VMs', provider: 'Azure', type: 'Compute', status: 'Running', cost: 620, usage: 71 },
  { name: 'Blob Storage', provider: 'Azure', type: 'Storage', status: 'Active', cost: 280, usage: 55 },
  { name: 'Cloud Functions', provider: 'GCP', type: 'Serverless', status: 'Active', cost: 180, usage: 42 },
];

const providerCards = [
  { name: 'AWS', services: 8, cost: 2100, regions: 'us-east-1, eu-west-1', status: 'Healthy', color: 'orange' },
  { name: 'Azure', services: 6, cost: 1450, regions: 'eastus, westeurope', status: 'Healthy', color: 'blue' },
  { name: 'GCP', services: 4, cost: 730, regions: 'us-central1', status: 'Warning', color: 'red' },
];

const regions = [
  { name: 'US East (Virginia)', services: 8, cost: 1200, latency: 12 },
  { name: 'US Central', services: 3, cost: 450, latency: 18 },
  { name: 'EU West (Ireland)', services: 4, cost: 680, latency: 45 },
  { name: 'EU West (Netherlands)', services: 2, cost: 350, latency: 48 },
  { name: 'Asia Pacific (Tokyo)', services: 1, cost: 200, latency: 120 },
];

export function CloudServicesPage() {
  const { isDark, primaryHex } = useTheme() as any;
  const accentColor = primaryHex || '#3b82f6';
  const { t } = useLanguage();
  const [activeProvider, setActiveProvider] = useState<Provider>('All');

  const cardClass = `rounded-xl border shadow-sm p-6 ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`;
  const textPrimary = isDark ? 'text-white' : 'text-gray-900';
  const textSecondary = isDark ? 'text-gray-400' : 'text-gray-600';

  const filteredServices = activeProvider === 'All'
    ? services
    : services.filter(s => s.provider === activeProvider);

  const budget = 5000;
  const spent = 4280;
  const budgetPercent = (spent / budget) * 100;
  const budgetColor = budgetPercent > 95 ? 'bg-red-500' : budgetPercent > 80 ? 'bg-yellow-500' : 'bg-green-500';

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'Compute': return <Server className="w-4 h-4" />;
      case 'Storage': return <Cloud className="w-4 h-4" />;
      case 'Database': return <Database className="w-4 h-4" />;
      default: return <Activity className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className={`text-2xl font-bold ${textPrimary}`}>Cloud Services</h1>
          <p className={`mt-1 ${textSecondary}`}>Manage and monitor cloud infrastructure across providers</p>
        </div>
        <div className={`flex gap-1 p-1 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
          {providers.map(p => (
            <button
              key={p}
              onClick={() => setActiveProvider(p)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeProvider === p
                  ? 'bg-blue-600 text-white'
                  : isDark ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className={cardClass}>
          <div className="flex items-center gap-3 mb-2">
            <div className={`p-2 rounded-lg ${isDark ? 'bg-blue-900/50' : 'bg-blue-50'}`}>
              <Cloud className={`w-5 h-5 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} />
            </div>
            <p className={`text-sm ${textSecondary}`}>Total Services</p>
          </div>
          <p className={`text-3xl font-bold ${textPrimary}`}>18</p>
        </div>

        <div className={cardClass}>
          <div className="flex items-center gap-3 mb-2">
            <div className={`p-2 rounded-lg ${isDark ? 'bg-green-900/50' : 'bg-green-50'}`}>
              <DollarSign className={`w-5 h-5 ${isDark ? 'text-green-400' : 'text-green-600'}`} />
            </div>
            <p className={`text-sm ${textSecondary}`}>Monthly Cost</p>
          </div>
          <div className="flex items-center gap-2">
            <p className={`text-3xl font-bold ${textPrimary}`}>$4,280</p>
            <span className="flex items-center text-sm text-green-500">
              <TrendingDown className="w-4 h-4 mr-0.5" />-8%
            </span>
          </div>
        </div>

        <div className={cardClass}>
          <div className="flex items-center gap-3 mb-2">
            <div className={`p-2 rounded-lg ${isDark ? 'bg-blue-900/50' : 'bg-blue-50'}`}>
              <Activity className={`w-5 h-5 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} />
            </div>
            <p className={`text-sm ${textSecondary}`}>Uptime</p>
          </div>
          <p className={`text-3xl font-bold ${textPrimary}`}>99.97%</p>
        </div>

        <div className={cardClass}>
          <div className="flex items-center gap-3 mb-2">
            <div className={`p-2 rounded-lg ${isDark ? 'bg-blue-900/50' : 'bg-blue-50'}`}>
              <Globe className={`w-5 h-5 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} />
            </div>
            <p className={`text-sm ${textSecondary}`}>Regions</p>
          </div>
          <p className={`text-3xl font-bold ${textPrimary}`}>5</p>
        </div>
      </div>

      {/* Provider Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {providerCards.map(provider => {
          const isWarning = provider.status === 'Warning';
          const providerColorMap: Record<string, string> = {
            orange: isDark ? 'bg-orange-900/50 text-orange-400' : 'bg-orange-50 text-orange-600',
            blue: isDark ? 'bg-blue-900/50 text-blue-400' : 'bg-blue-50 text-blue-600',
            red: isDark ? 'bg-red-900/50 text-red-400' : 'bg-red-50 text-red-600',
          };
          return (
            <div key={provider.name} className={cardClass}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`p-3 rounded-lg ${providerColorMap[provider.color]}`}>
                    <Cloud className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className={`font-semibold ${textPrimary}`}>{provider.name}</h3>
                    <p className={`text-sm ${textSecondary}`}>{provider.services} services</p>
                  </div>
                </div>
                <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                  isWarning
                    ? isDark ? 'bg-yellow-500/20 text-yellow-300' : 'bg-yellow-100 text-yellow-700'
                    : isDark ? 'bg-green-500/20 text-green-300' : 'bg-green-100 text-green-700'
                }`}>
                  {isWarning ? <AlertTriangle className="w-3.5 h-3.5" /> : <CheckCircle className="w-3.5 h-3.5" />}
                  {provider.status}
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className={`text-sm ${textSecondary}`}>Monthly Cost</span>
                  <span className={`text-sm font-medium ${textPrimary}`}>${provider.cost.toLocaleString()}/mo</span>
                </div>
                <div className="flex justify-between">
                  <span className={`text-sm ${textSecondary}`}>Regions</span>
                  <span className={`text-sm font-medium ${textPrimary}`}>{provider.regions}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Cost Analytics */}
      <div className={cardClass}>
        <h2 className={`text-lg font-semibold mb-4 ${textPrimary}`}>Cost Analytics</h2>
        <ResponsiveContainer width="100%" height={320}>
          <BarChart data={costData}>
            <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#374151' : '#e5e7eb'} />
            <XAxis dataKey="month" stroke={isDark ? '#9ca3af' : '#6b7280'} />
            <YAxis stroke={isDark ? '#9ca3af' : '#6b7280'} tickFormatter={v => `$${v}`} />
            <Tooltip
              contentStyle={{
                backgroundColor: isDark ? '#1f2937' : '#fff',
                border: `1px solid ${isDark ? '#374151' : '#e5e7eb'}`,
                borderRadius: '0.5rem',
                color: isDark ? '#f3f4f6' : '#111827',
              }}
              formatter={(value: number) => [`$${value.toLocaleString()}`, undefined]}
            />
            <Bar dataKey="AWS" stackId="a" fill="#f97316" radius={[0, 0, 0, 0]} />
            <Bar dataKey="Azure" stackId="a" fill="#3b82f6" />
            <Bar dataKey="GCP" stackId="a" fill="#ef4444" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
        <div className="flex items-center justify-center gap-6 mt-4">
          <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-sm bg-orange-500" /> <span className={`text-sm ${textSecondary}`}>AWS</span></div>
          <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-sm bg-blue-500" /> <span className={`text-sm ${textSecondary}`}>Azure</span></div>
          <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-sm bg-red-500" /> <span className={`text-sm ${textSecondary}`}>GCP</span></div>
        </div>
      </div>

      {/* Services List */}
      <div className={cardClass}>
        <h2 className={`text-lg font-semibold mb-4 ${textPrimary}`}>Services</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className={`border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                <th className={`pb-3 text-left font-medium ${textSecondary}`}>Service</th>
                <th className={`pb-3 text-left font-medium ${textSecondary}`}>Provider</th>
                <th className={`pb-3 text-left font-medium ${textSecondary}`}>Type</th>
                <th className={`pb-3 text-left font-medium ${textSecondary}`}>Status</th>
                <th className={`pb-3 text-left font-medium ${textSecondary}`}>Cost/mo</th>
                <th className={`pb-3 text-left font-medium ${textSecondary}`}>Usage</th>
                <th className={`pb-3 text-right font-medium ${textSecondary}`}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredServices.map(service => (
                <tr key={service.name} className={`border-b last:border-0 ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                  <td className={`py-3 font-medium ${textPrimary}`}>
                    <div className="flex items-center gap-2">
                      {getTypeIcon(service.type)}
                      {service.name}
                    </div>
                  </td>
                  <td className={`py-3 ${textSecondary}`}>{service.provider}</td>
                  <td className={`py-3 ${textSecondary}`}>{service.type}</td>
                  <td className="py-3">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                      service.status === 'Running'
                        ? isDark ? 'bg-green-500/20 text-green-300' : 'bg-green-100 text-green-700'
                        : isDark ? 'bg-blue-500/20 text-blue-300' : 'bg-blue-100 text-blue-700'
                    }`}>
                      <CheckCircle className="w-3 h-3" />
                      {service.status}
                    </span>
                  </td>
                  <td className={`py-3 font-medium ${textPrimary}`}>${service.cost}</td>
                  <td className="py-3">
                    <div className="flex items-center gap-2 min-w-[120px]">
                      <div className={`flex-1 h-2 rounded-full ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`}>
                        <div
                          className={`h-2 rounded-full ${service.usage > 80 ? 'bg-orange-500' : 'bg-blue-500'}`}
                          style={{ width: `${service.usage}%` }}
                        />
                      </div>
                      <span className={`text-xs ${textSecondary}`}>{service.usage}%</span>
                    </div>
                  </td>
                  <td className="py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button className={`p-1.5 rounded-md transition-colors ${isDark ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-100 text-gray-500'}`} title="Scale">
                        <Scale className="w-4 h-4" />
                      </button>
                      <button className={`p-1.5 rounded-md transition-colors ${isDark ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-100 text-gray-500'}`} title="Stop">
                        <Square className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Budget Tracking */}
      <div className={cardClass}>
        <div className="flex items-center justify-between mb-4">
          <h2 className={`text-lg font-semibold ${textPrimary}`}>Budget Tracking</h2>
          <button className="px-4 py-2 rounded-lg bg-blue-600 hover:opacity-90 text-white text-sm font-medium transition-colors">
            Set Budget
          </button>
        </div>
        <div className="flex items-end justify-between mb-2">
          <div>
            <p className={`text-sm ${textSecondary}`}>Monthly Budget</p>
            <p className={`text-2xl font-bold ${textPrimary}`}>${spent.toLocaleString()} <span className={`text-base font-normal ${textSecondary}`}>/ ${budget.toLocaleString()}</span></p>
          </div>
          <span className={`text-sm font-medium ${budgetPercent > 95 ? 'text-red-500' : budgetPercent > 80 ? 'text-yellow-500' : 'text-green-500'}`}>
            {budgetPercent.toFixed(1)}%
          </span>
        </div>
        <div className={`w-full h-3 rounded-full ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`}>
          <div className={`h-3 rounded-full transition-all ${budgetColor}`} style={{ width: `${budgetPercent}%` }} />
        </div>
      </div>

      {/* Region Map */}
      <div className={cardClass}>
        <h2 className={`text-lg font-semibold mb-4 ${textPrimary}`}>Regions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {regions.map(region => (
            <div key={region.name} className={`rounded-lg border p-4 ${isDark ? 'border-gray-700 bg-gray-750' : 'border-gray-200 bg-gray-50'}`}>
              <div className="flex items-center gap-2 mb-3">
                <MapPin className={`w-4 h-4 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} />
                <h3 className={`font-medium ${textPrimary}`}>{region.name}</h3>
              </div>
              <div className="space-y-1.5">
                <div className="flex justify-between">
                  <span className={`text-sm ${textSecondary}`}>Services</span>
                  <span className={`text-sm font-medium ${textPrimary}`}>{region.services}</span>
                </div>
                <div className="flex justify-between">
                  <span className={`text-sm ${textSecondary}`}>Cost</span>
                  <span className={`text-sm font-medium ${textPrimary}`}>${region.cost.toLocaleString()}/mo</span>
                </div>
                <div className="flex justify-between">
                  <span className={`text-sm ${textSecondary}`}>Latency</span>
                  <span className={`text-sm font-medium ${region.latency > 100 ? 'text-yellow-500' : isDark ? 'text-green-400' : 'text-green-600'}`}>{region.latency}ms</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default CloudServicesPage;
