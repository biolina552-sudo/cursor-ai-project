"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export function RevenueChart({
  data,
  locale,
}: {
  data: { day: string; revenue: number; orders: number }[];
  locale: string;
}) {
  return (
    <div className="h-[340px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ left: 0, right: 12, top: 12, bottom: 0 }}>
          <defs>
            <linearGradient id="goldRevenue" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#d9ad51" stopOpacity={0.55} />
              <stop offset="95%" stopColor="#d9ad51" stopOpacity={0.03} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#eee3cf" />
          <XAxis dataKey="day" stroke="#8f8069" tickLine={false} axisLine={false} />
          <YAxis
            stroke="#8f8069"
            tickLine={false}
            axisLine={false}
            tickFormatter={(value) =>
              new Intl.NumberFormat(locale === "ar" ? "ar" : "en", {
                notation: "compact",
              }).format(Number(value))
            }
          />
          <Tooltip
            contentStyle={{
              borderRadius: 18,
              border: "1px solid #eadfc8",
              boxShadow: "0 18px 40px rgba(0,0,0,.12)",
            }}
            formatter={(value, name) => [
              name === "revenue" ? `$${Number(value).toLocaleString()}` : value,
              name,
            ]}
          />
          <Area
            type="monotone"
            dataKey="revenue"
            stroke="#b9872b"
            strokeWidth={3}
            fill="url(#goldRevenue)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
