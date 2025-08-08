import React, { useState, useMemo } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableHeader, TableBody, TableRow, TableCell } from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Search as SearchIcon } from "lucide-react";
import { motion } from "framer-motion";

type FloorCeiling = "Poor" | "Mediocre" | "Good" | "Great" | "Excellent";

type Player = {
  name: string;
  team: string;
  position: "QB" | "RB" | "WR" | "TE" | "DST" | "K";
  ovrRank: number;     // overall rank
  posRank: number;     // positional rank (e.g., RB3)
  adp: string;         // average draft position (string for easy edits)
  tier: number;
  mustDraft?: boolean;
  avoid?: boolean;
  overrated?: boolean;
  underrated?: boolean;
  floor: FloorCeiling;
  ceiling: FloorCeiling;
};

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
    8: "bg-gradient-to-r from-slate-400 to-slate-600 text-white font-medium shadow"
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

const players: Player[] = [
  // -- Tier 1: Transcendent --
  { name: "Ja'Marr Chase",    team: "CIN", position: "WR", ovrRank: 1, posRank: 1, adp: "1.0", tier: 1, mustDraft: true, floor: "Great", ceiling: "Excellent"},
  { name: "Bijan Robinson",   team: "ATL", position: "RB", ovrRank: 2, posRank: 1, adp: "2.6", tier: 1, mustDraft: true, floor: "Great", ceiling: "Excellent"},
  { name: "Saquon Barkley",   team: "PHI", position: "RB", ovrRank: 3, posRank: 2, adp: "2.8", tier: 1, mustDraft: true, floor: "Great", ceiling: "Excellent"},
  { name: "CeeDee Lamb",      team: "DAL", position: "WR", ovrRank: 4, posRank: 2, adp: "5.2", tier: 1, mustDraft: true, floor: "Great", ceiling: "Excellent"},
  { name: "Justin Jefferson", team: "MIN", position: "WR", ovrRank: 5, posRank: 3, adp: "4.8", tier: 1, floor: "Great", ceiling: "Excellent"},
  { name: "Jahmyr Gibbs",     team: "DET", position: "RB", ovrRank: 6, posRank: 3, adp: "4.6", tier: 1, floor: "Great", ceiling: "Excellent"},
  // -- Tier 2: Superstar --
  { name: "Christian McCaffrey", team: "SF",  position: "RB", ovrRank: 7,  posRank: 4, adp: "9.0",  tier: 2, floor: "Good", ceiling: "Excellent"},
  { name: "Puka Nacua",          team: "LAR", position: "WR", ovrRank: 8,  posRank: 4, adp: "9.2",  tier: 2, mustDraft: true, floor: "Great", ceiling: "Excellent"},
  { name: "Amon‑Ra St. Brown",   team: "DET", position: "WR", ovrRank: 9,  posRank: 5, adp: "9.4",  tier: 2, floor: "Great", ceiling: "Excellent"},
  { name: "Nico Collins",        team: "HOU", position: "WR", ovrRank: 10, posRank: 6, adp: "14.4", tier: 2, underrated: true,floor: "Great", ceiling: "Excellent"},
  { name: "Malik Nabers",        team: "NYG", position: "WR", ovrRank: 11, posRank: 7, adp: "9.6",  tier: 2, floor: "Good", ceiling: "Excellent"},
  { name: "Ashton Jeanty",       team: "LV",  position: "RB", ovrRank: 12, posRank: 5, adp: "10.2", tier: 2, floor: "Good", ceiling: "Excellent"},
  { name: "De'Von Achane",       team: "MIA", position: "RB", ovrRank: 13, posRank: 6, adp: "12.8", tier: 2, floor: "Good", ceiling: "Excellent"},
  { name: "Derrick Henry",       team: "BAL", position: "RB", ovrRank: 14, posRank: 7, adp: "10.4", tier: 2, floor: "Good", ceiling: "Excellent"},
  { name: "Brian Thomas Jr.",    team: "JAX", position: "WR", ovrRank: 15, posRank: 8, adp: "14.8", tier: 2, underrated: true, floor: "Good", ceiling: "Excellent"},
  // -- Tier 3: Star --
  { name: "Jonathan Taylor", team: "IND", position: "RB", ovrRank: 16, posRank: 8,  adp: "19.8", tier: 3, underrated: true, floor: "Great", ceiling: "Excellent"},
  { name: "Josh Jacobs",     team: "GB",  position: "RB", ovrRank: 17, posRank: 9,  adp: "17.0", tier: 3, floor: "Great", ceiling: "Excellent"},
  { name: "A.J. Brown",      team: "PHI", position: "WR", ovrRank: 18, posRank: 9,  adp: "17.6", tier: 3, floor: "Great", ceiling: "Great"},
  { name: "Drake London",    team: "ATL", position: "WR", ovrRank: 19, posRank: 10, adp: "19.8", tier: 3, floor: "Good", ceiling: "Excellent"},
  { name: "Bucky Irving",    team: "TB",  position: "RB", ovrRank: 20, posRank: 10, adp: "21.6", tier: 3, floor: "Good", ceiling: "Excellent"},
  { name: "Josh Allen",      team: "BUF", position: "QB", ovrRank: 21, posRank: 1,  adp: "23.2", tier: 3, floor: "Great", ceiling: "Excellent"},
  { name: "Lamar Jackson",   team: "BAL", position: "QB", ovrRank: 22, posRank: 2,  adp: "22.4", tier: 3, floor: "Great", ceiling: "Excellent"},
  { name: "Brock Bowers",    team: "LV",  position: "TE", ovrRank: 23, posRank: 1,  adp: "18.6", tier: 3, overrated: true, floor: "Good", ceiling: "Excellent"},
  { name: "Chase Brown",     team: "CIN", position: "RB", ovrRank: 24, posRank: 11, adp: "27.4", tier: 3, underrated: true, floor: "Good", ceiling: "Excellent"},
  { name: "Jayden Daniels",  team: "WAS", position: "QB", ovrRank: 25, posRank: 3,  adp: "31.2", tier: 3, floor: "Good", ceiling: "Excellent"},
  { name: "Trey McBride",    team: "ARI", position: "TE", ovrRank: 26, posRank: 2,  adp: "26.6", tier: 3, floor: "Great", ceiling: "Excellent"},
  { name: "Omarion Hampton", team: "LAC", position: "RB", ovrRank: 27, posRank: 12, adp: "43.2", tier: 3, underrated: true, floor: "Good", ceiling: "Excellent"},
  { name: "Kyren Williams",  team: "LAR", position: "RB", ovrRank: 28, posRank: 13, adp: "24.2", tier: 3, floor: "Good", ceiling: "Great"},
  { name: "Ladd McConkey",   team: "LAC", position: "WR", ovrRank: 29, posRank: 11, adp: "25.2", tier: 3, floor: "Good", ceiling: "Great"},
  { name: "Tee Higgins",     team: "CIN", position: "WR", ovrRank: 30, posRank: 12, adp: "30.4", tier: 3, floor: "Good", ceiling: "Great"},
  { name: "George Kittle",   team: "SF",  position: "TE", ovrRank: 31, posRank: 3,  adp: "38.0", tier: 3, mustDraft: true, underrated: true, floor: "Good", ceiling: "Excellent"},
  { name: "Tyreek Hill",     team: "MIA", position: "WR", ovrRank: 32, posRank: 13, adp: "28.6", tier: 3, overrated: true, floor: "Mediocre", ceiling: "Excellent"},
  // -- Tier 4: Great --
  { name: "Davante Adams",       team: "LV",  position: "WR", ovrRank: 33, posRank: 14, adp: "38.2", tier: 4, underrated: true, floor: "Good", ceiling: "Excellent"},
  { name: "James Cook",          team: "BUF", position: "RB", ovrRank: 34, posRank: 14, adp: "31.4", tier: 4, floor: "Good", ceiling: "Excellent"},
  { name: "Breece Hall",         team: "NYJ", position: "RB", ovrRank: 35, posRank: 15, adp: "33.2", tier: 4, floor: "Good", ceiling: "Excellent"},
  { name: "Jalen Hurts",         team: "PHI", position: "QB", ovrRank: 36, posRank: 5,  adp: "37.4", tier: 4, floor: "Great", ceiling: "Excellent"},
  { name: "Jaxon Smith‑Njigba",  team: "SEA", position: "WR", ovrRank: 37, posRank: 15, adp: "34.0", tier: 4, overrated: true, floor: "Good", ceiling: "Great"},
  { name: "Terry McLaurin",      team: "WAS", position: "WR", ovrRank: 38, posRank: 16, adp: "38.8", tier: 4, floor: "Good", ceiling: "Great"},
  { name: "Joe Burrow",          team: "CIN", position: "QB", ovrRank: 39, posRank: 4,  adp: "35.8", tier: 4, floor: "Great", ceiling: "Great"},
  { name: "Garrett Wilson",      team: "NYJ", position: "WR", ovrRank: 40, posRank: 17, adp: "36.2", tier: 4, floor: "Good", ceiling: "Great"},
  { name: "Alvin Kamara",        team: "NO",  position: "RB", ovrRank: 41, posRank: 16, adp: "38.2", tier: 4, floor: "Good", ceiling: "Great"},
  { name: "Kenneth Walker III",  team: "SEA", position: "RB", ovrRank: 42, posRank: 17, adp: "38.2", tier: 4, floor: "Good", ceiling: "Excellent"},
  { name: "Marvin Harrison Jr.", team: "ARI", position: "WR", ovrRank: 43, posRank: 18, adp: "41.2", tier: 4, overrated: true, floor: "Mediocre", ceiling: "Excellent"},
  { name: "Mike Evans",          team: "TB",  position: "WR", ovrRank: 44, posRank: 19, adp: "40.2", tier: 4, overrated: true, floor: "Good", ceiling: "Great"},
  { name: "Chuba Hubbard",       team: "CAR", position: "RB", ovrRank: 45, posRank: 18, adp: "45.2", tier: 4, floor: "Good", ceiling: "Great"},
  { name: "James Conner",        team: "ARI", position: "RB", ovrRank: 46, posRank: 19, adp: "47.8", tier: 4, floor: "Good", ceiling: "Great"},
  // -- Tier 5: Stud/Unreliable --
  { name: "Xavier Worthy",      team: "KC",  position: "WR", ovrRank: 47, posRank: 20, adp: "57.4", tier: 5, underrated: true, floor: "Mediocre", ceiling: "Excellent"},
  { name: "DJ Moore",           team: "CHI", position: "WR", ovrRank: 48, posRank: 21, adp: "48.6", tier: 5, floor: "Good", ceiling: "Great"},
  { name: "Rashee Rice",        team: "KC",  position: "WR", ovrRank: 49, posRank: 22, adp: "49.0", tier: 5, floor: "Mediocre", ceiling: "Great"},
  { name: "DK Metcalf",         team: "PIT", position: "WR", ovrRank: 50, posRank: 23, adp: "49.6", tier: 5, floor: "Good", ceiling: "Great"},
  { name: "Sam LaPorta",        team: "DET", position: "TE", ovrRank: 51, posRank: 4,  adp: "51.4", tier: 5, floor: "Good", ceiling: "Excellent"},
  { name: "Tetairoa McMillan",  team: "CAR", position: "WR", ovrRank: 52, posRank: 24, adp: "66.4", tier: 6, mustDraft: true, underrated: true, floor: "Mediocre", ceiling: "Excellent"},
  { name: "DeVonta Smith",      team: "PHI", position: "WR", ovrRank: 53, posRank: 25, adp: "56.2", tier: 5, floor: "Good", ceiling: "Great"},
  { name: "TreVeyon Henderson", team: "NE",  position: "RB", ovrRank: 54, posRank: 20, adp: "62.2", tier: 5, underrated: true, floor: "Good", ceiling: "Great"},
  { name: "David Montgomery",   team: "DET", position: "RB", ovrRank: 55, posRank: 21, adp: "59.4", tier: 5, floor: "Good", ceiling: "Great"},
  { name: "Courtland Sutton",   team: "DEN", position: "WR", ovrRank: 56, posRank: 26, adp: "53.6", tier: 5, floor: "Good", ceiling: "Great"},
  { name: "RJ Harvey",          team: "DEN", position: "RB", ovrRank: 57, posRank: 22, adp: "63.6", tier: 5, floor: "Mediocre", ceiling: "Great"},
  { name: "D'Andre Swift",      team: "CHI", position: "RB", ovrRank: 58, posRank: 23, adp: "57.0", tier: 5, floor: "Mediocre", ceiling: "Great"},
  { name: "Jameson Williams",   team: "DET", position: "WR", ovrRank: 59, posRank: 27, adp: "61.8", tier: 5, floor: "Good", ceiling: "Great"},
  { name: "T.J. Hockenson",     team: "MIN", position: "TE", ovrRank: 60, posRank: 5,  adp: "62.4", tier: 5, mustDraft: true, underrated: true, floor: "Mediocre", ceiling: "Great"},
  { name: "George Pickens",     team: "DAL", position: "WR", ovrRank: 61, posRank: 28, adp: "66.2", tier: 6, floor: "Mediocre", ceiling: "Great"},
  { name: "Zay Flowers",        team: "BAL", position: "WR", ovrRank: 62, posRank: 29, adp: "61.6", tier: 5, underrated: true, floor: "Mediocre", ceiling: "Great" },
  // -- Tier 6: Upside or Reliable Depth--
  { name: "Travis Hunter",      team: "JAX", position: "WR", ovrRank: 63, posRank: 30, adp: "64.0",  tier: 6, floor: "Mediocre", ceiling: "Excellent"},
  { name: "Baker Mayfield",     team: "TB",  position: "QB", ovrRank: 64, posRank: 6,  adp: "65.2",  tier: 6, underrated: true, floor: "Good", ceiling: "Great"},
  { name: "Bo Nix",             team: "DEN", position: "QB", ovrRank: 65, posRank: 7,  adp: "75.2",  tier: 6, mustDraft: true, underrated: true, floor: "Good", ceiling: "Excellent"},
  { name: "Kaleb Johnson",      team: "PIT", position: "RB", ovrRank: 66, posRank: 24, adp: "70.0",  tier: 6, underrated: true, floor: "Mediocre", ceiling: "Great"},
  { name: "Calvin Ridley",      team: "TEN", position: "WR", ovrRank: 67, posRank: 31, adp: "68.8",  tier: 6, floor: "Good", ceiling: "Good"},
  { name: "Isiah Pacheco",      team: "KC",  position: "RB", ovrRank: 68, posRank: 25, adp: "66.8",  tier: 6, floor: "Poor", ceiling: "Great"},
  { name: "Jaylen Waddle",      team: "MIA", position: "WR", ovrRank: 69, posRank: 32, adp: "74.6",  tier: 6, floor: "Mediocre", ceiling: "Great"},
  { name: "Joe Mixon",          team: "HOU", position: "RB", ovrRank: 70, posRank: 26, adp: "52.6",  tier: 6, avoid: true, overrated: true, floor: "Mediocre", ceiling: "Great"},
  { name: "Aaron Jones Sr.",    team: "MIN", position: "RB", ovrRank: 71, posRank: 27, adp: "64.2",  tier: 6, overrated: true, floor: "Mediocre", ceiling: "Great"},
  { name: "Rome Odunze",        team: "CHI", position: "WR", ovrRank: 72, posRank: 33, adp: "85.0",  tier: 6, underrated: true, floor: "Mediocre", ceiling: "Excellent"},
  { name: "Tony Pollard",       team: "TEN", position: "RB", ovrRank: 73, posRank: 28, adp: "74.8",  tier: 6, floor: "Mediocre", ceiling: "Great"},
  { name: "Travis Kelce",       team: "KC",  position: "TE", ovrRank: 74, posRank: 6,  adp: "62.2",  tier: 6, avoid: true, overrated: true, floor: "Mediocre", ceiling: "Great"},
  { name: "Mark Andrews",       team: "BAL", position: "TE", ovrRank: 75, posRank: 7,  adp: "75.6",  tier: 6, floor: "Mediocre", ceiling: "Great"},
  { name: "Chris Olave",        team: "NO",  position: "WR", ovrRank: 76, posRank: 34, adp: "80.4",  tier: 6, floor: "Mediocre", ceiling: "Great"},
  { name: "Jordan Addison",     team: "MIN", position: "WR", ovrRank: 77, posRank: 35, adp: "84.2",  tier: 6, floor: "Mediocre", ceiling: "Great"},
  { name: "Evan Engram",        team: "DEN", position: "TE", ovrRank: 78, posRank: 8,  adp: "87.0",  tier: 6, underrated: true, floor: "Mediocre", ceiling: "Great"},
  { name: "Jerry Jeudy",        team: "CLE", position: "WR", ovrRank: 79, posRank: 36, adp: "75.8",  tier: 6, floor: "Mediocre", ceiling: "Good"},
  { name: "Chris Godwin",       team: "TB",  position: "WR", ovrRank: 80, posRank: 37, adp: "80.2",  tier: 6, floor: "Mediocre", ceiling: "Great"},
  { name: "Brian Robinson Jr.", team: "WAS", position: "RB", ovrRank: 81, posRank: 29, adp: "83.0",  tier: 6, floor: "Good", ceiling: "Good"},
  { name: "Kyler Murray",       team: "ARI", position: "QB", ovrRank: 82, posRank: 8,  adp: "87.2",  tier: 6, floor: "Good", ceiling: "Great"},
  { name: "Brock Purdy",        team: "SF",  position: "QB", ovrRank: 83, posRank: 9,  adp: "105.4", tier: 6, underrated: true, floor: "Good", ceiling: "Great"},
  { name: "Patrick Mahomes II", team: "KC",  position: "QB", ovrRank: 84, posRank: 10, adp: "53.4",  tier: 6, avoid: true, overrated: true, floor: "Mediocre", ceiling: "Great"},
  { name: "David Njoku",        team: "CLE", position: "TE", ovrRank: 85, posRank: 9,  adp: "88.2",  tier: 6, mustDraft: true, underrated: true, floor: "Mediocre", ceiling: "Great"},
  { name: "Stefon Diggs",       team: "NE",  position: "WR", ovrRank: 86, posRank: 38, adp: "89.4",  tier: 6, floor: "Mediocre", ceiling: "Great"},
  // -- Tier 7: Dart Throws or Backups
  { name: "Ricky Pearsall",     team: "SF",  position: "WR", ovrRank: 87,  posRank: 39, adp: "105.2", tier: 7, underrated: true, floor: "Mediocre", ceiling: "Great"},
  { name: "Deebo Samuel Sr.",   team: "WAS", position: "WR", ovrRank: 88,  posRank: 40, adp: "88.4",  tier: 7, floor: "Mediocre", ceiling: "Good"},
  { name: "Tyrone Tracy Jr.",   team: "NYG", position: "RB", ovrRank: 89,  posRank: 30, adp: "91.0",  tier: 7, floor: "Mediocre", ceiling: "Good"},
  { name: "Jordan Mason",       team: "MIN", position: "RB", ovrRank: 90,  posRank: 31, adp: "119.2", tier: 7, mustDraft: true, underrated: true, floor: "Mediocre", ceiling: "Great"},
  { name: "Zach Charbonnet",    team: "SEA", position: "RB", ovrRank: 91,  posRank: 32, adp: "122.6", tier: 7, mustDraft: true, underrated: true, floor: "Mediocre", ceiling: "Great"},
  { name: "Jaylen Warren",      team: "PIT", position: "RB", ovrRank: 92,  posRank: 33, adp: "93.4",  tier: 7, floor: "Mediocre", ceiling: "Good"},
  { name: "Jakobi Meyers",      team: "LV",  position: "WR", ovrRank: 93,  posRank: 41, adp: "93.8",  tier: 7, floor: "Good", ceiling: "Good"},
  { name: "Cam Skattebo",       team: "NYG", position: "RB", ovrRank: 94,  posRank: 32, adp: "94.0",  tier: 7, floor: "Mediocre", ceiling: "Good"},
  { name: "Quinshon Judkins",   team: "CLE", position: "RB", ovrRank: 95,  posRank: 33, adp: "95.0",  tier: 7, floor: "Poor", ceiling: "Great"},
  { name: "Emeka Egbuka",       team: "TB",  position: "WR", ovrRank: 96,  posRank: 42, adp: "123.4", tier: 7, mustDraft: true, underrated: true, floor: "Mediocre", ceiling: "Great"},
  { name: "Josh Downs",         team: "IND", position: "WR", ovrRank: 97,  posRank: 42, adp: "124.4", tier: 7, underrated: true, floor: "Mediocre", ceiling: "Good"},
  { name: "Jauan Jennings",     team: "SF",  position: "WR", ovrRank: 98,  posRank: 43, adp: "99.8",  tier: 7, floor: "Mediocre", ceiling: "Good"},
  { name: "Travis Etienne Jr.", team: "JAC", position: "RB", ovrRank: 99,  posRank: 34, adp: "100.0", tier: 7, floor: "Poor", ceiling: "Good"},
  { name: "Matthew Golden",     team: "GB",  position: "WR", ovrRank: 100,  posRank: 44, adp: "101.0", tier: 7, floor: "Poor", ceiling: "Great"},
  { name: "Cooper Kupp",        team: "SEA", position: "WR", ovrRank: 101, posRank: 45, adp: "87.6",  tier: 7, overrated: true, floor: "Mediocre", ceiling: "Good"},
  // -- Tier 8: Depth/K/DST --
  { name: "Khalil Shakir",      team: "BUF", position: "WR", ovrRank: 102, posRank: 46, adp: "97.4",  tier: 8, floor: "Mediocre", ceiling: "Good"},
  { name: "Jayden Reed",        team: "GB",  position: "WR", ovrRank: 103, posRank: 47, adp: "110.0", tier: 8, floor: "Mediocre", ceiling: "Good"},
  { name: "Brandon Aubrey",     team: "DAL", position: "K",  ovrRank: 104, posRank: 1,  adp: "105.0", tier: 8, floor: "Great", ceiling: "Excellent"},
  
];

const positions = ["ALL", "QB", "RB", "WR", "TE", "DST", "K"] as const;

type SortKey = "rank" | "adp";

// Mobile Player Card Component
const PlayerCard = ({ player, index }: { player: Player; index: number }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: index * 0.02 }}
    className={`p-3 rounded-lg border shadow-sm bg-white hover:shadow-md transition-all duration-200 relative ${
      index % 2 === 0 ? 'bg-gray-50/50' : 'bg-white'
    }`}
  >
    <div className="flex items-start justify-between">
      <div className="flex-1 min-w-0 pr-20">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-lg font-bold text-gray-800">#{player.ovrRank}</span>
          <span className={`px-2 py-1 rounded-full text-xs font-semibold border ${getPositionColor(player.position)}`}>
            {player.position}
          </span>
          <span className={`px-2 py-1 rounded-full text-xs ${getTierColor(player.tier)}`}>
            T{player.tier}
          </span>
        </div>
        <h3 className="font-bold text-gray-900 text-base leading-tight mb-1">{player.name}</h3>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <span className="font-semibold">{player.team}</span>
          <span>#{player.posRank} {player.position}</span>
          <span>ADP: {player.adp}</span>
        </div>
      </div>
    </div>
    
    {/* 2x2 Grid anchored to right side with fixed column widths */}
    <div className="absolute top-3 right-3 bottom-3 grid grid-cols-2 grid-rows-2 gap-x-2 gap-y-2 text-xs" style={{ gridTemplateColumns: '90px 70px' }}>
      {/* Top Left: Must-Draft/Avoid */}
      <div className="flex items-center justify-end">
        {player.mustDraft && (
          <div className="flex items-center justify-center h-10 px-3 py-1.5 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-300 rounded-lg shadow-sm text-xs">
            <span className="text-green-700 font-semibold text-xs tracking-wide">Must-Draft</span>
          </div>
        )}
        {player.avoid && (
          <div className="flex items-center justify-center h-10 px-3 py-1.5 bg-gradient-to-r from-red-50 to-rose-50 border border-red-300 rounded-lg shadow-sm text-xs">
            <span className="text-red-700 font-semibold text-xs tracking-wide">Avoid</span>
          </div>
        )}
      </div>
      
      {/* Top Right: Ceiling */}
      <div className="flex flex-col items-center justify-center h-10 px-2 py-1 bg-gradient-to-br from-gray-50 to-slate-100 border border-gray-300 rounded-lg shadow-sm text-xs">
        <div className="text-xs text-gray-600 leading-tight font-medium">Ceiling</div>
        <div className={`font-semibold text-xs leading-tight tracking-wide ${getFloorCeilingColor(player.ceiling)}`}>
          {player.ceiling}
        </div>
      </div>
      
      {/* Bottom Left: Underrated/Overrated */}
      <div className="flex items-center justify-end">
        {player.underrated && (
          <div className="flex items-center justify-center h-10 px-3 py-1.5 bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-300 rounded-lg shadow-sm text-xs">
            <span className="text-blue-700 font-semibold text-xs tracking-wide">Underrated</span>
          </div>
        )}
        {player.overrated && (
          <div className="flex items-center justify-center h-10 px-3 py-1.5 bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-300 rounded-lg shadow-sm text-xs">
            <span className="text-orange-700 font-semibold text-xs tracking-wide">Overrated</span>
          </div>
        )}
      </div>
      
      {/* Bottom Right: Floor */}
      <div className="flex flex-col items-center justify-center h-10 px-2 py-1 bg-gradient-to-br from-gray-50 to-slate-100 border border-gray-300 rounded-lg shadow-sm text-xs">
        <div className="text-xs text-gray-600 leading-tight font-medium">Floor</div>
        <div className={`font-semibold text-xs leading-tight tracking-wide ${getFloorCeilingColor(player.floor)}`}>
          {player.floor}
        </div>
      </div>
    </div>
  </motion.div>
);

export default function FantasyDraftBoard() {
  const [activePos, setActivePos] = useState<string>("ALL");
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("rank");

  const sortedPlayers = useMemo(() => {
    return players
      .filter((p) => (activePos === "ALL" ? true : p.position === activePos))
      .filter((p) => p.name.toLowerCase().includes(search.toLowerCase()))
      .sort((a, b) =>
        sortKey === "rank" ? a.ovrRank - b.ovrRank : parseFloat(a.adp) - parseFloat(b.adp)
      );
  }, [activePos, search, sortKey]);

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
            <CardHeader className="bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-t-lg p-3 sm:p-4">
                      {/* Mobile Layout */}
        <div className="block sm:hidden space-y-3">
          <h2 className="text-xl font-bold text-center">
            {activePos === "ALL" ? "Overall Rankings" : `${activePos} Rankings`}
          </h2>
                <TabsList className="w-full bg-white/10 backdrop-blur-sm border border-white/20">
                  {positions.map((pos) => (
                    <TabsTrigger 
                      key={pos} 
                      value={pos} 
                      className="flex-1 capitalize text-white font-medium data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:font-bold transition-all duration-200 text-xs"
                    >
                      {pos === "ALL" ? "All" : pos}
                    </TabsTrigger>
                  ))}
                </TabsList>
                <div className="relative w-full">
                  <Input
                    placeholder="Search players…"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-10 bg-white/90 border-white/20 focus:bg-white focus:border-blue-300 transition-all duration-200"
                  />
                  <SearchIcon className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
                </div>
              </div>

              {/* Desktop Layout */}
              <div className="hidden sm:flex items-center justify-between">
                <h2 className="text-2xl font-bold flex items-center gap-2">
                  {activePos === "ALL" ? "Overall Rankings" : `${activePos} Rankings`}
                </h2>
                <div className="flex-1 flex justify-center">
                  <TabsList className="bg-white/10 backdrop-blur-sm border border-white/20">
                    {positions.map((pos) => (
                      <TabsTrigger 
                        key={pos} 
                        value={pos} 
                        className="capitalize text-white font-medium data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:font-bold transition-all duration-200"
                      >
                        {pos === "ALL" ? "Overall" : pos}
                      </TabsTrigger>
                    ))}
                  </TabsList>
                </div>
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
            </CardHeader>

            <CardContent className="p-0">
              {/* Mobile Card Layout */}
              <div className="block sm:hidden">
                <div className="p-3 space-y-2 max-h-[70vh] overflow-y-auto">
                  {sortedPlayers.map((player, index) => (
                    <PlayerCard key={player.ovrRank} player={player} index={index} />
                  ))}
                </div>
              </div>

              {/* Desktop Table Layout */}
              <div className="hidden sm:block">
                {/* Fixed Header */}
                <div className="bg-gradient-to-r from-gray-50 to-gray-100 border-b-2 border-gray-200 shadow-sm">
                  <div className="overflow-x-auto">
                    <Table className="min-w-max text-xs md:text-sm table-fixed w-full">
                      <colgroup>
                        <col className="w-12" />
                        <col className="w-16" />
                        <col className="w-40" />
                        <col className="w-16 hidden md:table-column" />
                        <col className="w-12" />
                        <col className="w-20" />
                        <col className="w-16" />
                        <col className="w-24" />
                        <col className="w-16" />
                        <col className="w-20" />
                        <col className="w-24" />
                        <col className="w-16" />
                        <col className="w-20" />
                      </colgroup>
                      <TableHeader>
                        <TableRow className="hover:bg-gray-100/50">
                          <TableCell className={`${headerClasses("rank")} bg-gradient-to-r from-gray-50 to-gray-100 font-bold text-gray-700`} onClick={() => setSortKey("rank")}>#</TableCell>
                          <TableCell className={`${headerClasses("adp")} bg-gradient-to-r from-gray-50 to-gray-100 font-bold text-gray-700`} onClick={() => setSortKey("adp")}>ADP</TableCell>
                          <TableCell className="bg-gradient-to-r from-gray-50 to-gray-100 font-bold text-gray-700">Player</TableCell>
                          <TableCell className="hidden md:table-cell bg-gradient-to-r from-gray-50 to-gray-100 font-bold text-gray-700">Team</TableCell>
                          <TableCell className="bg-gradient-to-r from-gray-50 to-gray-100 font-bold text-gray-700">Pos</TableCell>
                          <TableCell className="bg-gradient-to-r from-gray-50 to-gray-100 font-bold text-gray-700">Pos Rank</TableCell>
                          <TableCell className="bg-gradient-to-r from-gray-50 to-gray-100 font-bold text-gray-700">Tier</TableCell>
                          <TableCell className="bg-gradient-to-r from-gray-50 to-gray-100 font-bold text-gray-700">Must-Draft</TableCell>
                          <TableCell className="bg-gradient-to-r from-gray-50 to-gray-100 font-bold text-gray-700">Avoid</TableCell>
                          <TableCell className="bg-gradient-to-r from-gray-50 to-gray-100 font-bold text-gray-700">Overrated</TableCell>
                          <TableCell className="bg-gradient-to-r from-gray-50 to-gray-100 font-bold text-gray-700">Underrated</TableCell>
                          <TableCell className="bg-gradient-to-r from-gray-50 to-gray-100 font-bold text-gray-700">Floor</TableCell>
                          <TableCell className="bg-gradient-to-r from-gray-50 to-gray-100 font-bold text-gray-700">Ceiling</TableCell>
                        </TableRow>
                      </TableHeader>
                    </Table>
                  </div>
                </div>
                
                {/* Scrollable Content */}
                <div className="overflow-y-auto max-h-[65vh] overflow-x-auto">
                  <Table className="min-w-max text-xs md:text-sm table-fixed w-full">
                    <colgroup>
                      <col className="w-12" />
                      <col className="w-16" />
                      <col className="w-40" />
                      <col className="w-16 hidden md:table-column" />
                      <col className="w-12" />
                      <col className="w-20" />
                      <col className="w-16" />
                      <col className="w-24" />
                      <col className="w-16" />
                      <col className="w-20" />
                      <col className="w-24" />
                      <col className="w-16" />
                      <col className="w-20" />
                    </colgroup>
                    <TableBody>
                      {sortedPlayers.map((p, index) => (
                        <TableRow key={p.ovrRank} className={`hover:bg-blue-50 hover:shadow-md transition-all duration-200 ${index % 2 === 0 ? 'bg-gray-50/30' : 'bg-white'}`}>
                          <TableCell className="font-bold text-gray-700">{p.ovrRank}</TableCell>
                          <TableCell className="font-medium text-gray-600">{p.adp}</TableCell>
                          <TableCell className="font-bold text-gray-900">{p.name}</TableCell>
                          <TableCell className="hidden md:table-cell">
                            <span className="font-semibold text-gray-700">{p.team}</span>
                          </TableCell>
                          <TableCell>
                            <span className={`px-2 py-1 rounded-full text-xs font-semibold border ${getPositionColor(p.position)}`}>
                              {p.position}
                            </span>
                          </TableCell>
                          <TableCell className="font-semibold text-gray-700">{p.posRank}</TableCell>
                          <TableCell>
                            <span className={`px-2 py-1 rounded-full text-xs ${getTierColor(p.tier)}`}>
                              T{p.tier}
                            </span>
                          </TableCell>
                          <TableCell className="text-center">
                            {p.mustDraft && <span className="text-green-600 font-bold text-lg">✓</span>}
                          </TableCell>
                          <TableCell className="text-center">
                            {p.avoid && <span className="text-red-600 font-bold text-lg">✗</span>}
                          </TableCell>
                          <TableCell className="text-center">
                            {p.overrated && <span className="text-orange-600 font-bold text-lg">⬇</span>}
                          </TableCell>
                          <TableCell className="text-center">
                            {p.underrated && <span className="text-blue-600 font-bold text-lg">⬆</span>}
                          </TableCell>
                          <TableCell className={getFloorCeilingColor(p.floor)}>{p.floor}</TableCell>
                          <TableCell className={getFloorCeilingColor(p.ceiling)}>{p.ceiling}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
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
              <span className="text-green-600 font-bold">✓</span> Must-Draft
              <span className="text-red-600 font-bold">✗</span> Avoid  
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