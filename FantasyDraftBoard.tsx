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

// helper for tag rendering
const tagIcon = (flag?: boolean) => (flag ? "✓" : "");

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
  { name: "Jayden Reed",        team: "GB",  position: "WR", ovrRank: 102, posRank: 46, adp: "110.0", tier: 8, floor: "Mediocre", ceiling: "Good"},
  { name: "Khalil Shakir",      team: "BUF", position: "WR", ovrRank: 102, posRank: 47, adp: "97.4",  tier: 8, floor: "Mediocre", ceiling: "Good"},
  { name: "Brandon Aubrey",     team: "DAL", position: "K",  ovrRank: 103, posRank: 1,  adp: "105.0", tier: 8, floor: "Great", ceiling: "Excellent"},
  
];

const positions = ["ALL", "QB", "RB", "WR", "TE", "DST", "K"] as const;

type SortKey = "rank" | "adp";

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
    `cursor-pointer select-none ${sortKey === key ? "underline font-semibold" : ""}`;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="container mx-auto p-4 grid gap-4">
      <h1 className="text-3xl font-bold text-center">2025 Fantasy Football Draft Board (PPR)</h1>

      {/* Main Content */}
      <Tabs value={activePos} onValueChange={setActivePos} className="w-full">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">
                {activePos === "ALL" ? "Overall Rankings" : `${activePos} Rankings`}
              </h2>
              <div className="flex-1 flex justify-center">
                <TabsList className="bg-transparent">
                  {positions.map((pos) => (
                    <TabsTrigger key={pos} value={pos} className="capitalize">
                      {pos === "ALL" ? "Overall" : pos}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </div>
              <div className="relative w-60">
                <Input
                  placeholder="Search players…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                />
                <SearchIcon className="absolute left-3 top-2.5 h-4 w-4 opacity-70" />
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {/* Fixed Header */}
            <div className="bg-gray-100 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
              <div className="overflow-x-auto">
                <Table className="min-w-max text-xs md:text-sm table-fixed w-full">
                  <colgroup>
                    <col className="w-12" />
                    <col className="w-16" />
                    <col className="w-40" />
                    <col className="w-16 hidden md:table-column" />
                    <col className="w-12" />
                    <col className="w-20" />
                    <col className="w-12" />
                    <col className="w-24" />
                    <col className="w-16" />
                    <col className="w-20" />
                    <col className="w-24" />
                    <col className="w-16" />
                    <col className="w-20" />
                  </colgroup>
                  <TableHeader>
                    <TableRow className="hover:bg-gray-100 dark:hover:bg-gray-800">
                      <TableCell className={`${headerClasses("rank")} bg-gray-100 dark:bg-gray-800`} onClick={() => setSortKey("rank")}>#</TableCell>
                      <TableCell className={`${headerClasses("adp")} bg-gray-100 dark:bg-gray-800`} onClick={() => setSortKey("adp")}>ADP</TableCell>
                      <TableCell className="bg-gray-100 dark:bg-gray-800">Player</TableCell>
                      <TableCell className="hidden md:table-cell bg-gray-100 dark:bg-gray-800">Team</TableCell>
                      <TableCell className="bg-gray-100 dark:bg-gray-800">Pos</TableCell>
                      <TableCell className="bg-gray-100 dark:bg-gray-800">Pos Rank</TableCell>
                      <TableCell className="bg-gray-100 dark:bg-gray-800">Tier</TableCell>
                      <TableCell className="bg-gray-100 dark:bg-gray-800">Must-Draft</TableCell>
                      <TableCell className="bg-gray-100 dark:bg-gray-800">Avoid</TableCell>
                      <TableCell className="bg-gray-100 dark:bg-gray-800">Overrated</TableCell>
                      <TableCell className="bg-gray-100 dark:bg-gray-800">Underrated</TableCell>
                      <TableCell className="bg-gray-100 dark:bg-gray-800">Floor</TableCell>
                      <TableCell className="bg-gray-100 dark:bg-gray-800">Ceiling</TableCell>
                    </TableRow>
                  </TableHeader>
                </Table>
              </div>
            </div>
            
            {/* Scrollable Content */}
            <div className="overflow-y-auto max-h-[60vh] overflow-x-auto">
              <Table className="min-w-max text-xs md:text-sm table-fixed w-full">
                <colgroup>
                  <col className="w-12" />
                  <col className="w-16" />
                  <col className="w-40" />
                  <col className="w-16 hidden md:table-column" />
                  <col className="w-12" />
                  <col className="w-20" />
                  <col className="w-12" />
                  <col className="w-24" />
                  <col className="w-16" />
                  <col className="w-20" />
                  <col className="w-24" />
                  <col className="w-16" />
                  <col className="w-20" />
                </colgroup>
                <TableBody>
                  {sortedPlayers.map((p) => (
                    <TableRow key={p.ovrRank} className="hover:bg-blue-50 dark:hover:bg-blue-700">
                      <TableCell>{p.ovrRank}</TableCell>
                      <TableCell>{p.adp}</TableCell>
                      <TableCell className="font-medium">{p.name}</TableCell>
                      <TableCell className="hidden md:table-cell">{p.team}</TableCell>
                      <TableCell>{p.position}</TableCell>
                      <TableCell>{p.posRank}</TableCell>
                      <TableCell>{p.tier}</TableCell>
                      <TableCell>{tagIcon(p.mustDraft)}</TableCell>
                      <TableCell>{tagIcon(p.avoid)}</TableCell>
                      <TableCell>{tagIcon(p.overrated)}</TableCell>
                      <TableCell>{tagIcon(p.underrated)}</TableCell>
                      <TableCell>{p.floor}</TableCell>
                      <TableCell>{p.ceiling}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </Tabs>

      <footer className="text-center text-xs text-gray-500 dark:text-gray-400 py-6">
        Click "#" or "ADP" to sort • ✓ = tag enabled • Data: FantasyPros snapshot (Aug 7 2025)
      </footer>
    </motion.div>
  );
}