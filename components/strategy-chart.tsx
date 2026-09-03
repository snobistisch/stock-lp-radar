"use client";

import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

const data = [
  { name: "Stock/USDG", planning: 70, observed: 124 },
  { name: "Stock/WETH", planning: 110, observed: 295 },
  { name: "Pure meme", planning: 650, observed: 2400 },
];

export function StrategyChart() {
  return (
    <div className="h-64 w-full" aria-label="Gross fee APR range comparison">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 12, right: 8, left: -18, bottom: 0 }}>
          <CartesianGrid stroke="rgba(255,142,0,.12)" vertical={false} strokeDasharray="2 2" />
          <XAxis dataKey="name" stroke="#8f887b" fontSize={10} tickLine={false} axisLine={false} />
          <YAxis stroke="#8f887b" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(v) => `${v}%`} />
          <Tooltip
            cursor={{ fill: "rgba(255,255,255,.03)" }}
            contentStyle={{ background: "#050505", border: "1px solid #ff8e00", borderRadius: 0, fontFamily: "monospace", fontSize: 11 }}
            formatter={(value) => [`${Number(value)}%`, "Gross fee APR"]}
          />
          <Bar dataKey="observed" radius={[5, 5, 0, 0]}>
            {data.map((entry, index) => <Cell key={entry.name} fill={index === 2 ? "#ff4b45" : index === 1 ? "#42d7ff" : "#39ff68"} />)}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
