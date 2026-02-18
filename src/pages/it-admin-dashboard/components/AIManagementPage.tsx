import { useState } from 'react';
import { Brain, Sparkles, DollarSign, TrendingUp, Settings, ToggleLeft, ToggleRight, BarChart3 } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';

interface AIManagementPageProps {
  aiModels: any[];
  onToggleModel: (id: number, enabled: boolean) => void;
  onUpdateModelSettings: (id: number, settings: any) => void;
}

export function AIManagementPage({ aiModels, onToggleModel, onUpdateModelSettings }: AIManagementPageProps) {
  const { isDark } = useTheme();
  const { t } = useLanguage();

  const totalCost = aiModels.reduce((sum, model) => {
    const cost = parseFloat(model.costPerRequest.replace('$', '')) * model.monthlyUsage;
    return sum + cost;
  }, 0);

  const totalUsage = aiModels.reduce((sum, model) => sum + model.monthlyUsage, 0);

  const getProviderColor = (provider: string) => {
    switch (provider) {
      case 'OpenAI': return isDark ? 'bg-green-900/30 text-green-400' : 'bg-green-50 text-green-700';
      case 'Google': return isDark ? 'bg-blue-900/30 text-blue-400' : 'bg-blue-50 text-blue-700';
      case 'Anthropic': return isDark ? 'bg-purple-900/30 text-purple-400' : 'bg-purple-50 text-purple-700';
      default: return isDark ? 'bg-gray-700 text-gray-400' : 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
          {t('aiManagement')}
        </h1>
        <p className={`mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
          {t('aiManagementDescription')}
        </p>
      </div>

      {/* AI Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className={`rounded-xl border p-6 ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
          <div className="flex items-center gap-3 mb-2">
            <div className={`p-2 rounded-lg ${isDark ? 'bg-purple-900/50' : 'bg-purple-50'}`}>
              <Brain className={`w-5 h-5 ${isDark ? 'text-purple-400' : 'text-purple-600'}`} />
            </div>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('activeModels')}</p>
          </div>
          <p className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            {aiModels.filter(m => m.status === 'active').length}
          </p>
        </div>

        <div className={`rounded-xl border p-6 ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
          <div className="flex items-center gap-3 mb-2">
            <div className={`p-2 rounded-lg ${isDark ? 'bg-cyan-900/50' : 'bg-cyan-50'}`}>
              <Sparkles className={`w-5 h-5 ${isDark ? 'text-cyan-400' : 'text-cyan-600'}`} />
            </div>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('totalRequests')}</p>
          </div>
          <p className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            {(totalUsage / 1000).toFixed(0)}K
          </p>
        </div>

        <div className={`rounded-xl border p-6 ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
          <div className="flex items-center gap-3 mb-2">
            <div className={`p-2 rounded-lg ${isDark ? 'bg-green-900/50' : 'bg-green-50'}`}>
              <DollarSign className={`w-5 h-5 ${isDark ? 'text-green-400' : 'text-green-600'}`} />
            </div>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('monthlyCost')}</p>
          </div>
          <p className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            ${totalCost.toFixed(0)}
          </p>
        </div>

        <div className={`rounded-xl border p-6 ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
          <div className="flex items-center gap-3 mb-2">
            <div className={`p-2 rounded-lg ${isDark ? 'bg-orange-900/50' : 'bg-orange-50'}`}>
              <TrendingUp className={`w-5 h-5 ${isDark ? 'text-orange-400' : 'text-orange-600'}`} />
            </div>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('avgCostPerRequest')}</p>
          </div>
          <p className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            ${(totalCost / totalUsage).toFixed(4)}
          </p>
        </div>
      </div>

      {/* AI Models List */}
      <div className={`rounded-xl border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
        <div className={`p-6 border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
          <h2 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            {t('aiModelsConfig')}
          </h2>
        </div>
        <div className="divide-y ${isDark ? 'divide-gray-700' : 'divide-gray-200'}">
          {aiModels.map((model) => (
            <div key={model.id} className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <div className={`p-3 rounded-xl ${isDark ? 'bg-purple-900/30' : 'bg-purple-50'}`}>
                    <Brain className={`w-6 h-6 ${isDark ? 'text-purple-400' : 'text-purple-600'}`} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {model.name}
                      </h3>
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${getProviderColor(model.provider)}`}>
                        {model.provider}
                      </span>
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                        model.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                      }`}>
                        {model.status}
                      </span>
                    </div>
                    <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                      {t('purpose')}: {model.purpose}
                    </p>
                    <div className="flex items-center gap-6 mt-3">
                      <div>
                        <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{t('costPerRequest')}</p>
                        <p className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                          {model.costPerRequest}
                        </p>
                      </div>
                      <div>
                        <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{t('monthlyUsage')}</p>
                        <p className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                          {model.monthlyUsage.toLocaleString()} {t('requests')}
                        </p>
                      </div>
                      <div>
                        <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{t('monthlyCost')}</p>
                        <p className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                          ${(parseFloat(model.costPerRequest.replace('$', '')) * model.monthlyUsage).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    className={`p-2 rounded-lg transition-colors ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                    title={t('settings')}
                  >
                    <Settings className={`w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                  </button>
                  <button
                    onClick={() => onToggleModel(model.id, model.status !== 'active')}
                    className={`p-1 ${model.status === 'active' ? 'text-cyan-500' : 'text-gray-400'}`}
                  >
                    {model.status === 'active' ? (
                      <ToggleRight className="w-10 h-6" />
                    ) : (
                      <ToggleLeft className="w-10 h-6" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Usage Chart Placeholder */}
      <div className={`rounded-xl border p-6 ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
        <h2 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
          {t('aiUsageTrends')}
        </h2>
        <div className={`h-64 flex items-center justify-center ${isDark ? 'bg-gray-700/50' : 'bg-gray-50'} rounded-lg`}>
          <div className="text-center">
            <BarChart3 className={`w-12 h-12 mx-auto mb-2 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
            <p className={`${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              {t('aiUsageAnalyticsPlaceholder')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AIManagementPage;
