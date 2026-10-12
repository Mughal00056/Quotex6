import React, { useState, useRef, useMemo } from 'react';
import { useTrading } from '../context/TradingContext';
import { Asset } from '../types/trading';
import {
  X,
  Search,
  TrendingUp,
  TrendingDown,
  ChevronUp,
  ChevronDown,
  Plus,
  Check,
  ArrowUpDown
} from 'lucide-react';
import { formatPrice } from '../utils/chartMath';

interface AssetModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AssetModal: React.FC<AssetModalProps> = ({ isOpen, onClose }) => {
  const { assets, activeAsset, setActiveAsset } = useTrading();
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<'payout' | 'change' | 'name'>('payout');
  const [sortDirection, setSortDirection] = useState<'desc' | 'asc'>('desc');
  const listRef = useRef<HTMLDivElement>(null);

  const scrollUp = () => {
    if (listRef.current) {
      listRef.current.scrollBy({ top: -260, behavior: 'smooth' });
    }
  };

  const scrollDown = () => {
    if (listRef.current) {
      listRef.current.scrollBy({ top: 260, behavior: 'smooth' });
    }
  };

  const toggleSort = (type: 'payout' | 'change' | 'name') => {
    if (sortBy === type) {
      setSortDirection((prev) => (prev === 'desc' ? 'asc' : 'desc'));
    } else {
      setSortBy(type);
      setSortDirection('desc');
    }
  };

  const filteredAssets = useMemo(() => {
    let list = assets.filter((asset) => {
      const matchesSearch =
        asset.name.toLowerCase().includes(search.toLowerCase()) ||
        asset.symbol.toLowerCase().includes(search.toLowerCase());
      const matchesCategory =
        selectedCategory === 'ALL' || asset.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });

    return list.sort((a, b) => {
      let diff = 0;
      if (sortBy === 'payout') {
        diff = a.payout - b.payout;
      } else if (sortBy === 'change') {
        diff = a.change24h - b.change24h;
      } else if (sortBy === 'name') {
        diff = a.name.localeCompare(b.name);
      }
      return sortDirection === 'desc' ? -diff : diff;
    });
  }, [assets, search, selectedCategory, sortBy, sortDirection]);

  if (!isOpen) return null;

  const categories = ['ALL', 'Forex OTC', 'Crypto', 'Commodities', 'Stocks OTC', 'Indices'];

  const handleSelect = (asset: Asset) => {
    setActiveAsset(asset);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-2xl bg-[#111723] border border-[#232f45] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92dvh]">
        {/* Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 sm:py-4 border-b border-[#1f2a3d] bg-[#141b29]">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              Asset Market Selector ({assets.length}+)
              <span className="text-[10px] bg-emerald-500/20 text-emerald-400 font-semibold px-2 py-0.5 rounded-full border border-emerald-500/30">
                UP TO 94% PAYOUT
              </span>
            </h2>
          </div>

          {/* Square Up & Down Scroll Controls in Header */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={scrollUp}
              className="w-8 h-8 rounded-lg bg-[#172233] hover:bg-[#202f46] border border-[#26374f] hover:border-cyan-400 text-slate-300 hover:text-white flex items-center justify-center transition-all cursor-pointer shadow-xs active:scale-90"
              title="Scroll Up (Upar ka liya)"
            >
              <ChevronUp className="w-4 h-4 stroke-[2.5]" />
            </button>
            <button
              onClick={scrollDown}
              className="w-8 h-8 rounded-lg bg-[#172233] hover:bg-[#202f46] border border-[#26374f] hover:border-cyan-400 text-slate-300 hover:text-white flex items-center justify-center transition-all cursor-pointer shadow-xs active:scale-90"
              title="Scroll Down (Nicha ka liya)"
            >
              <ChevronDown className="w-4 h-4 stroke-[2.5]" />
            </button>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg text-slate-400 hover:text-white hover:bg-[#1f283a] flex items-center justify-center transition-colors ml-1 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Search & Category Filter */}
        <div className="p-4 border-b border-[#1b2536] bg-[#0f1420] space-y-3">
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search pairs (e.g. EUR/USD, BTC, Gold)..."
                className="w-full bg-[#161e2b] border border-[#253246] focus:border-cyan-500 rounded-xl py-2 pl-10 pr-4 text-xs text-white placeholder-slate-400 outline-none"
              />
            </div>

            {/* Square Sort Toggle Button */}
            <button
              onClick={() => toggleSort('payout')}
              className={`h-9 px-3 rounded-xl border flex items-center gap-1.5 text-xs font-bold transition-all cursor-pointer shrink-0 ${
                sortBy === 'payout'
                  ? 'bg-amber-400 text-slate-950 border-amber-300'
                  : 'bg-[#161e2b] text-slate-300 border-[#253246] hover:text-white'
              }`}
              title="Sort by Payout Up/Down"
            >
              <ArrowUpDown className="w-3.5 h-3.5" />
              <span>Payout {sortBy === 'payout' && (sortDirection === 'desc' ? '▼' : '▲')}</span>
            </button>
          </div>

          <div className="flex items-center justify-between gap-2 overflow-x-auto pb-0.5">
            <div className="flex items-center gap-1.5 flex-nowrap">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all shrink-0 cursor-pointer ${
                    selectedCategory === cat
                      ? 'bg-cyan-500 text-slate-950 font-bold'
                      : 'bg-[#17202e] text-slate-400 hover:text-slate-200 hover:bg-[#1e2a3c]'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Quick Up / Down Arrows in Categories Bar */}
            <div className="flex items-center gap-1 shrink-0">
              <button
                onClick={scrollUp}
                className="w-7 h-7 rounded-lg bg-[#141d2a] hover:bg-[#1e2a3c] border border-[#223046] hover:border-cyan-400 text-slate-300 hover:text-white flex items-center justify-center cursor-pointer transition-all active:scale-95"
                title="Scroll Up (Upar)"
              >
                <ChevronUp className="w-3.5 h-3.5 stroke-[2.5]" />
              </button>
              <button
                onClick={scrollDown}
                className="w-7 h-7 rounded-lg bg-[#141d2a] hover:bg-[#1e2a3c] border border-[#223046] hover:border-cyan-400 text-slate-300 hover:text-white flex items-center justify-center cursor-pointer transition-all active:scale-95"
                title="Scroll Down (Nicha)"
              >
                <ChevronDown className="w-3.5 h-3.5 stroke-[2.5]" />
              </button>
            </div>
          </div>
        </div>

        {/* Asset Table List */}
        <div ref={listRef} className="p-4 overflow-y-auto flex-1 relative">
          <div className="space-y-1.5 pb-12">
            {filteredAssets.map((asset) => {
              const isSelected = activeAsset.id === asset.id;
              const isPositive = asset.change24h >= 0;

              return (
                <div
                  key={asset.id}
                  onClick={() => handleSelect(asset)}
                  className={`w-full flex items-center justify-between p-3 rounded-xl border text-left transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-[#182436] border-cyan-500 shadow-md ring-1 ring-cyan-500/40'
                      : 'bg-[#141b27] border-[#202b3c] hover:bg-[#1b2536] text-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-[#202b3e] text-cyan-400 flex items-center justify-center font-bold text-xs border border-[#2b3a50] shrink-0">
                      {asset.symbol.split('/')[0] || asset.symbol.substring(0, 3)}
                    </div>
                    <div>
                      <div className="font-bold text-xs text-white flex items-center gap-1.5">
                        {asset.name}
                        {asset.isOtc && (
                          <span className="text-[9px] bg-slate-700/60 text-slate-300 px-1 py-0.2 rounded font-mono">
                            OTC
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] text-slate-400">{asset.category}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 sm:gap-6">
                    {/* Price & 24h Change */}
                    <div className="text-right">
                      <div className="font-mono-num text-xs font-bold text-white">
                        {formatPrice(asset.currentPrice, asset.decimalPlaces)}
                      </div>
                      <div
                        className={`text-[10px] font-bold flex items-center justify-end gap-0.5 ${
                          isPositive ? 'text-emerald-400' : 'text-rose-400'
                        }`}
                      >
                        {isPositive ? (
                          <TrendingUp className="w-3 h-3" />
                        ) : (
                          <TrendingDown className="w-3 h-3" />
                        )}
                        <span>{isPositive ? `+${asset.change24h}%` : `${asset.change24h}%`}</span>
                      </div>
                    </div>

                    {/* High Payout Badge */}
                    <div className="min-w-[65px] text-right">
                      <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-1 rounded-lg text-xs font-black font-mono-num">
                        +{asset.payout}%
                      </span>
                    </div>

                    {/* Square Button Add (+) to select/add asset */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSelect(asset);
                      }}
                      className={`w-8 h-8 rounded-lg border flex items-center justify-center transition-all cursor-pointer shadow-xs active:scale-90 shrink-0 ${
                        isSelected
                          ? 'bg-cyan-500 text-slate-950 border-cyan-400'
                          : 'bg-[#182333] hover:bg-emerald-500 hover:text-slate-950 border-[#26364d] hover:border-emerald-400 text-emerald-400'
                      }`}
                      title={isSelected ? 'Active Asset' : 'Square Button Add (Select Asset)'}
                    >
                      {isSelected ? (
                        <Check className="w-4 h-4 stroke-[3]" />
                      ) : (
                        <Plus className="w-4 h-4 stroke-[2.8]" />
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Floating Square Arrow Buttons in Bottom-Right for Upar / Nicha Scrolling */}
          <div className="sticky bottom-2 right-2 float-right flex flex-col gap-1.5 z-20">
            <button
              onClick={scrollUp}
              className="w-9 h-9 rounded-xl bg-[#121927]/95 hover:bg-cyan-500 text-cyan-400 hover:text-slate-950 border border-cyan-500/40 shadow-xl flex items-center justify-center transition-all cursor-pointer active:scale-90 backdrop-blur-md"
              title="Arrow Button Upar (Scroll Up)"
            >
              <ChevronUp className="w-5 h-5 stroke-[2.8]" />
            </button>
            <button
              onClick={scrollDown}
              className="w-9 h-9 rounded-xl bg-[#121927]/95 hover:bg-cyan-500 text-cyan-400 hover:text-slate-950 border border-cyan-500/40 shadow-xl flex items-center justify-center transition-all cursor-pointer active:scale-90 backdrop-blur-md"
              title="Arrow Button Nicha (Scroll Down)"
            >
              <ChevronDown className="w-5 h-5 stroke-[2.8]" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
