"use client";

import React from "react";
import { ListTodo, CheckCircle2, Clock, AlertTriangle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface DepartmentStatsProps {
  total: number;
  underReview: number;
  inProgress: number;
  resolved: number;
}

export function DepartmentStats({
  total,
  underReview,
  inProgress,
  resolved,
}: DepartmentStatsProps): JSX.Element {
  const stats = [
    {
      title: "Total Dispatches",
      value: total,
      icon: ListTodo,
      color: "text-blue-400 border-blue-500/10 bg-blue-500/5",
    },
    {
      title: "Under Review",
      value: underReview,
      icon: Clock,
      color: "text-purple-400 border-purple-500/10 bg-purple-500/5",
    },
    {
      title: "In Progress",
      value: inProgress,
      icon: AlertTriangle,
      color: "text-amber-400 border-amber-500/10 bg-amber-500/5",
    },
    {
      title: "Resolved",
      value: resolved,
      icon: CheckCircle2,
      color: "text-emerald-400 border-emerald-500/10 bg-emerald-500/5",
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {stats.map((stat, idx) => {
        const Icon = stat.icon;
        return (
          <Card key={idx} glass className={stat.color}>
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-[10px] uppercase font-mono tracking-wider text-slate-500">
                  {stat.title}
                </p>
                <h3 className="text-xl sm:text-2xl font-black mt-1 text-white leading-none">
                  {stat.value}
                </h3>
              </div>
              <div className="p-2 bg-slate-950/40 rounded-lg border border-slate-800/40">
                <Icon className="w-5 h-5 shrink-0" />
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
