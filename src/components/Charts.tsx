import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { MonthlyProgress } from '@/types/hafalan';
import { motion } from 'framer-motion';

interface ProgressChartProps {
  data: MonthlyProgress[];
}

const COLORS = ['#064E3B', '#047857', '#059669', '#10B981', '#34D399'];

export function MonthlyProgressChart({ data }: ProgressChartProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="rounded-xl border bg-card p-6"
    >
      <h3 className="font-serif text-lg font-semibold mb-4">
        Progress Hafalan Bulanan
      </h3>
      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
            <XAxis
              dataKey="bulan"
              tick={{ fontSize: 12 }}
              tickLine={false}
            />
            <YAxis tick={{ fontSize: 12 }} tickLine={false} />
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(40 33% 99%)',
                border: '1px solid hsl(150 20% 85%)',
                borderRadius: '8px',
              }}
            />
            <Legend />
            <Bar
              dataKey="totalHalaman"
              name="Total Halaman"
              fill="hsl(163 78% 17%)"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
}

interface MusyrifChartProps {
  data: {
    musyrif: string;
    totalHafalan: string;
    jumlahSantri: number;
  }[];
}

export function MusyrifChart({ data }: MusyrifChartProps) {
  const chartData = data.map((d) => ({
    ...d,
    totalHafalan: parseFloat(d.totalHafalan),
  }));

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className="rounded-xl border bg-card p-6"
    >
      <h3 className="font-serif text-lg font-semibold mb-4">
        Hafalan per Musyrif
      </h3>
      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
            <XAxis type="number" tick={{ fontSize: 12 }} />
            <YAxis
              dataKey="musyrif"
              type="category"
              tick={{ fontSize: 11 }}
              width={120}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(40 33% 99%)',
                border: '1px solid hsl(150 20% 85%)',
                borderRadius: '8px',
              }}
            />
            <Bar
              dataKey="totalHafalan"
              name="Total Hafalan (Juz)"
              fill="hsl(43 74% 49%)"
              radius={[0, 4, 4, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
}

interface StatusChartProps {
  tercapai: number;
  tidakTercapai: number;
}

export function StatusPieChart({ tercapai, tidakTercapai }: StatusChartProps) {
  const data = [
    { name: 'Tercapai', value: tercapai },
    { name: 'Tidak Tercapai', value: tidakTercapai },
  ];

  const COLORS_PIE = ['#059669', '#F59E0B'];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.4 }}
      className="rounded-xl border bg-card p-6"
    >
      <h3 className="font-serif text-lg font-semibold mb-4">
        Status Pencapaian Target
      </h3>
      <div className="h-[250px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={80}
              paddingAngle={5}
              dataKey="value"
              label={({ name, percent }) =>
                `${name} ${(percent * 100).toFixed(0)}%`
              }
              labelLine={false}
            >
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS_PIE[index % COLORS_PIE.length]}
                />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(40 33% 99%)',
                border: '1px solid hsl(150 20% 85%)',
                borderRadius: '8px',
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="flex justify-center gap-6 mt-4">
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-full bg-emerald-600" />
          <span className="text-sm text-muted-foreground">
            Tercapai ({tercapai})
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-full bg-amber-500" />
          <span className="text-sm text-muted-foreground">
            Tidak Tercapai ({tidakTercapai})
          </span>
        </div>
      </div>
    </motion.div>
  );
}

interface TrendChartProps {
  data: MonthlyProgress[];
}

export function TrendLineChart({ data }: TrendChartProps) {
  const avgData = data.map((d) => ({
    ...d,
    rataRata: d.jumlahSantri > 0 ? (d.totalHalaman / d.jumlahSantri).toFixed(1) : 0,
  }));

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.5 }}
      className="rounded-xl border bg-card p-6"
    >
      <h3 className="font-serif text-lg font-semibold mb-4">
        Tren Rata-rata Hafalan
      </h3>
      <div className="h-[250px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={avgData}>
            <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
            <XAxis dataKey="bulan" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(40 33% 99%)',
                border: '1px solid hsl(150 20% 85%)',
                borderRadius: '8px',
              }}
            />
            <Line
              type="monotone"
              dataKey="rataRata"
              name="Rata-rata per Santri"
              stroke="hsl(163 78% 17%)"
              strokeWidth={3}
              dot={{ fill: 'hsl(43 74% 49%)', strokeWidth: 2 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
}
