import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';

const SupplierExtractor = () => {
  const [files, setFiles] = useState([]);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const apiKey = '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';

  const handleFileUpload = (event) => {
    setFiles(Array.from(event.target.files));
    setError('');
  };

  const processFiles = async () => {
    if (!apiKey) {
      setError('Please enter your OpenAI API key');
      return;
    }

    setLoading(true);
    setError('');
    const processed = [];

    try {
      for (const file of files) {
        const content = await readFile(file);
        const prompt = `Extract supplier information from this ${file.type} content. 
                       Return a JSON object with: supplier name, contact details, product listings, pricing.
                       Content: ${content}`;

        const response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
          },
          body: JSON.stringify({
            model: 'gpt-4',
            messages: [{
              role: 'user',
              content: prompt
            }],
            temperature: 0.7
          })
        });

        if (!response.ok) {
          throw new Error('OpenAI API request failed');
        }

        const data = await response.json();
        const result = JSON.parse(data.choices[0].message.content);
        processed.push({
          filename: file.name,
          ...result
        });
      }

      setResults(processed);
    } catch (err) {
      setError(`Error processing files: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const readFile = async (file) => {
    if (file.type === 'application/pdf') {
      // Implement PDF reading logic
      return 'PDF content';
    } else if (file.type.includes('spreadsheet') || file.type.includes('excel')) {
      const buffer = await file.arrayBuffer();
      const workbook = XLSX.read(buffer);
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      return XLSX.utils.sheet_to_csv(worksheet);
    }
    return '';
  };

  const exportResults = () => {
    const ws = XLSX.utils.json_to_sheet(results);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Extracted Data");
    XLSX.writeFile(wb, "supplier_data.xlsx");
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>Supplier Information Extractor</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
    

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Upload Files (PDF/Excel)
            </label>
            <input
              type="file"
              multiple
              accept=".pdf,.xlsx,.xls"
              onChange={handleFileUpload}
              className="mt-1 block w-full"
            />
          </div>

          <div className="flex space-x-4">
            <button
              onClick={processFiles}
              disabled={loading || !files.length}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Processing...' : 'Process Files'}
            </button>
            {results.length > 0 && (
              <button
                onClick={exportResults}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
              >
                Export Results
              </button>
            )}
          </div>

          {error && (
            <div className="text-red-600 text-sm">{error}</div>
          )}

          {results.length > 0 && (
            <div className="mt-6">
              <h3 className="text-lg font-medium">Results</h3>
              <div className="mt-2 overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      {Object.keys(results[0]).map(header => (
                        <th
                          key={header}
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          {header}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {results.map((row, idx) => (
                      <tr key={idx}>
                        {Object.entries(row).map(([key, value]) => (
                          <td
                            key={key}
                            className="px-6 py-4 whitespace-nowrap text-sm text-gray-500"
                          >
                            {JSON.stringify(value)}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default SupplierExtractor;
