// src/App.tsx
import { useState } from "react";
import { Search, Map, Square, PenTool, ChevronRight } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { RadioGroup, RadioGroupItem } from "./components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { cn } from "./lib/utils";

function App() {
  const [isMapSettingsOpen, setIsMapSettingsOpen] = useState(true);
  const [isRisksOpen, setIsRisksOpen] = useState(false);
  const [isSummaryOpen, setIsSummaryOpen] = useState(false);

  return (
    <main className="relative h-screen w-screen overflow-hidden bg-slate-900">
      {/* Map background – replace with real map later */}
      <div className="absolute inset-0">
        <iframe
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d172533.42232593466!2d47.74686328319146!3d39.92615223262234!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x403c067bfb68d8e9%3A0xb228c41224c257c7!2sAgh%20Gol%20National%20Park!5e1!3m2!1sen!2saz!4v1765052880867!5m2!1sen!2saz"
          className="h-full w-full border-0"
          loading="lazy"
          allowFullScreen
          referrerPolicy="no-referrer-when-downgrade"
        />
        {/* slight dark overlay on top of map */}
        <div className="pointer-events-none absolute inset-0 bg-black/20" />
      </div>
      
      {/* Control panel */}
      <div className="pointer-events-none absolute inset-0 flex flex-col items-end justify-start gap-3 p-4 sm:p-6 lg:p-8 overflow-auto">
        <div className="pointer-events-auto w-full max-w-xs sm:max-w-sm rounded-4xl bg-white/20 p-2 backdrop-blur-xs">
          <div className="flex justify-between items-center bg-white p-4 rounded-3xl ">
            <div>
              <p>Suitability Score</p>
              <p className="text-sm text-gray-600">Based on water percentage change*</p>
            </div>
            <Label className="text-2xl text-green-600">72/100</Label>
          </div>
        </div>

        {/* Settings panel */}
        <Card className="pointer-events-auto w-full max-w-xs sm:max-w-sm rounded-4xl bg-white/10 backdrop-blur-[60px] border-0">
          <div className="px-6">
            <Button
              onClick={() => setIsMapSettingsOpen(!isMapSettingsOpen)}
              className="w-full ring-8 ring-white/20 flex items-center justify-between text-black text-base font-medium rounded-3xl p-4 bg-white hover:bg-white"
            >
              <span>Map Settings</span>
              <ChevronRight
                className={cn(
                  "h-5 w-5 text-gray-500 transition-transform",
                  isMapSettingsOpen && "rotate-90"
                )}
              />
            </Button>
          </div>


          {isMapSettingsOpen && (
            <CardContent className="space-y-6">
              {/* Location search */}
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-600" />
                <Input
                  placeholder="Location Search"
                  className="ring-8 ring-white/20 h-10 rounded-full bg-white pl-9 text-sm"
                />
              </div>

              {/* Lat / Lon */}
              <div className="flex w-full gap-2 bg-white/20 ring-8 ring-white/20 rounded-full">
                <Input
                  placeholder="Latitude"
                  className="h-9 rounded-full bg-white text-sm shadow-sm"
                />
                <Input
                  placeholder="Longitude"
                  className="h-9 rounded-full bg-white text-sm shadow-sm"
                />
              </div>

              {/* Date selectors */}
              <div className="flex flex-col gap-4 ring-8 ring-white/20 rounded-2xl bg-white/20">
                <div className="flex flex-col gap-2">
                  <p className="text-sm text-white ml-4">From</p>
                  <div className="flex gap-2 justify-between">
                    <Select>
                      <SelectTrigger className="w-full h-9 rounded-full bg-white text-sm shadow-sm">
                        <SelectValue placeholder="Year" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="2025">2025</SelectItem>
                        <SelectItem value="2024">2024</SelectItem>
                        <SelectItem value="2023">2023</SelectItem>
                      </SelectContent>
                    </Select>

                    <Select>
                      <SelectTrigger className="w-full h-9 rounded-full bg-white text-sm shadow-sm">
                        <SelectValue placeholder="Month" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">Jan</SelectItem>
                        <SelectItem value="2">Feb</SelectItem>
                        <SelectItem value="3">Mar</SelectItem>
                        <SelectItem value="4">Apr</SelectItem>
                        <SelectItem value="5">May</SelectItem>
                        <SelectItem value="6">Jun</SelectItem>
                        <SelectItem value="7">Jul</SelectItem>
                        <SelectItem value="8">Aug</SelectItem>
                        <SelectItem value="9">Sep</SelectItem>
                        <SelectItem value="10">Oct</SelectItem>
                        <SelectItem value="11">Nov</SelectItem>
                        <SelectItem value="12">Dec</SelectItem>
                      </SelectContent>
                    </Select>

                    <Select>
                      <SelectTrigger className="w-full h-9 rounded-full bg-white text-sm shadow-sm">
                        <SelectValue placeholder="Day" />
                      </SelectTrigger>
                      <SelectContent className="max-h-56">
                        {Array.from({ length: 31 }, (_, i) => (
                          <SelectItem key={i + 1} value={String(i + 1)}>
                            {i + 1}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <p className="text-sm text-white ml-4">To</p>
                  <div className="flex gap-2 justify-between">
                    <Select>
                      <SelectTrigger className="w-full h-9 rounded-full bg-white text-sm shadow-sm">
                        <SelectValue placeholder="Year" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="2025">2025</SelectItem>
                        <SelectItem value="2024">2024</SelectItem>
                        <SelectItem value="2023">2023</SelectItem>
                      </SelectContent>
                    </Select>

                    <Select>
                      <SelectTrigger className="w-full h-9 rounded-full bg-white text-sm shadow-sm">
                        <SelectValue placeholder="Month" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">Jan</SelectItem>
                        <SelectItem value="2">Feb</SelectItem>
                        <SelectItem value="3">Mar</SelectItem>
                        <SelectItem value="4">Apr</SelectItem>
                        <SelectItem value="5">May</SelectItem>
                        <SelectItem value="6">Jun</SelectItem>
                        <SelectItem value="7">Jul</SelectItem>
                        <SelectItem value="8">Aug</SelectItem>
                        <SelectItem value="9">Sep</SelectItem>
                        <SelectItem value="10">Oct</SelectItem>
                        <SelectItem value="11">Nov</SelectItem>
                        <SelectItem value="12">Dec</SelectItem>
                      </SelectContent>
                    </Select>

                    <Select>
                      <SelectTrigger className="w-full h-9 rounded-full bg-white text-sm shadow-sm">
                        <SelectValue placeholder="Day" />
                      </SelectTrigger>
                      <SelectContent className="max-h-56">
                        {Array.from({ length: 31 }, (_, i) => (
                          <SelectItem key={i + 1} value={String(i + 1)}>
                            {i + 1}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Grid options */}
              <div className="space-y-2 rounded-2xl ring-8 ring-white/20 bg-white/20">
                <label className="flex items-center gap-2 text-sm p-3 rounded-full bg-white text-gray-600">
                  <Checkbox className="h-4 w-4" />
                  <span>Sentinel-2 Grid (Tile ID)</span>
                </label>
                <label className="flex items-center gap-2 text-sm p-3 rounded-full bg-white text-gray-600">
                  <Checkbox className="h-4 w-4 " />
                  <span>Landsat Grid (WRS2 Path/Row)</span>
                </label>
              </div>
              
              <div className="space-y-2 rounded-2xl ring-8 ring-white/20 bg-white/20">
                <label className="flex items-center gap-2 text-sm p-3 rounded-full bg-white text-gray-600">
                  <Checkbox className="h-4 w-4" />
                  <span>AOI Boundary</span>
                </label>
                <label className="flex items-center gap-2 text-sm p-3 rounded-full bg-white text-gray-600">
                  <Checkbox className="h-4 w-4 " />
                  <span>Water maks</span>
                </label>
                <label className="flex items-center gap-2 text-sm p-3 rounded-full bg-white text-gray-600">
                  <Checkbox className="h-4 w-4 " />
                  <span>NDWI Heatmap</span>
                </label>
              </div>


              {/* Product Type – single choice select with 4 options */}
              <div className="rounded-full ring-8 ring-white/20 bg-white/20">
                <RadioGroup className="flex gap-2 justify-between">
                  <div className="flex w-full items-center space-x-2 rounded-full bg-white text-gray-600 p-3">
                    <RadioGroupItem value="baseline"/>
                    <Label className="text-sm font-normal">Baseline Period</Label>
                  </div>

                  <div className="flex w-full items-center space-x-2 rounded-full bg-white text-gray-600 p-3">
                    <RadioGroupItem value="current"/>
                    <Label className="text-sm font-normal">Current Period</Label>
                  </div>
                </RadioGroup>
              </div>

              {/* Bottom toolbar */}
              <div className="flex items-center justify-between gap-2 pt-1">
                <ToggleGroup type="single" className="rounded-full bg-white p-1">
                  <ToggleGroupItem value="map" className="h-8 w-8 rounded-xl">
                    <Map className="h-4 w-4" />
                  </ToggleGroupItem>
                  <ToggleGroupItem value="polygon" className="h-8 w-8 rounded-xl">
                    <Square className="h-4 w-4" />
                  </ToggleGroupItem>
                  <ToggleGroupItem value="imagery" className="h-8 w-8 rounded-xl">
                    <PenTool className="h-4 w-4" />
                  </ToggleGroupItem>
                </ToggleGroup>

                <Button
                  size="sm"
                  className=" h-9 rounded-full px-4 text-sm font-medium shadow"
                >
                  Apply Filters
                </Button>
              </div>
            </CardContent>
          )}
        </Card>
        
        {/* Risks panel */}
        <Card className="pointer-events-auto w-full max-w-xs sm:max-w-sm rounded-4xl bg-white/10 backdrop-blur-[60px] border-0">
          <div className="px-6">
            <Button
              onClick={() => setIsRisksOpen(!isRisksOpen)}
              className="w-full ring-8 ring-white/20 flex items-center justify-between text-black text-base font-medium rounded-3xl p-4 bg-white hover:bg-white"
            >
              <span>Risks</span>
              <ChevronRight
                className={cn(
                  "h-5 w-5 text-gray-500 transition-transform",
                  isRisksOpen && "rotate-90"
                )}
              />
            </Button>
          </div>


          {isRisksOpen && (
            <CardContent className="space-y-6">
              <div className="flex flex-col gap-2 ring-8 ring-white/20 rounded-3xl bg-white/20">
                <div className="flex justify-between items-center bg-white p-4 rounded-3xl ">
                  <p className="text-black/60">Flood Risk</p>
                  <div className="flex flex-col text-end">
                    <Label className="text-xl self-end text-amber-300">Medium</Label>
                    <p className="text-xs text-gray-600">Based on water percentage change*</p>
                  </div>
                </div>

                <div className="flex justify-between items-center bg-white p-4 rounded-3xl ">
                  <p className="text-black/60">Dryness Risk</p>
                  <div className="flex flex-col text-end">
                    <Label className="text-xl self-end text-green-500">Low</Label>
                    <p className="text-xs text-gray-600">Based on water percentage change*</p>
                  </div>
                </div>

                <div className="flex justify-between items-center bg-white p-4 rounded-3xl ">
                  <p className="text-black/60">Shoreline Risk</p>
                  <div className="flex flex-col text-end">
                    <Label className="text-xl self-end text-amber-300">Medium</Label>
                    <p className="text-xs text-gray-600">Based on water percentage change*</p>
                  </div>
                </div>

                <div className="flex justify-between items-center bg-white p-4 rounded-3xl ">
                  <p className="text-black/60">Seasonality</p>
                  <div className="flex flex-col text-end">
                    <Label className="text-xl self-end text-red-600">Strong</Label>
                    <p className="text-xs text-gray-600">Based on water percentage change*</p>
                  </div>
                </div>
              </div>
            </CardContent>
          )}
        </Card>
        
        {/* Summary panel */}
        <Card className="pointer-events-auto w-full max-w-xs sm:max-w-sm rounded-4xl bg-white/10 backdrop-blur-[60px] border-0">
          <div className="px-6">
            <Button
              onClick={() => setIsSummaryOpen(!isSummaryOpen)}
              className="w-full ring-8 ring-white/20 flex items-center justify-between text-black text-base font-medium rounded-3xl p-4 bg-white hover:bg-white"
            >
              <span>Summary</span>
              <ChevronRight
                className={cn(
                  "h-5 w-5 text-gray-500 transition-transform",
                  isSummaryOpen && "rotate-90"
                )}
              />
            </Button>
          </div>


          {isSummaryOpen && (
            <CardContent className="space-y-6">
              <div className="flex flex-col gap-2 ring-8 ring-white/20 rounded-3xl bg-white/20">
                <div className="flex justify-between items-center bg-white p-4 rounded-3xl">
                  <div>
                    <p className="text-black/60">Suitability Score</p>
                    <p className="text-xs text-gray-600">Based on water percentage change*</p>
                  </div>
                  <Label className="text-2xl text-green-600">72/100</Label>
                </div>

                <div className="flex flex-col bg-white p-4 rounded-3xl gap-2">
                  <p className="text-black/60">Flood Risk</p>
                  <ul className="list-disc pl-6 text-black/60 text-sm">
                    <li>High Water Levels</li>
                    <li>Rapid Flow Increase</li>
                    <li>Soil Saturation</li>
                    <li>Rainfall Surge</li>
                    <li>Critical Threshold</li>
                  </ul>
                </div>

                <div className="flex flex-col bg-white p-4 rounded-3xl gap-2">
                  <p className="text-black/60">Water Snapshot</p>
                  <ul className="list-disc pl-6 text-black/60 text-sm">
                    <li>High Water Levels</li>
                    <li>Rapid Flow Increase</li>
                    <li>Soil Saturation</li>
                    <li>Rainfall Surge</li>
                    <li>Critical Threshold</li>
                  </ul>
                </div>
              </div>
              
              <div className="flex flex-col gap-2 ring-8 ring-white/20 rounded-3xl bg-white/20">                
                <div className="flex gap-2">
                  <div className="w-full flex flex-col bg-white p-4 rounded-3xl gap-2">
                    <p className="text-black/60">Flood Risk</p>
                    <ul className="list-disc pl-6 text-black/60 text-xs">
                      <li>High Water Levels</li>
                      <li>Rapid Flow </li>
                      <li>Soil </li>
                      <li>Rainfall Surge</li>
                      <li>Critical Threshold</li>
                    </ul>
                  </div>

                  <div className="w-full flex flex-col bg-white p-4 rounded-3xl gap-2">
                    <p className="text-black/60">Water Snapshot</p>
                    <ul className="list-disc pl-6 text-black/60 text-xs">
                      <li>High Water Levels</li>
                      <li>Rapid Flow Increase</li>
                      <li>Soil Saturation</li>
                      <li>Rainfall Surge</li>
                      <li>Critical Threshold</li>
                    </ul>
                  </div>
                </div>

                <div className="flex flex-col gap-1 bg-white p-4 rounded-3xl">
                  <p className="text-black/60">Difference</p>
                  <ul className="list-disc pl-6 text-black/60 text-xs">
                    <li>High Water Levels</li>
                  </ul>
                </div>
              </div>

              <div className="flex flex-col gap-2 ring-8 ring-white/20 rounded-3xl bg-white/20">
                <div className="flex flex-col bg-white p-4 rounded-3xl gap-2">
                  <p className="text-black/60">Risk Breakdown</p>
                  <ul className="list-disc pl-6 text-black/60 text-sm">
                    <li>High Water Levels</li>
                    <li>Rapid Flow Increase</li>
                    <li>Soil Saturation</li>
                    <li>Rainfall Surge</li>
                    <li>Critical Threshold</li>
                  </ul>
                </div>

                <div className="flex flex-col bg-white p-4 rounded-3xl gap-2">
                  <p className="text-black/60">Outlook Panel</p>
                  <ul className="list-disc pl-6 text-black/60 text-sm">
                    <li>High Water Levels</li>
                    <li>Rapid Flow Increase</li>
                    <li>Soil Saturation</li>
                    <li>Rainfall Surge</li>
                    <li>Critical Threshold</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          )}
        </Card>
      </div>
    </main>
  );
}

export default App;
