import React, { useState, useMemo, useEffect } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableHeader, TableBody, TableRow, TableCell } from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Search as SearchIcon } from "lucide-react";
import { motion } from "framer-motion";

import type { FloorCeiling, Player } from "@/data/players";
import { players } from "@/data/players";
import { TeamCount, adviceByOverallPick } from "@/data/strategy";

// helper for tag rendering with enhanced styling
const tagIcon = (flag?: boolean) => (flag ? "✓" : "");

// Enhanced styling helpers
const getPositionColor = (position: string) => {
  const colors = {
    QB: "bg-purple-100 text-purple-800 border-purple-200",
    RB: "bg-green-100 text-green-800 border-green-200", 
    WR: "bg-blue-100 text-blue-800 border-blue-200",
    TE: "bg-orange-100 text-orange-800 border-orange-200",
    DST: "bg-gray-100 text-gray-800 border-gray-200",
    K: "bg-yellow-100 text-yellow-800 border-yellow-200"
  };
  return colors[position as keyof typeof colors] || "bg-gray-100 text-gray-800";
};

const getTierColor = (tier: number) => {
  const colors = {
    1: "bg-gradient-to-r from-yellow-400 to-yellow-600 text-white font-bold shadow-lg",
    2: "bg-gradient-to-r from-orange-400 to-orange-600 text-white font-semibold shadow-md",
    3: "bg-gradient-to-r from-red-400 to-red-600 text-white font-semibold shadow-md",
    4: "bg-gradient-to-r from-blue-400 to-blue-600 text-white font-medium shadow",
    5: "bg-gradient-to-r from-green-400 to-green-600 text-white font-medium shadow",
    6: "bg-gradient-to-r from-purple-400 to-purple-600 text-white font-medium shadow",
    7: "bg-gradient-to-r from-gray-400 to-gray-600 text-white font-medium shadow",
    8: "bg-gradient-to-r from-slate-400 to-slate-600 text-white font-medium shadow",
    9: "bg-gradient-to-r from-teal-400 to-teal-600 text-white font-medium shadow"
  };
  return colors[tier as keyof typeof colors] || "bg-gray-500 text-white";
};

const getFloorCeilingColor = (rating: FloorCeiling) => {
  const colors = {
    Poor: "text-red-600 font-medium",
    Mediocre: "text-orange-500 font-medium", 
    Good: "text-yellow-600 font-medium",
    Great: "text-green-600 font-semibold",
    Excellent: "text-emerald-700 font-bold"
  };
  return colors[rating];
};

// Snake draft helper: compute overall pick for a given round
const getOverallPickForRound = (round: number, teams: number, slot: number): number => {
  return round % 2 === 1 ? (round - 1) * teams + slot : round * teams - slot + 1;
};
// Round header gradient colors inspired by tier colors T1..T7
const roundHeaderGradient = (round: number): string => {
  const palette = [
    "from-yellow-400 to-yellow-600", // 1
    "from-orange-400 to-orange-600", // 2
    "from-red-400 to-red-600",       // 3
    "from-blue-400 to-blue-600",     // 4
    "from-green-400 to-green-600",   // 5
    "from-purple-400 to-purple-600", // 6
    "from-gray-400 to-gray-600",     // 7
  ];
  return `bg-gradient-to-br ${palette[(round-1)%palette.length]} text-white`;
};
// Display helper for position labels
const displayPosition = (pos: string) => (pos === "DST" ? "D/ST" : pos);

const positions = ["ALL", "QB", "RB", "WR", "TE", "DST", "K"] as const;

type SortKey = "rank" | "adp";

// Draft mode types/state
type DraftStatus = "available" | "mine" | "taken";

type Mode = "big" | "draft" | "guidance";

type ViewFilter = "available" | "all" | "mine";

// Mobile Player Card Component
const PlayerCard = ({ player, index, mode, status, onMine, onTaken, onReset, canMarkAsDrafted }: { player: Player; index: number; mode: Mode; status: DraftStatus; onMine: () => void; onTaken: () => void; onReset: () => void; canMarkAsDrafted: boolean; }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: index * 0.02 }}
    className={`p-3 rounded-lg border shadow-sm bg-white hover:shadow-md transition-all duration-200 relative ${
      index % 2 === 0 ? 'bg-gray-50/50' : 'bg-white'
    } ${status === 'taken' ? 'opacity-40' : ''} ${status === 'mine' ? 'ring-2 ring-emerald-400' : ''}`}
  >
    <div className="flex items-start justify-between">
      <div className="flex-1 min-w-0 pr-20">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-lg font-bold text-gray-800">#{player.ovrRank}</span>
          <span className={`px-2 py-1 rounded-full text-xs font-semibold border ${getPositionColor(player.position)}`}>
            {displayPosition(player.position)}
          </span>
          <span className={`px-2 py-1 rounded-full text-xs ${getTierColor(player.tier)}`}>
            T{player.tier}
          </span>
        </div>
        <h3 className="font-bold text-gray-900 text-base leading-tight mb-1">{player.name}</h3>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <span className="font-semibold">{player.team}</span>
          <span>#{player.posRank} {displayPosition(player.position)}</span>
          <span>ADP: {player.adp}</span>
        </div>
      </div>
    </div>
    
    {/* 2x2 Grid anchored to right side with fixed column widths */}
    <div className="absolute top-2 right-3 bottom-2 grid grid-cols-2 grid-rows-2 gap-x-2 gap-y-2 text-xs" style={{ gridTemplateColumns: '100px 70px' }}>
      {/* Top Left: Must-Draft/Avoid */}
      <div className="flex items-center justify-end">
        {player.mustDraft && (
          <div className="flex flex-col items-center justify-center h-10 px-3 py-1.5 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-300 rounded-lg shadow-sm text-xs transform translate-y-[1px] w-24">
            <span className="text-green-700 font-semibold text-xs tracking-wide">Must-Draft</span>
          </div>
        )}
        {player.avoid && (
          <div className="flex flex-col items-center justify-center h-10 px-3 py-1.5 bg-gradient-to-r from-red-50 to-rose-50 border border-red-300 rounded-lg shadow-sm text-xs transform translate-y-[1px] w-24">
            <span className="text-red-700 font-semibold text-xs tracking-wide">Avoid</span>
          </div>
        )}
      </div>
      
      {/* Top Right: Ceiling */}
      <div className="flex flex-col items-center justify-center h-10 px-3 py-1.5 bg-gradient-to-r from-gray-50 to-slate-50 border border-gray-300 rounded-lg shadow-sm text-xs">
        <div className="text-xs text-gray-600 leading-tight font-medium">Ceiling</div>
        <div className={`font-semibold text-xs leading-tight tracking-wide ${getFloorCeilingColor(player.ceiling)}`}>
          {player.ceiling}
        </div>
      </div>
      
      {/* Bottom Left: Underrated/Overrated */}
      <div className="flex items-center justify-end">
        {player.underrated && (
          <div className="flex flex-col items-center justify-center h-10 px-3 py-1.5 bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-300 rounded-lg shadow-sm text-xs transform translate-y-[1px] w-24">
            <span className="text-blue-700 font-semibold text-xs tracking-wide">Underrated</span>
          </div>
        )}
        {player.overrated && (
          <div className="flex flex-col items-center justify-center h-10 px-3 py-1.5 bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-300 rounded-lg shadow-sm text-xs transform translate-y-[1px] w-24">
            <span className="text-orange-700 font-semibold text-xs tracking-wide">Overrated</span>
          </div>
        )}
      </div>
      
      {/* Bottom Right: Floor */}
      <div className="flex flex-col items-center justify-center h-10 px-3 py-1.5 bg-gradient-to-r from-gray-50 to-slate-50 border border-gray-300 rounded-lg shadow-sm text-xs">
        <div className="text-xs text-gray-600 leading-tight font-medium">Floor</div>
        <div className={`font-semibold text-xs leading-tight tracking-wide ${getFloorCeilingColor(player.floor)}`}>
          {player.floor}
        </div>
      </div>
    </div>

    {mode === 'draft' && (
      <div className="mt-3 flex items-center justify-end gap-2">
        {canMarkAsDrafted && (
          <>
            <button 
              onClick={onMine} 
              className="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-200 border border-emerald-400/30 flex items-center gap-1 min-w-[80px] justify-center"
            >
              <span className="w-1.5 h-1.5 bg-white rounded-full"></span>
              My Pick
            </button>
            <button 
              onClick={onTaken} 
              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-700 hover:to-slate-800 text-white shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-200 border border-slate-500/30 flex items-center gap-1"
            >
              <span className="w-1.5 h-1.5 bg-white rounded-full"></span>
              Drafted
            </button>
          </>
        )}
        {!canMarkAsDrafted && status !== 'available' && (
          <>
            <span className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${
              status === 'mine' 
                ? 'bg-gradient-to-r from-emerald-100 to-emerald-200 text-emerald-800 border border-emerald-300 shadow-sm' 
                : 'bg-gradient-to-r from-slate-100 to-slate-200 text-slate-800 border border-slate-300 shadow-sm'
            } flex items-center gap-1`}>
              <span className={`w-1.5 h-1.5 rounded-full ${
                status === 'mine' ? 'bg-emerald-600' : 'bg-slate-600'
              }`}></span>
              {status === 'mine' ? 'My Pick' : 'Drafted'}
            </span>
            <button 
              onClick={onReset} 
              className="px-2.5 py-1.5 rounded-lg text-xs font-medium bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 hover:border-gray-400 shadow-sm hover:shadow-md transform hover:scale-105 transition-all duration-200"
            >
              Reset
            </button>
          </>
        )}
      </div>
    )}
  </motion.div>
);

export default function FantasyDraftBoard() {
  const [activePos, setActivePos] = useState<string>("ALL");
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("rank");

  const [mode, setMode] = useState<Mode>('big');
  const [view, setView] = useState<ViewFilter>('all');
  const [draftMap, setDraftMap] = useState<Record<number, DraftStatus>>({});
  const [teamCount, setTeamCount] = useState<TeamCount>(12);
  const [draftSlot, setDraftSlot] = useState<number>(1);

  // Load/save draft board from localStorage
  useEffect(() => {
    try {
      const raw = localStorage.getItem('draft_map_v1');
      if (raw) setDraftMap(JSON.parse(raw));
    } catch {}
  }, []);
  useEffect(() => {
    try { localStorage.setItem('draft_map_v1', JSON.stringify(draftMap)); } catch {}
  }, [draftMap]);
  useEffect(() => {
    // Reset draft slot to 1 when team count changes
    setDraftSlot(1);
  }, [teamCount]);

  // Reset to Overall position and set appropriate view when switching modes
  useEffect(() => {
    setActivePos("ALL");
    if (mode === 'draft') {
      setView('all');
    }
  }, [mode]);

  // Handle view changes in draft mode
  const handleViewChange = (newView: ViewFilter) => {
    setView(newView);
    // Reset to Overall position when changing views in draft mode
    setActivePos("ALL");
  };

  // Handle mode changes
  const handleModeChange = (newMode: Mode) => {
    setMode(newMode);
  };

  const statusFor = (id: number): DraftStatus => draftMap[id] ?? 'available';
  const markMine = (id: number) => setDraftMap(prev => ({ ...prev, [id]: 'mine' }));
  const markTaken = (id: number) => setDraftMap(prev => ({ ...prev, [id]: 'taken' }));
  const resetPick = (id: number) => setDraftMap(prev => { const { [id]: _, ...rest } = prev; return rest; });

  const sortedPlayers = useMemo(() => {
    return players
      .filter((p) => (activePos === "ALL" ? true : p.position === activePos))
      .filter((p) => p.name.toLowerCase().includes(search.toLowerCase()))
      .sort((a, b) =>
        sortKey === "rank" ? a.ovrRank - b.ovrRank : parseFloat(a.adp) - parseFloat(b.adp)
      );
  }, [activePos, search, sortKey]);

  const displayPlayers = useMemo(() => {
    if (mode !== 'draft') return sortedPlayers;
    if (view === 'all') return sortedPlayers;
    if (view === 'available') return sortedPlayers.filter(p => statusFor(p.ovrRank) === 'available');
    return sortedPlayers.filter(p => statusFor(p.ovrRank) === 'mine');
  }, [sortedPlayers, mode, view, draftMap]);

  // Helper function to check if a player can be marked as drafted
  const canMarkAsDrafted = (player: Player) => {
    if (mode !== 'draft') return false;
    if (view === 'mine') return false;
    return statusFor(player.ovrRank) === 'available';
  };

  const headerClasses = (key: SortKey) =>
    `cursor-pointer select-none transition-all duration-200 hover:text-blue-600 hover:scale-105 ${sortKey === key ? "text-blue-700 font-bold underline decoration-2 underline-offset-2" : ""}`;

  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-2 sm:p-4"
    >
      <div className="container mx-auto max-w-7xl">
        {/* Enhanced Header - Mobile Responsive */}
        <div className="text-center mb-4 sm:mb-6">
          <motion.h1 
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-3xl sm:text-5xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent mb-2"
          >
            2025 Fantasy Football Draft Board
          </motion.h1>
          <motion.p
            initial={{ y: -10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-base sm:text-lg text-gray-600 font-medium"
          >
            PPR League • Expert Rankings & Analysis
          </motion.p>
        </div>

        {/* Main Content */}
        <Tabs value={activePos} onValueChange={setActivePos} className="w-full">
          <Card className="shadow-2xl border-0 bg-white/90 backdrop-blur-sm">
            {/* Mode Toggle - Positioned above header */}
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-3 sm:p-4 rounded-t-lg">
              <div className="flex items-center justify-center">
                <TabsList className="bg-white/10 border border-white/20">
                  <TabsTrigger value="big" onClick={() => handleModeChange('big')} className={`${mode==='big' ? 'bg-white text-blue-700 font-bold' : 'text-white'}`}>Big Board</TabsTrigger>
                  <TabsTrigger value="draft" onClick={() => handleModeChange('draft')} className={`${mode==='draft' ? 'bg-white text-blue-700 font-bold' : 'text-white'}`}>Draft Mode</TabsTrigger>
                  <TabsTrigger value="guidance" onClick={() => handleModeChange('guidance')} className={`${mode==='guidance' ? 'bg-white text-blue-700 font-bold' : 'text-white'}`}>Draft Guidance</TabsTrigger>
                </TabsList>
              </div>
            </div>

                        <CardHeader className={`bg-gradient-to-r from-blue-500 to-purple-600 text-white p-3 sm:p-4 border-t border-white/20 ${mode==='guidance' ? 'hidden' : ''}`}>
               {/* Mobile Layout */}
              <div className="block sm:hidden space-y-3">
                <h2 className="text-xl font-bold text-center">
                  {mode==='guidance' ? 'Draft Guidance' : (activePos === "ALL" ? "Overall Rankings" : `${activePos} Rankings`)}
                </h2>
                {mode !== 'guidance' && (
                  <>
                    <TabsList className="w-full bg-white/10 backdrop-blur-sm border border-white/20">
                      {positions.map((pos) => (
                        <TabsTrigger 
                          key={pos} 
                          value={pos} 
                          className="flex-1 capitalize text-white font-medium data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:font-bold transition-all duration-200 text-xs"
                        >
                          {pos === "ALL" ? "All" : (pos === "DST" ? "D/ST" : pos)}
                        </TabsTrigger>
                      ))}
                    </TabsList>
                    <div className="flex items-center justify-between gap-2">
                      <div className="relative flex-1">
                        <Input
                          placeholder="Search players…"
                          value={search}
                          onChange={(e) => setSearch(e.target.value)}
                          className="pl-10 bg-white/90 border-white/20 focus:bg-white focus:border-blue-300 transition-all duration-200"
                        />
                        <SearchIcon className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
                      </div>
                    </div>
                  </>
                )}
                {mode === 'draft' && (
                  <div className="flex items-center justify-center gap-2">
                    <TabsList className="bg-white/10 border border-white/20">
                      <TabsTrigger value="available" onClick={() => handleViewChange('available')} className={`text-xs ${view==='available' ? 'bg-white text-blue-700 font-bold' : 'text-white'}`}>Available</TabsTrigger>
                      <TabsTrigger value="all" onClick={() => handleViewChange('all')} className={`text-xs ${view==='all' ? 'bg-white text-blue-700 font-bold' : 'text-white'}`}>All</TabsTrigger>
                      <TabsTrigger value="mine" onClick={() => handleViewChange('mine')} className={`text-xs ${view==='mine' ? 'bg-white text-blue-700 font-bold' : 'text-white'}`}>My Team</TabsTrigger>
                    </TabsList>
                  </div>
                )}
              </div>
 
              {/* Desktop Layout */}
              <div className="hidden sm:block w-full">
                {mode === 'big' ? (
                  <div className="grid grid-cols-[1fr_auto_1fr] items-center w-full">
                    <div className="justify-self-start">
                      <h2 className="text-2xl font-bold">{activePos === "ALL" ? "Overall Rankings" : `${activePos} Rankings`}</h2>
                    </div>
                    <div className="justify-self-center">
                      <TabsList className="bg-white/10 backdrop-blur-sm border border-white/20">
                        {positions.map((pos) => (
                          <TabsTrigger 
                            key={pos} 
                            value={pos} 
                            className="capitalize text-white font-medium data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:font-bold transition-all duration-200"
                          >
                            {pos === "ALL" ? "Overall" : (pos === "DST" ? "D/ST" : pos)}
                          </TabsTrigger>
                        ))}
                      </TabsList>
                    </div>
                    <div className="justify-self-end">
                      <div className="relative w-64">
                        <Input
                          placeholder="Search players…"
                          value={search}
                          onChange={(e) => setSearch(e.target.value)}
                          className="pl-10 bg-white/90 border-white/20 focus:bg-white focus:border-blue-300 transition-all duration-200"
                        />
                        <SearchIcon className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
                      </div>
                    </div>
                  </div>
                ) : mode === 'draft' ? (
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center">
                      <h2 className="text-2xl font-bold">{activePos === "ALL" ? "Overall Rankings" : `${activePos} Rankings`}</h2>
                    </div>
                    <div className="flex items-center">
                      <TabsList className="bg-white/10 backdrop-blur-sm border border-white/20">
                        {positions.map((pos) => (
                          <TabsTrigger 
                            key={pos} 
                            value={pos} 
                            className="capitalize text-white font-medium data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:font-bold transition-all duration-200"
                          >
                            {pos === "ALL" ? "Overall" : (pos === "DST" ? "D/ST" : pos)}
                          </TabsTrigger>
                        ))}
                      </TabsList>
                    </div>
                    <div className="flex items-center">
                      <TabsList className="bg-white/10 border border-white/20">
                        <TabsTrigger value="available" onClick={() => handleViewChange('available')} className={`${view==='available' ? 'bg-white text-blue-700 font-bold' : 'text-white'}`}>Available</TabsTrigger>
                        <TabsTrigger value="all" onClick={() => handleViewChange('all')} className={`${view==='all' ? 'bg-white text-blue-700 font-bold' : 'text-white'}`}>All</TabsTrigger>
                        <TabsTrigger value="mine" onClick={() => handleViewChange('mine')} className={`${view==='mine' ? 'bg-white text-blue-700 font-bold' : 'text-white'}`}>My Team</TabsTrigger>
                      </TabsList>
                    </div>
                    <div className="flex items-center">
                      <div className="relative w-64">
                        <Input
                          placeholder="Search players…"
                          value={search}
                          onChange={(e) => setSearch(e.target.value)}
                          className="pl-10 bg-white/90 border-white/20 focus:bg-white focus:border-blue-300 transition-all duration-200"
                        />
                        <SearchIcon className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
                      </div>
                    </div>
                  </div>
                ) : null}
               </div>
             </CardHeader>

            <CardContent className="p-0">
              {/* Draft Guidance Content */}
              {mode === 'guidance' ? (
                <div className="p-4 sm:p-6 space-y-5">
                  <div className="rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 text-white border border-white/20 shadow-lg p-3 sm:p-4">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center justify-items-center">
                      <div className="sm:col-span-1">
                        <label className="block text-sm font-semibold text-center">Teams</label>
                        <div className="mt-2 inline-flex rounded-lg bg-white/10 border border-white/20 p-1 shadow-sm">
                          {[10,12].map((n) => (
                            <button
                              key={n}
                              onClick={() => setTeamCount(n as TeamCount)}
                              className={`${teamCount===n ? 'bg-white text-blue-700 shadow-sm' : 'bg-transparent text-white'} px-4 py-1.5 rounded-md text-sm font-semibold transition-colors`}
                            >
                              {n} Teams
                            </button>
                          ))}
                        </div>
                      </div>
                      <div className="sm:col-span-2">
                        <label className="block text-sm font-semibold text-center">Draft Slot</label>
                        <div className="mt-2 flex gap-2 overflow-x-auto sm:flex-wrap sm:overflow-visible justify-center">
                          {Array.from({ length: teamCount }, (_, i) => i + 1).map((slot) => (
                            <button
                              key={slot}
                              onClick={() => setDraftSlot(slot)}
                              className={`${draftSlot===slot ? 'bg-white text-blue-700 border-white shadow-sm' : 'bg-white/10 text-white border-white/30'} px-3 py-1.5 rounded-md text-sm font-semibold border min-w-[40px] text-center`}
                            >
                              {slot}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white/90 sm:bg-white border border-white/20 sm:border-gray-200 rounded-xl shadow-lg p-4 sm:p-6">
                    <h3 className="text-lg font-bold mb-4 text-gray-900">Strategy By Draft Slot</h3>
                    <div className="space-y-4">
                      {[1,2,3,4,5,6,7].map((round, idx) => {
                        const overall = getOverallPickForRound(round, teamCount, draftSlot);
                        const body = adviceByOverallPick[teamCount][overall];
                        return (
                          <motion.div
                            key={round}
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.02 * idx }}
                            className="rounded-xl shadow-sm hover:shadow-md border border-gray-200 bg-white p-3 sm:p-4"
                          >
                            <div className="flex items-start gap-3 sm:gap-4">
                              <div className={`rounded-lg ${roundHeaderGradient(round)} px-3 py-2 sm:px-4 sm:py-3 w-28 sm:w-32 flex-shrink-0`}>
                                <div className="text-xs sm:text-sm font-semibold uppercase tracking-wide">Round {round}</div>
                                <div className="text-base sm:text-lg font-bold">Pick {overall}</div>
                              </div>
                              <div className="flex-1 text-sm text-gray-700 whitespace-pre-line">{body}</div>
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              ) : (
              /* Mobile Card Layout */
              <div className="block sm:hidden">
                <div className="p-3 space-y-2 max-h-[70vh] overflow-y-auto">
                  {displayPlayers.map((player, index) => (
                    <PlayerCard 
                      key={player.ovrRank} 
                      player={player} 
                      index={index} 
                      mode={mode}
                      status={statusFor(player.ovrRank)}
                      onMine={() => markMine(player.ovrRank)}
                      onTaken={() => markTaken(player.ovrRank)}
                      onReset={() => resetPick(player.ovrRank)}
                      canMarkAsDrafted={canMarkAsDrafted(player)}
                    />
                  ))}
                </div>
              </div>
              )}

              {/* Desktop Table Layout */}
              {mode !== 'guidance' && (
              <div className="hidden sm:block">
                {/* Unified scrollable container for both header and content */}
                <div className="overflow-x-auto">
                  <Table className="min-w-max text-xs md:text-sm">
                    <colgroup>
                      <col className="w-12" />
                      <col className="w-16" />
                      <col className="w-48" />
                      <col className="w-20" />
                      <col className="w-16" />
                      <col className="w-20" />
                      <col className="w-16" />
                      <col className="w-20" />
                      <col className="w-32" />
                      <col className="w-40" />
                      <col className="w-28" />
                      <col className="w-24" />
                      <col className="w-24" />
                      <col className="w-36" />
                    </colgroup>
                    
                    {/* Fixed Header */}
                    <TableHeader>
                      <TableRow className="hover:bg-gray-100/50">
                        <TableCell className={`${headerClasses("rank")} bg-gradient-to-r from-gray-50 to-gray-100 font-bold text-gray-700 text-center sticky top-0 z-10`} onClick={() => setSortKey("rank")}>#</TableCell>
                        <TableCell className={`${headerClasses("adp")} bg-gradient-to-r from-gray-50 to-gray-100 font-bold text-gray-700 text-center sticky top-0 z-10`} onClick={() => setSortKey("adp")}>ADP</TableCell>
                        <TableCell className="bg-gradient-to-r from-gray-50 to-gray-100 font-bold text-gray-700 text-center sticky top-0 z-10">Player</TableCell>
                        <TableCell className="bg-gradient-to-r from-gray-50 to-gray-100 font-bold text-gray-700 text-center sticky top-0 z-10">Team</TableCell>
                        <TableCell className="bg-gradient-to-r from-gray-50 to-gray-100 font-bold text-gray-700 text-center sticky top-0 z-10">Pos</TableCell>
                        <TableCell className="bg-gradient-to-r from-gray-50 to-gray-100 font-bold text-gray-700 text-center sticky top-0 z-10">Pos Rank</TableCell>
                        <TableCell className="bg-gradient-to-r from-gray-50 to-gray-100 font-bold text-gray-700 text-center sticky top-0 z-10">Tier</TableCell>
                        <TableCell className="bg-gradient-to-r from-gray-50 to-gray-100 font-bold text-gray-700 text-center sticky top-0 z-10">Proj.</TableCell>
                        {mode === 'draft' && (
                          <TableCell className="bg-gradient-to-r from-gray-50 to-gray-100 font-bold text-gray-700 text-center sticky top-0 z-10">Draft</TableCell>
                        )}
                        <TableCell className="bg-gradient-to-r from-gray-50 to-gray-100 font-bold text-gray-700 text-center sticky top-0 z-10">Under/Overrated</TableCell>
                        <TableCell className="bg-gradient-to-r from-gray-50 to-gray-100 font-bold text-gray-700 text-center sticky top-0 z-10">Floor</TableCell>
                        <TableCell className="bg-gradient-to-r from-gray-50 to-gray-100 font-bold text-gray-700 text-center sticky top-0 z-10">Ceiling</TableCell>
                      </TableRow>
                    </TableHeader>
                    
                    {/* Scrollable Content */}
                    <TableBody className="max-h-[65vh] overflow-y-auto">
                      {displayPlayers.map((p, index) => (
                        <TableRow key={p.ovrRank} className={`hover:bg-blue-50 hover:shadow-md transition-all duration-200 ${index % 2 === 0 ? 'bg-gray-50/30' : 'bg-white'} ${statusFor(p.ovrRank)==='taken' ? 'opacity-40' : ''} ${statusFor(p.ovrRank)==='mine' ? 'ring-2 ring-emerald-400' : ''}`}>
                          <TableCell className="font-bold text-gray-700 text-center">{p.ovrRank}</TableCell>
                          <TableCell className="font-medium text-gray-600 text-center">{p.adp}</TableCell>
                          <TableCell className="font-bold text-gray-900 text-center">{p.name}</TableCell>
                          <TableCell className="text-center">
                            <span className="font-semibold text-gray-700">{p.team}</span>
                          </TableCell>
                          <TableCell className="text-center">
                            <span className={`px-2 py-1 rounded-full text-xs font-semibold border ${getPositionColor(p.position)}`}>
                              {displayPosition(p.position)}
                            </span>
                          </TableCell>
                          <TableCell className="font-semibold text-gray-700 text-center">{p.posRank}</TableCell>
                          <TableCell className="text-center">
                            <span className={`px-2 py-1 rounded-full text-xs ${getTierColor(p.tier)}`}>
                              T{p.tier}
                            </span>
                          </TableCell>
                          <TableCell className="font-medium text-gray-600 text-center">{p.projection}</TableCell>
                          {mode === 'draft' && (
                            <TableCell className="text-center">
                              <div className="inline-flex gap-2">
                                {/* Left slot */}
                                {statusFor(p.ovrRank) === 'taken' ? (
                                  <button 
                                    onClick={() => resetPick(p.ovrRank)} 
                                    className="px-2.5 py-1.5 rounded-lg text-xs font-medium bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 hover:border-gray-400 shadow-sm hover:shadow-md transform hover:scale-105 transition-all duration-200 min-w-[80px]"
                                  >
                                    Reset
                                  </button>
                                ) : (
                                  <button 
                                    onClick={() => markMine(p.ovrRank)} 
                                    disabled={statusFor(p.ovrRank) !== 'available' && statusFor(p.ovrRank) !== 'mine'}
                                    className={`${statusFor(p.ovrRank)==='mine' 
                                      ? 'px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-gradient-to-r from-emerald-100 to-emerald-200 text-emerald-800 border border-emerald-300 shadow-sm flex items-center gap-1 min-w-[80px] justify-center cursor-default'
                                      : 'px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-200 border border-emerald-400/30 flex items-center gap-1 min-w-[80px] justify-center'}`}
                                  >
                                    <span className="w-1.5 h-1.5 bg-white rounded-full"></span>
                                    My Pick
                                  </button>
                                )}
                                {/* Right slot */}
                                {statusFor(p.ovrRank) === 'mine' ? (
                                  <button 
                                    onClick={() => resetPick(p.ovrRank)} 
                                    className="px-2.5 py-1.5 rounded-lg text-xs font-medium bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 hover:border-gray-400 shadow-sm hover:shadow-md transform hover:scale-105 transition-all duration-200 min-w-[80px]"
                                  >
                                    Reset
                                  </button>
                                ) : (
                                  <button 
                                    onClick={() => markTaken(p.ovrRank)} 
                                    disabled={statusFor(p.ovrRank) !== 'available' && statusFor(p.ovrRank) !== 'taken'}
                                    className={`${statusFor(p.ovrRank)==='taken' 
                                      ? 'px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-gradient-to-r from-slate-100 to-slate-200 text-slate-800 border border-slate-300 shadow-sm flex items-center gap-1 min-w-[80px] justify-center cursor-default'
                                      : 'px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-700 hover:to-slate-800 text-white shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-200 border border-slate-500/30 flex items-center gap-1 min-w-[80px] justify-center'}`}
                                  >
                                    <span className="w-1.5 h-1.5 bg-white rounded-full"></span>
                                    Drafted
                                  </button>
                                )}
                              </div>
                            </TableCell>
                          )}
                          <TableCell className="text-center">
                            {p.overrated && <span className="text-orange-600 font-bold text-lg">⬇</span>}
                            {p.underrated && <span className="text-blue-600 font-bold text-lg">⬆</span>}
                          </TableCell>
                          <TableCell className={`${getFloorCeilingColor(p.floor)} text-center`}>{p.floor}</TableCell>
                          <TableCell className={`${getFloorCeilingColor(p.ceiling)} text-center`}>{p.ceiling}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
              )}
            </CardContent>
          </Card>
        </Tabs>

        {/* Enhanced Footer */}
        <motion.footer 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="text-center mt-4 sm:mt-6 p-3 sm:p-4 bg-white/70 backdrop-blur-sm rounded-lg shadow-lg border border-white/20"
        >
          <div className="flex flex-wrap justify-center items-center gap-2 sm:gap-4 text-xs sm:text-sm text-gray-600">
            <span className="flex items-center gap-1">
              Click <strong>"#"</strong> or <strong>"ADP"</strong> to sort
            </span>
            <span className="hidden sm:block">•</span>
            <span className="flex items-center gap-2 flex-wrap justify-center">
              <span className="text-blue-600 font-bold">⬆</span> Underrated
              <span className="text-orange-600 font-bold">⬇</span> Overrated
            </span>
            <span className="hidden sm:block">•</span>
            <span className="font-medium">Data: FantasyPros snapshot (Aug 7 2025)</span>
          </div>
        </motion.footer>
      </div>
    </motion.div>
  );
}