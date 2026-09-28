"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type StatusDataItem = {
  status: string;
  name: string;
  value: number;
};

type EmployeeWorkloadItem = {
  id: string;
  name: string;
  email: string;
  totalTasks: number;
  activeTasks: number;
  completedTasks: number;
  overdueTasks: number;
};

type ProjectProgressItem = {
  id: string;
  title: string;
  status: string;
  deadline: string;
  totalTasks: number;
  completedTasks: number;
  progress: number;
};

type TaskTrendItem = {
  date: string;
  label: string;
  created: number;
  completed: number;
};

type ReportChartsProps = {
  taskStatusData: StatusDataItem[];
  projectStatusData: StatusDataItem[];
  employeeWorkload: EmployeeWorkloadItem[];
  projectProgress: ProjectProgressItem[];
  taskTrend: TaskTrendItem[];
};

const TASK_STATUS_COLORS = {
  TODO: "#94a3b8",
  IN_PROGRESS: "#3b82f6",
  COMPLETED: "#10b981",
  CANCELLED: "#ef4444",
} as const;

const PROJECT_STATUS_COLORS = {
  PLANNED: "#94a3b8",
  IN_PROGRESS: "#3b82f6",
  COMPLETED: "#10b981",
  ARCHIVED: "#64748b",
} as const;

function formatNumber(
  value: number,
) {
  return value.toLocaleString(
    "fa-IR",
  );
}

function ChartTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{
    name?: string;
    value?: number | string;
  }>;
  label?: string;
}) {
  if (
    !active ||
    !payload ||
    payload.length === 0
  ) {
    return null;
  }

  return (
    <div className="rounded-2xl border border-white/70 bg-white/85 px-4 py-3 shadow-[0_18px_45px_rgba(15,23,42,0.14)] backdrop-blur-xl">
      {label ? (
        <p className="mb-2 text-xs font-bold text-slate-500">
          {label}
        </p>
      ) : null}

      <div className="space-y-1.5">
        {payload.map(
          (entry, index) => (
            <div
              key={`${entry.name ?? "value"}-${index}`}
              className="flex items-center justify-between gap-6 text-xs"
            >
              <span className="font-medium text-slate-500">
                {entry.name ??
                  "مقدار"}
              </span>

              <span className="font-extrabold text-slate-800">
                {formatNumber(
                  Number(
                    entry.value ??
                      0,
                  ),
                )}
              </span>
            </div>
          ),
        )}
      </div>
    </div>
  );
}

function ChartCard({
  title,
  description,
  children,
  className = "",
}: {
  title: string;
  description: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section
      className={`glass-card overflow-hidden rounded-[2rem] ${className}`}
    >
      <div className="border-b border-white/40 p-5 sm:p-6">
        <h2 className="text-lg font-extrabold text-slate-900">
          {title}
        </h2>

        <p className="mt-1 text-sm leading-6 text-slate-400">
          {description}
        </p>
      </div>

      <div className="p-4 sm:p-6">
        {children}
      </div>
    </section>
  );
}

export function ReportCharts({
  taskStatusData,
  projectStatusData,
  employeeWorkload,
  projectProgress,
  taskTrend,
}: ReportChartsProps) {
  return (
    <div className="space-y-6">
      <div className="grid gap-6 xl:grid-cols-2">
        <ChartCard
          title="توزیع وضعیت Taskها"
          description="وضعیت فعلی تمام Taskهای سیستم."
        >
          <div className="h-[310px] sm:h-[330px]">
            <ResponsiveContainer
              width="100%"
              height="100%"
            >
              <PieChart>
                <Pie
                  data={
                    taskStatusData
                  }
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="46%"
                  innerRadius="53%"
                  outerRadius="72%"
                  paddingAngle={3}
                  stroke="none"
                >
                  {taskStatusData.map(
                    (item) => (
                      <Cell
                        key={
                          item.status
                        }
                        fill={
                          TASK_STATUS_COLORS[
                            item.status as keyof typeof TASK_STATUS_COLORS
                          ] ??
                          "#94a3b8"
                        }
                      />
                    ),
                  )}
                </Pie>

                <Tooltip
                  content={
                    <ChartTooltip />
                  }
                />

                <Legend
                  verticalAlign="bottom"
                  height={30}
                  iconType="circle"
                  wrapperStyle={{
                    fontSize: 12,
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        <ChartCard
          title="وضعیت پروژه‌ها"
          description="تعداد پروژه‌ها بر اساس وضعیت."
        >
          <div className="h-[310px] sm:h-[330px]">
            <ResponsiveContainer
              width="100%"
              height="100%"
            >
              <PieChart>
                <Pie
                  data={
                    projectStatusData
                  }
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="46%"
                  innerRadius="53%"
                  outerRadius="72%"
                  paddingAngle={3}
                  stroke="none"
                >
                  {projectStatusData.map(
                    (item) => (
                      <Cell
                        key={
                          item.status
                        }
                        fill={
                          PROJECT_STATUS_COLORS[
                            item.status as keyof typeof PROJECT_STATUS_COLORS
                          ] ??
                          "#64748b"
                        }
                      />
                    ),
                  )}
                </Pie>

                <Tooltip
                  content={
                    <ChartTooltip />
                  }
                />

                <Legend
                  verticalAlign="bottom"
                  height={30}
                  iconType="circle"
                  wrapperStyle={{
                    fontSize: 12,
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>
      </div>

      <ChartCard
        title="روند ایجاد و تکمیل Task"
        description="تغییرات ۳۰ روز اخیر بر اساس تاریخ ایجاد و تکمیل Task."
      >
        <div className="h-[340px] sm:h-[370px]">
          <ResponsiveContainer
            width="100%"
            height="100%"
          >
            <LineChart
              data={taskTrend}
              margin={{
                top: 10,
                right: 8,
                left: 0,
                bottom: 5,
              }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#cbd5e1"
                vertical={false}
              />

              <XAxis
                dataKey="label"
                tick={{
                  fontSize: 11,
                  fill: "#64748b",
                }}
                axisLine={false}
                tickLine={false}
                interval="preserveStartEnd"
              />

              <YAxis
                allowDecimals={false}
                tick={{
                  fontSize: 11,
                  fill: "#64748b",
                }}
                axisLine={false}
                tickLine={false}
              />

              <Tooltip
                content={
                  <ChartTooltip />
                }
              />

              <Legend
                verticalAlign="top"
                align="right"
                height={34}
                iconType="circle"
                wrapperStyle={{
                  fontSize: 12,
                }}
              />

              <Line
                type="monotone"
                dataKey="created"
                name="ایجاد شده"
                stroke="#64748b"
                strokeWidth={2.5}
                dot={false}
                activeDot={{
                  r: 5,
                }}
              />

              <Line
                type="monotone"
                dataKey="completed"
                name="تکمیل شده"
                stroke="#10b981"
                strokeWidth={2.5}
                dot={false}
                activeDot={{
                  r: 5,
                }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </ChartCard>

      <ChartCard
        title="بار کاری کارمندان"
        description="مقایسه Taskهای فعال، تکمیل‌شده و عقب‌افتاده کارمندان فعال."
      >
        <div className="thin-scrollbar overflow-x-auto">
          <div className="h-[360px] min-w-[760px] sm:h-[390px]">
            <ResponsiveContainer
              width="100%"
              height="100%"
            >
              <BarChart
                data={
                  employeeWorkload
                }
                margin={{
                  top: 10,
                  right: 10,
                  left: 0,
                  bottom: 35,
                }}
                barGap={5}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#cbd5e1"
                  vertical={false}
                />

                <XAxis
                  dataKey="name"
                  angle={-12}
                  textAnchor="end"
                  interval={0}
                  height={55}
                  tick={{
                    fontSize: 11,
                    fill: "#64748b",
                  }}
                  axisLine={false}
                  tickLine={false}
                />

                <YAxis
                  allowDecimals={false}
                  tick={{
                    fontSize: 11,
                    fill: "#64748b",
                  }}
                  axisLine={false}
                  tickLine={false}
                />

                <Tooltip
                  content={
                    <ChartTooltip />
                  }
                />

                <Legend
                  verticalAlign="top"
                  align="right"
                  height={34}
                  iconType="circle"
                  wrapperStyle={{
                    fontSize: 12,
                  }}
                />

                <Bar
                  dataKey="activeTasks"
                  name="فعال"
                  fill="#3b82f6"
                  radius={[
                    7, 7, 0, 0,
                  ]}
                />

                <Bar
                  dataKey="completedTasks"
                  name="تکمیل شده"
                  fill="#10b981"
                  radius={[
                    7, 7, 0, 0,
                  ]}
                />

                <Bar
                  dataKey="overdueTasks"
                  name="عقب‌افتاده"
                  fill="#ef4444"
                  radius={[
                    7, 7, 0, 0,
                  ]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </ChartCard>

      <ChartCard
        title="پیشرفت پروژه‌های فعال"
        description="درصد Taskهای تکمیل‌شده در پروژه‌های فعال."
      >
        <div className="thin-scrollbar overflow-x-auto">
          <div className="h-[360px] min-w-[760px] sm:h-[390px]">
            <ResponsiveContainer
              width="100%"
              height="100%"
            >
              <BarChart
                data={
                  projectProgress
                }
                layout="vertical"
                margin={{
                  top: 10,
                  right: 20,
                  left: 20,
                  bottom: 10,
                }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#cbd5e1"
                  horizontal={false}
                />

                <XAxis
                  type="number"
                  domain={[0, 100]}
                  tick={{
                    fontSize: 11,
                    fill: "#64748b",
                  }}
                  axisLine={false}
                  tickLine={false}
                />

                <YAxis
                  type="category"
                  dataKey="title"
                  width={150}
                  tick={{
                    fontSize: 11,
                    fill: "#64748b",
                  }}
                  axisLine={false}
                  tickLine={false}
                />

                <Tooltip
                  content={
                    <ChartTooltip />
                  }
                />

                <Bar
                  dataKey="progress"
                  name="پیشرفت"
                  fill="#0f172a"
                  radius={[
                    0, 7, 7, 0,
                  ]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </ChartCard>
    </div>
  );
}