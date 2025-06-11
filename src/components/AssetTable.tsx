import { useState } from 'react';
import type { Asset } from '../types';

interface AssetTableProps {
  assets: Asset[];
}

const AssetTable = ({ assets }: AssetTableProps) => {
  const [sortColumn, setSortColumn] = useState<keyof Asset>('purchaseDate');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  const handleSort = (column: keyof Asset) => {
    setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    setSortColumn(column);
  };

  const sortedAssets = [...assets].sort((a, b) => {
    if (sortDirection === 'asc') {
      return a[sortColumn] > b[sortColumn] ? 1 : -1;
    }
    return a[sortColumn] < b[sortColumn] ? 1 : -1;
  });

  return (
    <div className="overflow-x-auto rounded-lg shadow-lg">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            {['Type', 'Weight (g)', 'Purchase Date', 'Purchase Price', 'Current Value', 'Profit'].map((header) => (
              <th
                key={header}
                onClick={() => handleSort(header.toLowerCase().replace(' ', '') as keyof Asset)}
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider 
                  cursor-pointer hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center space-x-1">
                  <span>{header}</span>
                  {sortColumn === header.toLowerCase().replace(' ', '') && (
                    <span>{sortDirection === 'asc' ? '↑' : '↓'}</span>
                  )}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {sortedAssets.map((asset, idx) => (
            <tr 
              key={idx}
              className="hover:bg-gray-50 transition-colors"
            >
              <td className="px-6 py-4 whitespace-nowrap">{asset.type}</td>
              <td className="px-6 py-4 whitespace-nowrap">{asset.weight}</td>
              <td className="px-6 py-4 whitespace-nowrap">
                {new Date(asset.purchaseDate).toLocaleDateString()}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                ₹{asset.purchasePrice.toLocaleString()}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                ₹{asset.currentValue.toLocaleString()}
              </td>
              <td className={`px-6 py-4 whitespace-nowrap font-medium
                ${asset.currentValue - asset.purchasePrice > 0 
                  ? 'text-green-600' 
                  : 'text-red-600'
                }`}>
                ₹{(asset.currentValue - asset.purchasePrice).toLocaleString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AssetTable;