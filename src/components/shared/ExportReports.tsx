import { useState } from 'react';
import { Download, FileSpreadsheet, FileText, Loader2, Check, X } from 'lucide-react';

interface ExportableData {
  headers: string[];
  rows: (string | number)[][];
  title?: string;
  filename?: string;
}

interface ExportReportsProps {
  data: ExportableData;
  onExport?: (format: 'csv' | 'excel' | 'pdf', data: ExportableData) => Promise<void>;
  className?: string;
  showPreview?: boolean;
  allowedFormats?: ('csv' | 'excel' | 'pdf')[];
}

export function ExportReports({
  data,
  onExport,
  className = '',
  showPreview = true,
  allowedFormats = ['csv', 'excel', 'pdf'],
}: ExportReportsProps) {
  const [isExporting, setIsExporting] = useState<string | null>(null);
  const [exportSuccess, setExportSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const formatOptions = [
    {
      id: 'csv',
      label: 'CSV',
      description: 'Comma-separated values, compatible with Excel',
      icon: FileSpreadsheet,
      color: 'bg-green-100 text-green-600',
    },
    {
      id: 'excel',
      label: 'Excel',
      description: 'Microsoft Excel workbook format (.xlsx)',
      icon: FileSpreadsheet,
      color: 'bg-blue-100 text-blue-600',
    },
    {
      id: 'pdf',
      label: 'PDF',
      description: 'Portable Document Format for printing',
      icon: FileText,
      color: 'bg-red-100 text-red-600',
    },
  ].filter((f) => allowedFormats.includes(f.id as any));

  const exportToCSV = (exportData: ExportableData): void => {
    const { headers, rows, filename = 'export' } = exportData;

    const csvContent = [
      headers.join(','),
      ...rows.map((row) =>
        row.map((cell) => {
          const cellStr = String(cell);
          // Escape quotes and wrap in quotes if contains comma
          if (cellStr.includes(',') || cellStr.includes('"')) {
            return `"${cellStr.replace(/"/g, '""')}"`;
          }
          return cellStr;
        }).join(',')
      ),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    downloadBlob(blob, `${filename}.csv`);
  };

  const exportToExcel = async (exportData: ExportableData): Promise<void> => {
    // In a real implementation, use a library like xlsx or exceljs
    // For demo, we'll create a CSV with .xlsx extension (basic compatibility)
    const { headers, rows, filename = 'export' } = exportData;

    // Create tab-separated content (basic Excel compatibility)
    const content = [
      headers.join('\t'),
      ...rows.map((row) => row.map(String).join('\t')),
    ].join('\n');

    const blob = new Blob([content], { type: 'application/vnd.ms-excel' });
    downloadBlob(blob, `${filename}.xlsx`);
  };

  const exportToPDF = async (exportData: ExportableData): Promise<void> => {
    const { headers, rows, title = 'Report', filename = 'export' } = exportData;

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>${title}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            h1 { color: #1f2937; margin-bottom: 20px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th { background: #4f46e5; color: white; padding: 12px; text-align: left; }
            td { padding: 10px; border-bottom: 1px solid #e5e7eb; }
            tr:hover { background: #f9fafb; }
            .footer { margin-top: 30px; color: #6b7280; font-size: 12px; }
          </style>
        </head>
        <body>
          <h1>${title}</h1>
          <p>Generated on: ${new Date().toLocaleString()}</p>
          <table>
            <thead>
              <tr>
                ${headers.map((h) => `<th>${h}</th>`).join('')}
              </tr>
            </thead>
            <tbody>
              ${rows.map((row) => `<tr>${row.map((cell) => `<td>${cell}</td>`).join('')}</tr>`).join('')}
            </tbody>
          </table>
          <div class="footer">
            <p>Total Records: ${rows.length}</p>
            <p>EduVerse Report Export</p>
          </div>
        </body>
      </html>
    `;

    // Write content directly into the new window to avoid blob URL timing issues
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(htmlContent);
      printWindow.document.close();
      setTimeout(() => {
        printWindow.print();
      }, 250);
    }
  };

  const downloadBlob = (blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleExport = async (format: 'csv' | 'excel' | 'pdf') => {
    setIsExporting(format);
    setError(null);
    setExportSuccess(null);

    try {
      if (onExport) {
        await onExport(format, data);
      } else {
        // Default export implementations
        switch (format) {
          case 'csv':
            exportToCSV(data);
            break;
          case 'excel':
            await exportToExcel(data);
            break;
          case 'pdf':
            await exportToPDF(data);
            break;
        }
      }

      setExportSuccess(format);
      setTimeout(() => setExportSuccess(null), 3000);
    } catch (err) {
      setError(`Failed to export as ${format.toUpperCase()}`);
    } finally {
      setIsExporting(null);
    }
  };

  return (
    <div className={`bg-white rounded-xl border border-gray-200 ${className}`}>
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-100 rounded-lg">
            <Download className="text-indigo-600" size={20} />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">Export Report</h3>
            <p className="text-sm text-gray-600">
              Download your data in various formats
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {/* Data Preview */}
        {showPreview && (
          <div className="mb-6">
            <p className="text-sm font-medium text-gray-700 mb-3">Data Preview</p>
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <div className="overflow-x-auto max-h-48">
                <table className="min-w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      {data.headers.map((header, index) => (
                        <th
                          key={index}
                          className="px-4 py-2 text-left font-medium text-gray-700 border-b border-gray-200"
                        >
                          {header}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {data.rows.slice(0, 5).map((row, rowIndex) => (
                      <tr key={rowIndex} className="hover:bg-gray-50">
                        {row.map((cell, cellIndex) => (
                          <td
                            key={cellIndex}
                            className="px-4 py-2 text-gray-600 border-b border-gray-100"
                          >
                            {cell}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {data.rows.length > 5 && (
                <div className="px-4 py-2 bg-gray-50 text-sm text-gray-500 text-center border-t border-gray-200">
                  Showing 5 of {data.rows.length} records
                </div>
              )}
            </div>
          </div>
        )}

        {/* Export Options */}
        <div className="space-y-3">
          <p className="text-sm font-medium text-gray-700">Select Format</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {formatOptions.map((format) => (
              <button
                key={format.id}
                onClick={() => handleExport(format.id as any)}
                disabled={isExporting !== null}
                className={`
                  relative flex flex-col items-center p-4 border-2 rounded-xl transition-all
                  ${isExporting === format.id
                    ? 'border-indigo-500 bg-indigo-50'
                    : exportSuccess === format.id
                    ? 'border-green-500 bg-green-50'
                    : 'border-gray-200 hover:border-indigo-300 hover:bg-gray-50'
                  }
                  ${isExporting !== null && isExporting !== format.id ? 'opacity-50' : ''}
                `}
              >
                <div className={`p-3 rounded-lg mb-3 ${format.color}`}>
                  {isExporting === format.id ? (
                    <Loader2 size={24} className="animate-spin" />
                  ) : exportSuccess === format.id ? (
                    <Check size={24} className="text-green-600" />
                  ) : (
                    <format.icon size={24} />
                  )}
                </div>
                <span className="font-medium text-gray-900">{format.label}</span>
                <span className="text-xs text-gray-500 text-center mt-1">
                  {format.description}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mt-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm flex items-center gap-2">
            <X size={16} />
            <span>{error}</span>
            <button
              onClick={() => setError(null)}
              className="ml-auto p-1 hover:bg-red-100 rounded"
            >
              <X size={14} />
            </button>
          </div>
        )}

        {/* Success Message */}
        {exportSuccess && (
          <div className="mt-4 p-3 bg-green-50 text-green-700 rounded-lg text-sm flex items-center gap-2">
            <Check size={16} />
            <span>Successfully exported as {exportSuccess.toUpperCase()}</span>
          </div>
        )}

        {/* Info */}
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-600">
            <strong>Total Records:</strong> {data.rows.length}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            Export includes all {data.rows.length} records with {data.headers.length} columns
          </p>
        </div>
      </div>
    </div>
  );
}

export default ExportReports;
