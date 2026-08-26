'use client';

import { useState } from 'react';
import { Popover, PopoverButton, PopoverPanel } from '@headlessui/react';
import { CalendarDaysIcon, ChevronDownIcon } from '@heroicons/react/20/solid';

export type PresetKey =
  | 'latest'
  | 'previous_day'
  | 'last_7_days'
  | 'this_month'
  | 'previous_month'
  | 'last_1_month'
  | 'last_3_months'
  | 'last_6_months'
  | 'year_to_date'
  | 'last_1_year'
  | 'custom';

export interface DateRangeValue {
  preset: PresetKey;
  startDate: string; // YYYY-MM-DD
  endDate: string;   // YYYY-MM-DD
  label: string;
}

const PRESETS: { key: PresetKey; label: string }[] = [
  { key: 'latest', label: 'Latest' },
  { key: 'previous_day', label: 'Previous Day' },
  { key: 'last_7_days', label: 'Last 7 Days' },
  { key: 'this_month', label: 'This Month' },
  { key: 'previous_month', label: 'Previous Month' },
  { key: 'last_1_month', label: 'Last 1 Month' },
  { key: 'last_3_months', label: 'Last 3 Months' },
  { key: 'last_6_months', label: 'Last 6 Months' },
  { key: 'year_to_date', label: 'Year to Date' },
  { key: 'last_1_year', label: 'Last 1 Year' },
  { key: 'custom', label: 'Custom Date Range' },
];

function formatDate(d: Date): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function calculateDatesForPreset(
  preset: PresetKey,
  customStart?: string,
  customEnd?: string
): { startDate: string; endDate: string; label: string } {
  const now = new Date();
  const todayStr = formatDate(now);

  switch (preset) {
    case 'latest':
      return { startDate: todayStr, endDate: todayStr, label: 'Latest' };

    case 'previous_day': {
      const yesterday = new Date();
      yesterday.setDate(now.getDate() - 1);
      const yStr = formatDate(yesterday);
      return { startDate: yStr, endDate: yStr, label: 'Previous Day' };
    }

    case 'last_7_days': {
      const past = new Date();
      past.setDate(now.getDate() - 6);
      return { startDate: formatDate(past), endDate: todayStr, label: 'Last 7 Days' };
    }

    case 'this_month': {
      const start = new Date(now.getFullYear(), now.getMonth(), 1);
      const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      return { startDate: formatDate(start), endDate: formatDate(end), label: 'This Month' };
    }

    case 'previous_month': {
      const start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const end = new Date(now.getFullYear(), now.getMonth(), 0);
      return { startDate: formatDate(start), endDate: formatDate(end), label: 'Previous Month' };
    }

    case 'last_1_month': {
      const past = new Date();
      past.setDate(now.getDate() - 30);
      return { startDate: formatDate(past), endDate: todayStr, label: 'Last 1 Month' };
    }

    case 'last_3_months': {
      const past = new Date();
      past.setDate(now.getDate() - 90);
      return { startDate: formatDate(past), endDate: todayStr, label: 'Last 3 Months' };
    }

    case 'last_6_months': {
      const past = new Date();
      past.setDate(now.getDate() - 180);
      return { startDate: formatDate(past), endDate: todayStr, label: 'Last 6 Months' };
    }

    case 'year_to_date': {
      const start = new Date(now.getFullYear(), 0, 1);
      return { startDate: formatDate(start), endDate: todayStr, label: 'Year to Date' };
    }

    case 'last_1_year': {
      const past = new Date();
      past.setFullYear(now.getFullYear() - 1);
      return { startDate: formatDate(past), endDate: todayStr, label: 'Last 1 Year' };
    }

    case 'custom':
      return {
        startDate: customStart || todayStr,
        endDate: customEnd || todayStr,
        label: `${customStart || todayStr} s/d ${customEnd || todayStr}`,
      };
  }
}

interface Props {
  value: DateRangeValue;
  onChange: (val: DateRangeValue) => void;
}

export default function DateRangeFilter({ value, onChange }: Props) {
  const [selectedPreset, setSelectedPreset] = useState<PresetKey>(value.preset);
  const [customStart, setCustomStart] = useState<string>(value.startDate);
  const [customEnd, setCustomEnd] = useState<string>(value.endDate);

  const handleApply = (close: () => void) => {
    const res = calculateDatesForPreset(selectedPreset, customStart, customEnd);
    onChange({
      preset: selectedPreset,
      startDate: res.startDate,
      endDate: res.endDate,
      label: res.label,
    });
    close();
  };

  return (
    <div className="w-full sm:w-auto relative text-left">
      <Popover className="relative">
        {({ close }) => (
          <>
            <PopoverButton className="w-full sm:w-auto flex items-center justify-between sm:justify-start gap-2 py-2 px-4 rounded-full bg-white text-sm font-poppins border border-gray-300 focus:outline-none focus:border-main-blue hover:border-gray-400 transition cursor-pointer">
              <div className="flex items-center gap-2 min-w-0">
                <CalendarDaysIcon className="h-4 w-4 shrink-0 text-main-blue" />
                <span className="font-medium text-gray-800 truncate">{value.label}</span>
                <span className="text-xs text-gray-400 hidden xs:inline truncate">
                  ({value.startDate === value.endDate ? value.startDate : `${value.startDate} - ${value.endDate}`})
                </span>
              </div>
              <ChevronDownIcon className="h-4 w-4 shrink-0 text-gray-500 ml-1" />
            </PopoverButton>

            <PopoverPanel
              transition
              className="absolute z-30 right-0 mt-2 w-[calc(100vw-2rem)] max-w-sm sm:w-96 rounded-2xl bg-white p-4 border border-gray-300 focus:outline-none transition data-closed:opacity-0 data-leave:duration-100 data-leave:ease-in"
            >
              <div className="text-sm font-semibold text-gray-800 mb-3 pb-2 border-b border-gray-200">
                Filter Rentang Waktu
              </div>

              {/* LIST RADIO PRESETS */}
              <div className="space-y-1 max-h-56 sm:max-h-64 overflow-y-auto pr-1">
                {PRESETS.map((p) => {
                  const isChecked = selectedPreset === p.key;
                  return (
                    <label
                      key={p.key}
                      className={`flex items-center justify-between px-3 py-2 rounded-xl text-sm cursor-pointer transition select-none ${
                        isChecked ? 'bg-blue-50 text-main-blue font-semibold' : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      <span className="truncate mr-2">{p.label}</span>
                      <input
                        type="radio"
                        name="dateRangePreset"
                        value={p.key}
                        checked={isChecked}
                        onChange={() => setSelectedPreset(p.key)}
                        className="h-4 w-4 text-main-blue border-gray-300 cursor-pointer accent-main-blue shrink-0"
                      />
                    </label>
                  );
                })}
              </div>

              {/* CUSTOM DATE RANGE INPUTS */}
              {selectedPreset === 'custom' && (
                <div className="mt-3 pt-3 border-t border-gray-200 grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Start Date</label>
                    <input
                      type="date"
                      value={customStart}
                      onChange={(e) => setCustomStart(e.target.value)}
                      className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-gray-300 focus:outline-none focus:border-main-blue"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">End Date</label>
                    <input
                      type="date"
                      value={customEnd}
                      min={customStart}
                      onChange={(e) => setCustomEnd(e.target.value)}
                      className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-gray-300 focus:outline-none focus:border-main-blue"
                    />
                  </div>
                </div>
              )}

              {/* ACTION BUTTON */}
              <div className="mt-4 pt-3 border-t border-gray-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => close()}
                  className="px-3 py-1.5 text-xs font-medium text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-100 transition cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={() => handleApply(close)}
                  className="px-4 py-1.5 text-xs font-semibold text-white bg-main-blue hover:bg-main-blue/90 rounded-lg transition cursor-pointer"
                >
                  Apply
                </button>
              </div>
            </PopoverPanel>
          </>
        )}
      </Popover>
    </div>
  );
}
