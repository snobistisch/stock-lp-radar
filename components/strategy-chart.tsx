"use client";

import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

const data = [
  { name: "Stock/USDG", planning: 70, observed: 124 },
  { name: "Stock/WETH", planning: 110, observed: 295 },
  { name: "Pure meme", planning: 650, observed: 2400 },
];

export function StrategyChart() {
  return (
    <div className="h-64 w-full" aria-label="Vergelijking van bruto fee-APR-ranges">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 12, right: 8, left: -18, bottom: 0 }}>
          <CartesianGrid stroke="rgba(255,255,255,.06)" vertical={false} />
          <XAxis dataKey="name" stroke="#7f8985" fontSize={11} tickLine={false} axisLine={false} />
          <YAxis stroke="#7f8985" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => `${v}%`} />
          <Tooltip
            cursor={{ fill: "rgba(255,255,255,.03)" }}
            contentStyle={{ background: "#0d1210", border: "1px solid #26302b", borderRadius: 10 }}
            formatter={(value) => [`${Number(value)}%`, "Bruto fee-APR"]}
          />
          <Bar dataKey="observed" radius={[5, 5, 0, 0]}>
            {data.map((entry, index) => <Cell key={entry.name} fill={index === 2 ? "#ff7067" : index === 1 ? "#ffb433" : "#a6ff00"} />)}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
