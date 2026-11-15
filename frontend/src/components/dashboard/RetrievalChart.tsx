import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { Card, CardHeader, CardContent } from '../ui/Card';

const benchmarkData = [
  {
    name: 'FAISS Dense',
    'Recall@3': 1.0,
    MRR: 1.0,
    'Hit Rate@3': 1.0,
  },
  {
    name: 'BM25 Sparse',
    'Recall@3': 0.8,
    MRR: 0.7,
    'Hit Rate@3': 0.8,
  },
  {
    name: 'Hybrid RRF 1:1',
    'Recall@3': 1.0,
    MRR: 0.8667,
    'Hit Rate@3': 1.0,
  },
];

export const RetrievalChart: React.FC = () => {
  return (
    <Card className="mb-6">
      <CardHeader
        title="Retrieval Benchmark Performance (Canonical Benchmark)"
        description="Historical benchmark comparison across dense vector search, BM25 sparse search, and reciprocal rank fusion (RRF k=60)."
      />
      <CardContent>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={benchmarkData}
              margin={{ top: 10, right: 30, left: 0, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} />
              <YAxis
                stroke="#64748b"
                fontSize={12}
                domain={[0, 1.1]}
                tickLine={false}
                tickFormatter={(v) => v.toFixed(1)}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#ffffff',
                  borderColor: '#e2e8f0',
                  borderRadius: '0.5rem',
                  fontSize: '12px',
                  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                }}
              />
              <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
              <Bar dataKey="Recall@3" fill="#4f46e5" radius={[4, 4, 0, 0]} />
              <Bar dataKey="MRR" fill="#059669" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Hit Rate@3" fill="#0284c7" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};
