'use client';

import React, { useState } from 'react';
import { 
  Calculator, 
  ShoppingBag, 
  ArrowRightLeft, 
  Plus, 
  Trash2, 
  CheckCircle, 
  DollarSign, 
  Users 
} from 'lucide-react';
import { calculateSplitBill } from '@/lib/tools/productivityHelpers';

export default function ProductivityToolsPage() {
  const [activeTab, setActiveTab] = useState<'split' | 'shopping'>('split');

  // Split Bill State
  const [subtotal, setSubtotal] = useState<number>(150000);
  const [tax, setTax] = useState<number>(10);
  const [service, setService] = useState<number>(5);
  const [people, setPeople] = useState<number>(3);

  const billResult = calculateSplitBill(subtotal, tax, service, people);

  // Shopping List State
  const [shoppingItems, setShoppingItems] = useState([
    { id: '1', title: 'Kertas HVS A4 80gsm (5 Rim)', completed: true, estimatedPrice: 250000 },
    { id: '2', title: 'Tinta Printer Epson Original', completed: false, estimatedPrice: 350000 },
    { id: '3', title: 'Banner 3x1m Flexi Korea', completed: false, estimatedPrice: 180000 },
  ]);
  const [newItemTitle, setNewItemTitle] = useState('');
  const [newItemPrice, setNewItemPrice] = useState('');

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemTitle.trim()) return;

    setShoppingItems([
      ...shoppingItems,
      {
        id: Date.now().toString(),
        title: newItemTitle,
        completed: false,
        estimatedPrice: Number(newItemPrice) || 0,
      },
    ]);
    setNewItemTitle('');
    setNewItemPrice('');
  };

  const toggleItem = (id: string) => {
    setShoppingItems(
      shoppingItems.map((item) =>
        item.id === id ? { ...item, completed: !item.completed } : item
      )
    );
  };

  const deleteItem = (id: string) => {
    setShoppingItems(shoppingItems.filter((item) => item.id !== id));
  };

  return (
    <div className="space-y-6 p-6 font-sans text-slate-100">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold bg-gradient-to-r from-white via-slate-200 to-cyan-400 bg-clip-text text-transparent">
          Productivity Tools
        </h1>
        <p className="text-slate-400 text-sm mt-0.5">
          Perkakas kalkulasi praktis dan pengelolaan kebutuhan logistik harian.
        </p>
      </div>

      {/* Tabs Switcher */}
      <div className="flex border-b border-slate-800 space-x-4">
        <button
          onClick={() => setActiveTab('split')}
          className={`pb-3 text-sm font-medium flex items-center gap-2 border-b-2 transition-all ${
            activeTab === 'split'
              ? 'border-cyan-400 text-cyan-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Calculator className="w-4 h-4" /> Split Bill Calculator
        </button>
        <button
          onClick={() => setActiveTab('shopping')}
          className={`pb-3 text-sm font-medium flex items-center gap-2 border-b-2 transition-all ${
            activeTab === 'shopping'
              ? 'border-cyan-400 text-cyan-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <ShoppingBag className="w-4 h-4" /> Shopping List Logistik
        </button>
      </div>

      {/* TAB 1: Split Bill */}
      {activeTab === 'split' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur-xl space-y-4">
            <h3 className="font-semibold text-slate-200">Input Tagihan</h3>
            
            <div>
              <label className="text-xs text-slate-400 block mb-1">Subtotal (Rp)</label>
              <input
                type="number"
                value={subtotal}
                onChange={(e) => setSubtotal(Number(e.target.value))}
                className="w-full bg-slate-800/80 border border-slate-700/80 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-slate-400 block mb-1">Pajak (%)</label>
                <input
                  type="number"
                  value={tax}
                  onChange={(e) => setTax(Number(e.target.value))}
                  className="w-full bg-slate-800/80 border border-slate-700/80 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-cyan-500"
                />
              </div>
              <div>
                <label className="text-xs text-slate-400 block mb-1">Service Fee (%)</label>
                <input
                  type="number"
                  value={service}
                  onChange={(e) => setService(Number(e.target.value))}
                  className="w-full bg-slate-800/80 border border-slate-700/80 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>

            <div>
              <label className="text-xs text-slate-400 block mb-1">Jumlah Orang</label>
              <input
                type="number"
                min="1"
                value={people}
                onChange={(e) => setPeople(Number(e.target.value))}
                className="w-full bg-slate-800/80 border border-slate-700/80 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          {/* Rincian Hasil */}
          <div className="p-6 rounded-2xl bg-gradient-to-br from-slate-900/80 via-slate-900/40 to-cyan-950/30 border border-cyan-500/20 backdrop-blur-xl space-y-4 flex flex-col justify-between">
            <div className="space-y-4">
              <h3 className="font-semibold text-cyan-400 flex items-center gap-2">
                <Users className="w-4 h-4" /> Rincian Pembagian
              </h3>
              
              <div className="space-y-2 text-sm text-slate-300">
                <div className="flex justify-between py-1 border-b border-slate-800">
                  <span>Subtotal</span>
                  <span>Rp {subtotal.toLocaleString('id-ID')}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-800">
                  <span>Pajak ({tax}%)</span>
                  <span>Rp {billResult.taxAmount.toLocaleString('id-ID')}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-800">
                  <span>Service Fee ({service}%)</span>
                  <span>Rp {billResult.serviceAmount.toLocaleString('id-ID')}</span>
                </div>
                <div className="flex justify-between py-2 font-bold text-white">
                  <span>Grand Total</span>
                  <span className="text-cyan-400">Rp {billResult.grandTotal.toLocaleString('id-ID')}</span>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-center">
              <span className="text-xs text-cyan-300 block">Bayar Per Orang ({people} orang)</span>
              <span className="text-2xl font-extrabold text-white mt-1 block">
                Rp {Math.ceil(billResult.perPersonShare).toLocaleString('id-ID')}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Shopping List */}
      {activeTab === 'shopping' && (
        <div className="space-y-4">
          <form onSubmit={handleAddItem} className="flex gap-2">
            <input
              type="text"
              placeholder="Nama barang kebutuhan..."
              value={newItemTitle}
              onChange={(e) => setNewItemTitle(e.target.value)}
              className="flex-1 bg-slate-900/60 border border-slate-800 rounded-xl px-4 py-2 text-white text-sm focus:outline-none focus:border-cyan-500"
            />
            <input
              type="number"
              placeholder="Est. Harga (Rp)"
              value={newItemPrice}
              onChange={(e) => setNewItemPrice(e.target.value)}
              className="w-40 bg-slate-900/60 border border-slate-800 rounded-xl px-4 py-2 text-white text-sm focus:outline-none focus:border-cyan-500"
            />
            <button
              type="submit"
              className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold px-4 py-2 rounded-xl text-sm flex items-center gap-1.5 transition-all"
            >
              <Plus className="w-4 h-4" /> Tambah
            </button>
          </form>

          <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur-xl divide-y divide-slate-800">
            {shoppingItems.map((item) => (
              <div key={item.id} className="py-3 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => toggleItem(item.id)}
                    className={`w-5 h-5 rounded border flex items-center justify-center ${
                      item.completed
                        ? 'bg-cyan-500 border-cyan-500 text-slate-950'
                        : 'border-slate-600 hover:border-cyan-400'
                    }`}
                  >
                    {item.completed && <CheckCircle className="w-4 h-4" />}
                  </button>
                  <span
                    className={`text-sm ${
                      item.completed ? 'line-through text-slate-500' : 'text-slate-200'
                    }`}
                  >
                    {item.title}
                  </span>
                </div>

                <div className="flex items-center gap-4">
                  <span className="text-xs font-mono text-slate-400">
                    Rp {item.estimatedPrice.toLocaleString('id-ID')}
                  </span>
                  <button
                    onClick={() => deleteItem(item.id)}
                    className="text-slate-500 hover:text-rose-400 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
