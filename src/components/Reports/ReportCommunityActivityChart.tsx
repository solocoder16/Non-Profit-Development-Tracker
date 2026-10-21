import React, { useState, useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { CommunityReport } from '../../types';
import {
  BarChart3,
  MapPin,
  Flame,
  Activity,
  Layers,
  Filter,
  X,
  ChevronDown,
  ChevronUp,
  TrendingUp,
  AlertCircle,
  Sparkles,
} from 'lucide-react';

interface ReportCommunityActivityChartProps {
  reports: CommunityReport[];
  selectedCommunity: string | null;
  onSelectCommunity: (community: string | null) => void;
  knownCommunities?: string[];
}

export interface CommunityActivityData {
  community: string;
  shortName: string;
  total: number;
  cva: number;
  eie: number;
  integrated: number;
  latestDate: string;
  activityLevel: 'High Activity' | 'Moderate Activity' | 'Emerging Activity';
}

export const ReportCommunityActivityChart: React.FC<ReportCommunityActivityChartProps> = ({
  reports,
  selectedCommunity,
  onSelectCommunity,
  knownCommunities = [],
}) => {
  const [chartMode, setChartMode] = useState<'stacked' | 'total'>('stacked');
  const [orientation, setOrientation] = useState<'horizontal' | 'vertical'>('vertical');
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Group reports by community area
  const { data, highActivityZones, stats } = useMemo(() => {
    const map = new Map<
      string,
      {
        total: number;
        cva: number;
        eie: number;
        integrated: number;
        latestDate: string;
      }
    >();

    reports.forEach((report) => {
      // Clean up / normalize location
      const loc = (report.location || 'Unspecified Community').trim();
      const current = map.get(loc) || {
        total: 0,
        cva: 0,
        eie: 0,
        integrated: 0,
        latestDate: report.date || '',
      };

      current.total += 1;
      if (report.program === 'cva') current.cva += 1;
      else if (report.program === 'eie') current.eie += 1;
      else current.integrated += 1;

      if (!current.latestDate || (report.date && report.date > current.latestDate)) {
        current.latestDate = report.date;
      }

      map.set(loc, current);
    });

    // Also include any known communities that currently have 0 reports if list is small
    knownCommunities.forEach((comm) => {
      if (!map.has(comm)) {
        map.set(comm, { total: 0, cva: 0, eie: 0, integrated: 0, latestDate: 'No dispatches yet' });
      }
    });

    const maxCount = Math.max(...Array.from(map.values()).map((v) => v.total), 1);

    const formattedList: CommunityActivityData[] = Array.from(map.entries())
      .map(([community, val]) => {
        // Derive clean short name for axis display
        let shortName = community;
        if (community.includes(',')) {
          const parts = community.split(',');
          shortName = parts[0].trim();
        } else if (community.length > 22) {
          shortName = community.slice(0, 20) + '…';
        }

        let activityLevel: 'High Activity' | 'Moderate Activity' | 'Emerging Activity' = 'Emerging Activity';
        if (val.total >= Math.max(3, Math.ceil(maxCount * 0.7))) {
          activityLevel = 'High Activity';
        } else if (val.total >= 2) {
          activityLevel = 'Moderate Activity';
        }

        return {
          community,
          shortName,
          total: val.total,
          cva: val.cva,
          eie: val.eie,
          integrated: val.integrated,
          latestDate: val.latestDate,
          activityLevel,
        };
      })
      .sort((a, b) => b.total - a.total || a.community.localeCompare(b.community));

    const highZones = formattedList.filter((item) => item.total > 0 && item.activityLevel === 'High Activity');
    const coveredCount = formattedList.filter((item) => item.total > 0).length;

    return {
      data: formattedList,
      highActivityZones: highZones,
      stats: {
        totalReports: reports.length,
        coveredZones: coveredCount,
        maxCount,
        topZone: formattedList[0]?.total > 0 ? formattedList[0] : null,
      },
    };
  }, [reports, knownCommunities]);

  // Custom Recharts Tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const item: CommunityActivityData = payload[0].payload;
      const isSelected = selectedCommunity === item.community;

      return (
        <div className="bg-slate-900 text-white p-3.5 rounded-xl shadow-xl border border-slate-700 text-xs min-w-[220px] max-w-[280px] pointer-events-none z-50">
          <div className="flex items-start justify-between gap-2 mb-2 pb-2 border-b border-slate-800">
            <div>
              <span className="font-bold text-slate-100 text-sm block leading-snug">
                {item.community}
              </span>
              <span className="text-[10px] text-slate-400">
                Latest: {item.latestDate || 'N/A'}
              </span>
            </div>
            <span
              className={`text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded ${
                item.activityLevel === 'High Activity'
                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                  : item.activityLevel === 'Moderate Activity'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  : 'bg-slate-800 text-slate-300 border border-slate-700'
              }`}
            >
              {item.activityLevel}
            </span>
          </div>

          <div className="space-y-1.5 font-medium">
            <div className="flex justify-between items-center text-slate-300">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-slate-100 inline-block" />
                Total Dispatches:
              </span>
              <span className="font-bold text-white text-sm">{item.total}</span>
            </div>

            <div className="flex justify-between items-center text-slate-300 pl-4 text-[11px]">
              <span className="flex items-center gap-1.5 text-emerald-300">
                <span className="w-2 h-2 rounded-sm bg-emerald-500 inline-block" />
                Citizen Voice &amp; Action (CVA):
              </span>
              <span className="font-semibold text-emerald-200">{item.cva}</span>
            </div>

            <div className="flex justify-between items-center text-slate-300 pl-4 text-[11px]">
              <span className="flex items-center gap-1.5 text-indigo-300">
                <span className="w-2 h-2 rounded-sm bg-indigo-500 inline-block" />
                Education in Emergencies (EiE):
              </span>
              <span className="font-semibold text-indigo-200">{item.eie}</span>
            </div>

            {item.integrated > 0 && (
              <div className="flex justify-between items-center text-slate-300 pl-4 text-[11px]">
                <span className="flex items-center gap-1.5 text-amber-300">
                  <span className="w-2 h-2 rounded-sm bg-amber-500 inline-block" />
                  Integrated / Relief:
                </span>
                <span className="font-semibold text-amber-200">{item.integrated}</span>
              </div>
            )}
          </div>

          <div className="mt-2.5 pt-2 border-t border-slate-800 text-[10px] text-slate-400 flex items-center justify-between">
            <span>{isSelected ? 'Currently filtered' : 'Click bar to filter list'}</span>
            <span className="text-emerald-400 font-semibold">Interactive</span>
          </div>
        </div>
      );
    }
    return null;
  };

  const handleBarClick = (entry: any) => {
    if (!entry) return;
    const commName = entry.community;
    if (selectedCommunity === commName) {
      onSelectCommunity(null); // toggle off
    } else {
      onSelectCommunity(commName);
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden transition-all no-print">
      
      {/* Top Banner & KPI Strip */}
      <div className="p-5 sm:p-6 border-b border-slate-200 bg-gradient-to-r from-slate-50 via-white to-emerald-50/30">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2 py-0.5 rounded-md text-[10px] font-black tracking-wider uppercase bg-emerald-100 text-emerald-800 border border-emerald-200">
                Spatial Density Analytics
              </span>
              <span className="text-xs text-slate-400">·</span>
              <span className="text-xs font-semibold text-slate-500">
                {stats.coveredZones} Covered Communities
              </span>
            </div>

            <div className="flex items-center gap-2">
              <h2 className="text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-emerald-600" />
                <span>Field Reports per Community Area</span>
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-1 max-w-2xl">
              Identify high-activity zones, monitoring gaps, and compare CVA social accountability vs. EiE emergency response deployments.
            </p>
          </div>

          {/* Quick Metrics Badges */}
          <div className="flex flex-wrap items-center gap-3">
            {stats.topZone && (
              <div className="flex items-center gap-2 px-3 py-2 bg-rose-50 border border-rose-200 rounded-xl">
                <div className="w-7 h-7 rounded-lg bg-rose-500 text-white flex items-center justify-center shrink-0">
                  <Flame className="w-4 h-4 animate-pulse" />
                </div>
                <div>
                  <span className="text-[10px] font-bold text-rose-800 uppercase block tracking-wider leading-none">
                    High-Activity Zone
                  </span>
                  <span className="text-xs font-black text-slate-800 block truncate max-w-[170px]" title={stats.topZone.community}>
                    {stats.topZone.shortName} ({stats.topZone.total})
                  </span>
                </div>
              </div>
            )}

            <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl">
              <div className="w-7 h-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0">
                <Activity className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-500 uppercase block tracking-wider leading-none">
                  Total Dispatches
                </span>
                <span className="text-xs font-black text-slate-900 block">
                  {stats.totalReports} Reports
                </span>
              </div>
            </div>

            {/* Collapse / Expand Button */}
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
              title={isCollapsed ? 'Expand analytics chart' : 'Collapse analytics chart'}
              aria-label={isCollapsed ? 'Expand analytics chart' : 'Collapse analytics chart'}
            >
              {isCollapsed ? <ChevronDown className="w-5 h-5" /> : <ChevronUp className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* High-Activity Quick Filter Chips */}
        {highActivityZones.length > 0 && !isCollapsed && (
          <div className="flex flex-wrap items-center gap-2 mt-4 pt-3 border-t border-slate-200/80">
            <span className="text-[11px] font-bold text-slate-600 flex items-center gap-1 mr-1">
              <TrendingUp className="w-3.5 h-3.5 text-rose-500" />
              <span>Priority Activity Zones:</span>
            </span>
            {highActivityZones.map((zone) => {
              const isSelected = selectedCommunity === zone.community;
              return (
                <button
                  key={zone.community}
                  onClick={() => onSelectCommunity(isSelected ? null : zone.community)}
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-rose-600 text-white shadow-xs scale-102'
                      : 'bg-white border border-rose-200 text-rose-800 hover:bg-rose-50'
                  }`}
                  title={`Filter reports to ${zone.community} (${zone.total} dispatches)`}
                >
                  <MapPin className="w-3 h-3" />
                  <span>{zone.shortName}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                      isSelected ? 'bg-rose-700 text-white' : 'bg-rose-100 text-rose-700 font-extrabold'
                    }`}
                  >
                    {zone.total}
                  </span>
                </button>
              );
            })}

            {selectedCommunity && (
              <button
                onClick={() => onSelectCommunity(null)}
                className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-500 hover:text-slate-800 ml-2 cursor-pointer underline"
              >
                <X className="w-3 h-3" />
                <span>Reset Community Filter</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* Main Chart Body */}
      {!isCollapsed && (
        <div className="p-5 sm:p-6 space-y-4">
          
          {/* Controls Bar: Mode & Orientation Switchers */}
          <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-500">Display:</span>
              <div className="inline-flex rounded-lg bg-slate-100 p-0.5 border border-slate-200">
                <button
                  type="button"
                  onClick={() => setChartMode('stacked')}
                  className={`px-2.5 py-1 font-bold rounded-md transition-all cursor-pointer ${
                    chartMode === 'stacked'
                      ? 'bg-white text-emerald-800 shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Stacked by Sector (CVA vs EiE)
                </button>
                <button
                  type="button"
                  onClick={() => setChartMode('total')}
                  className={`px-2.5 py-1 font-bold rounded-md transition-all cursor-pointer ${
                    chartMode === 'total'
                      ? 'bg-white text-slate-900 shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Total Volume
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-500">Orientation:</span>
              <div className="inline-flex rounded-lg bg-slate-100 p-0.5 border border-slate-200">
                <button
                  type="button"
                  onClick={() => setOrientation('vertical')}
                  className={`px-2.5 py-1 font-bold rounded-md transition-all cursor-pointer ${
                    orientation === 'vertical'
                      ? 'bg-white text-slate-900 shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Columns
                </button>
                <button
                  type="button"
                  onClick={() => setOrientation('horizontal')}
                  className={`px-2.5 py-1 font-bold rounded-md transition-all cursor-pointer ${
                    orientation === 'horizontal'
                      ? 'bg-white text-slate-900 shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Horizontal Bars
                </button>
              </div>

              {selectedCommunity && (
                <div className="flex items-center gap-1.5 bg-emerald-50 text-emerald-900 border border-emerald-300 px-2.5 py-1 rounded-lg font-bold text-[11px]">
                  <Filter className="w-3 h-3 text-emerald-700" />
                  <span className="truncate max-w-[180px]">Filtered: {selectedCommunity}</span>
                  <button
                    onClick={() => onSelectCommunity(null)}
                    className="hover:text-rose-600 p-0.5 rounded cursor-pointer"
                    title="Clear filter"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Recharts Canvas */}
          <div className="w-full h-72 sm:h-80 pt-2">
            <ResponsiveContainer width="100%" height="100%">
              {orientation === 'vertical' ? (
                <BarChart
                  data={data}
                  margin={{ top: 16, right: 16, left: -16, bottom: 44 }}
                  onClick={(e: any) => {
                    const active = (e as any)?.activePayload;
                    if (active && active[0]) {
                      handleBarClick(active[0].payload);
                    }
                  }}
                  className="cursor-pointer"
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis
                    dataKey="shortName"
                    tick={{ fontSize: 11, fill: '#475569', fontWeight: 600 }}
                    interval={0}
                    angle={-25}
                    textAnchor="end"
                    height={50}
                  />
                  <YAxis
                    allowDecimals={false}
                    tick={{ fontSize: 11, fill: '#64748b' }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend
                    verticalAlign="top"
                    align="right"
                    wrapperStyle={{ paddingBottom: '12px', fontSize: '11px', fontWeight: 600 }}
                  />

                  {chartMode === 'stacked' ? (
                    <>
                      <Bar
                        dataKey="cva"
                        name="Citizen Voice & Action"
                        stackId="a"
                        fill="#059669"
                        radius={[0, 0, 0, 0]}
                      >
                        {data.map((entry) => (
                          <Cell
                            key={`cell-cva-${entry.community}`}
                            fill={
                              selectedCommunity && selectedCommunity !== entry.community
                                ? '#a7f3d0'
                                : '#059669'
                            }
                            stroke={selectedCommunity === entry.community ? '#064e3b' : 'none'}
                            strokeWidth={selectedCommunity === entry.community ? 2 : 0}
                          />
                        ))}
                      </Bar>
                      <Bar
                        dataKey="eie"
                        name="Education in Emergencies"
                        stackId="a"
                        fill="#6366f1"
                        radius={[4, 4, 0, 0]}
                      >
                        {data.map((entry) => (
                          <Cell
                            key={`cell-eie-${entry.community}`}
                            fill={
                              selectedCommunity && selectedCommunity !== entry.community
                                ? '#c7d2fe'
                                : '#6366f1'
                            }
                            stroke={selectedCommunity === entry.community ? '#312e81' : 'none'}
                            strokeWidth={selectedCommunity === entry.community ? 2 : 0}
                          />
                        ))}
                      </Bar>
                    </>
                  ) : (
                    <Bar
                      dataKey="total"
                      name="Total Field Dispatches"
                      radius={[6, 6, 0, 0]}
                      fill="#00B074"
                    >
                      {data.map((entry) => {
                        const isHigh = entry.activityLevel === 'High Activity';
                        const isSelected = selectedCommunity === entry.community;
                        let barFill = isHigh ? '#e11d48' : '#00B074'; // Rose for high-activity hotspot, Emerald for standard

                        if (selectedCommunity && !isSelected) {
                          barFill = isHigh ? '#fda4af' : '#a7f3d0'; // faded
                        }

                        return (
                          <Cell
                            key={`cell-total-${entry.community}`}
                            fill={barFill}
                            stroke={isSelected ? '#0f172a' : 'none'}
                            strokeWidth={isSelected ? 2 : 0}
                          />
                        );
                      })}
                    </Bar>
                  )}
                </BarChart>
              ) : (
                /* Horizontal Bar Chart */
                <BarChart
                  data={data}
                  layout="vertical"
                  margin={{ top: 8, right: 24, left: 24, bottom: 8 }}
                  onClick={(e: any) => {
                    const active = (e as any)?.activePayload;
                    if (active && active[0]) {
                      handleBarClick(active[0].payload);
                    }
                  }}
                  className="cursor-pointer"
                >
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                  <XAxis
                    type="number"
                    allowDecimals={false}
                    tick={{ fontSize: 11, fill: '#64748b' }}
                  />
                  <YAxis
                    dataKey="shortName"
                    type="category"
                    tick={{ fontSize: 11, fill: '#334155', fontWeight: 600 }}
                    width={130}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend
                    verticalAlign="top"
                    align="right"
                    wrapperStyle={{ paddingBottom: '8px', fontSize: '11px', fontWeight: 600 }}
                  />

                  {chartMode === 'stacked' ? (
                    <>
                      <Bar
                        dataKey="cva"
                        name="Citizen Voice & Action"
                        stackId="a"
                        fill="#059669"
                      >
                        {data.map((entry) => (
                          <Cell
                            key={`cell-h-cva-${entry.community}`}
                            fill={
                              selectedCommunity && selectedCommunity !== entry.community
                                ? '#a7f3d0'
                                : '#059669'
                            }
                          />
                        ))}
                      </Bar>
                      <Bar
                        dataKey="eie"
                        name="Education in Emergencies"
                        stackId="a"
                        fill="#6366f1"
                        radius={[0, 4, 4, 0]}
                      >
                        {data.map((entry) => (
                          <Cell
                            key={`cell-h-eie-${entry.community}`}
                            fill={
                              selectedCommunity && selectedCommunity !== entry.community
                                ? '#c7d2fe'
                                : '#6366f1'
                            }
                          />
                        ))}
                      </Bar>
                    </>
                  ) : (
                    <Bar
                      dataKey="total"
                      name="Total Field Dispatches"
                      radius={[0, 6, 6, 0]}
                      fill="#00B074"
                    >
                      {data.map((entry) => {
                        const isHigh = entry.activityLevel === 'High Activity';
                        const isSelected = selectedCommunity === entry.community;
                        let barFill = isHigh ? '#e11d48' : '#00B074';
                        if (selectedCommunity && !isSelected) {
                          barFill = isHigh ? '#fda4af' : '#a7f3d0';
                        }
                        return (
                          <Cell
                            key={`cell-h-total-${entry.community}`}
                            fill={barFill}
                            stroke={isSelected ? '#0f172a' : 'none'}
                            strokeWidth={isSelected ? 2 : 0}
                          />
                        );
                      })}
                    </Bar>
                  )}
                </BarChart>
              )}
            </ResponsiveContainer>
          </div>

          {/* Interactive Legend & Instruction Footer */}
          <div className="flex flex-wrap items-center justify-between gap-3 text-[11px] text-slate-500 pt-3 border-t border-slate-100">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block" />
                <span className="font-semibold text-slate-700">High-Activity Zone</span> (Priority Attention)
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
                <span className="font-semibold text-slate-700">Citizen Voice &amp; Action</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 inline-block" />
                <span className="font-semibold text-slate-700">Education in Emergencies</span>
              </span>
            </div>

            <span className="text-slate-400 italic">
              💡 Tip: Click any bar or priority zone chip to filter the dispatches below.
            </span>
          </div>

        </div>
      )}

    </div>
  );
};
