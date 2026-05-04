/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Trophy, ClipboardList, Key, History, Clock, CheckCircle, Info, MessageSquare } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Member, KeyType, SelectionRecord } from './types';
import { Roulette } from './components/Roulette';

const STORAGE_KEY_MEMBERS = 'ichijo_badminton_members';
const STORAGE_KEY_HISTORY = 'ichijo_badminton_history';

const DEFAULT_MEMBERS: Member[] = [
  { id: '1', name: '佐藤' },
  { id: '2', name: '鈴木' },
  { id: '3', name: '高橋' },
  { id: '4', name: '田中' },
];

const KEY_RETURN_RULES = [
  { id: '1', text: '体育教官室への入室時、学年・組・氏名・部活名をハッキリと告げる。' },
  { id: '2', text: '教官室に入り、中にいるすべての教師に対して挨拶を行う。' },
  { id: '3', text: 'カギを所定の場所へ返却する。' },
  { id: '4', text: '退出時も、中にいるすべての教師に対して挨拶をしてから退出する。' },
];

export default function App() {
  const [members, setMembers] = useState<Member[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_MEMBERS);
    return saved ? JSON.parse(saved) : DEFAULT_MEMBERS;
  });
  const [history, setHistory] = useState<SelectionRecord[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_HISTORY);
    return saved ? JSON.parse(saved) : [];
  });
  const [newName, setNewName] = useState('');
  const [selectedKey, setSelectedKey] = useState<KeyType>('clubhouse');
  const [lastWinner, setLastWinner] = useState<SelectionRecord | null>(null);
  const [isSpinning, setIsSpinning] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [showRules, setShowRules] = useState(false);
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_MEMBERS, JSON.stringify(members));
  }, [members]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_HISTORY, JSON.stringify(history));
  }, [history]);

  const addMember = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!newName.trim()) return;
    const newMember: Member = { id: Date.now().toString(), name: newName.trim() };
    setMembers([...members, newMember]);
    setNewName('');
  };

  const removeMember = (id: string) => {
    setMembers(members.filter(m => m.id !== id));
  };

  const handleResult = (member: Member) => {
    const record: SelectionRecord = {
      id: Date.now().toString(),
      memberId: member.id,
      memberName: member.name,
      keyType: selectedKey,
      timestamp: Date.now(),
    };
    setLastWinner(record);
    setHistory([record, ...history].slice(0, 50)); 
  };

  const keyLabels: Record<KeyType, string> = {
    clubhouse: '部室',
    gym: '体育館',
    other: 'その他'
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans flex flex-col pb-10">
      {/* Navbar */}
      <nav className="bg-white/80 backdrop-blur-md border-b border-slate-200 px-6 py-4 flex justify-between items-center sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-100">
            <Trophy className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-black tracking-tight text-slate-900 leading-none">鍵ルーレット</h1>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mt-1">Ichijo Badminton Club</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => setShowRules(true)}
            className="w-11 h-11 rounded-2xl bg-white border border-slate-200 flex items-center justify-center transition-all hover:bg-slate-50 active:scale-95 shadow-sm text-indigo-500"
          >
            <Info className="w-6 h-6" />
          </button>
          <button 
            onClick={() => setShowHistory(true)}
            className="w-11 h-11 rounded-2xl bg-white border border-slate-200 flex items-center justify-center transition-all hover:bg-slate-50 active:scale-95 shadow-sm text-slate-500"
          >
            <History className="w-6 h-6" />
          </button>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto w-full px-5 pt-6 lg:pt-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          
          {/* Settings & Members (Left on Desktop) */}
          <div className="lg:col-span-5 flex flex-col gap-8 order-2 lg:order-1">
            {/* Key Selector */}
            <section className="bg-white rounded-[2.5rem] p-7 shadow-sm border border-slate-200/60">
              <h2 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-6 flex items-center gap-2">
                <Key className="w-4 h-4 text-indigo-500" /> 返却する鍵を選択
              </h2>
              <div className="grid grid-cols-3 gap-3">
                {(['clubhouse', 'gym', 'other'] as KeyType[]).map((type) => (
                  <button
                    key={type}
                    onClick={() => setSelectedKey(type)}
                    className={`py-4 rounded-2xl border-2 font-bold transition-all relative overflow-hidden ${
                      selectedKey === type 
                        ? 'bg-indigo-600 border-indigo-600 text-white shadow-xl shadow-indigo-100 scale-[1.02]' 
                        : 'bg-white border-slate-200 text-slate-400 hover:border-slate-300'
                    }`}
                  >
                    <span className="relative z-10">{keyLabels[type]}</span>
                    {selectedKey === type && (
                      <motion.div 
                        layoutId="activeTab"
                        className="absolute inset-0 bg-white/10"
                        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                      />
                    )}
                  </button>
                ))}
              </div>
            </section>

            {/* Member Management */}
            <section className="bg-white rounded-[2.5rem] p-7 shadow-sm border border-slate-200/60 flex flex-col min-h-[400px]">
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-black text-xl flex items-center gap-2">
                  <ClipboardList className="w-6 h-6 text-indigo-600" />
                  メンバー <span className="text-sm text-slate-400 font-bold bg-slate-100 px-2 py-0.5 rounded-lg ml-1">{members.length}人</span>
                </h3>
                {members.length > 0 && (
                  <button 
                    onClick={() => { if(confirm('全員削除しますか？')) setMembers([]); }}
                    className="text-xs font-bold text-slate-300 hover:text-rose-500 transition-colors"
                  >
                    一括削除
                  </button>
                )}
              </div>

              <form onSubmit={addMember} className="flex gap-2 mb-6">
                <input 
                  type="text" 
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="追加する名前..." 
                  className="flex-1 bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-bold placeholder:text-slate-300"
                />
                <button 
                  type="submit"
                  className="bg-indigo-600 text-white w-14 h-14 rounded-2xl flex items-center justify-center hover:bg-indigo-500 transition-all shadow-lg active:scale-90"
                >
                  <Plus className="w-7 h-7" />
                </button>
              </form>

              <div className="flex-1 overflow-y-auto max-h-[350px] pr-1 custom-scrollbar">
                <div className="flex flex-wrap gap-2">
                  <AnimatePresence>
                    {members.map((m) => (
                      <motion.div 
                        key={m.id}
                        layout
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        className="bg-slate-50 border border-slate-100 rounded-2xl pl-4 pr-2 py-2 flex items-center gap-1 group transition-all hover:bg-white hover:border-indigo-100"
                      >
                        <span className="font-black text-slate-600 text-sm tracking-tight">{m.name}</span>
                        <button 
                          onClick={() => removeMember(m.id)}
                          className="p-2 text-slate-300 hover:text-rose-500 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
                {members.length === 0 && (
                  <div className="text-center py-10 bg-slate-50/50 rounded-3xl border border-dashed border-slate-200">
                    <p className="text-slate-400 text-sm font-bold italic">メンバーを追加してください</p>
                  </div>
                )}
              </div>
            </section>
          </div>

          {/* Roulette Stage (Right on Desktop) */}
          <div className="lg:col-span-7 flex flex-col items-center justify-center order-1 lg:order-2 py-4 lg:py-0">
            <Roulette 
              members={members} 
              onResult={handleResult} 
              isSpinning={isSpinning} 
              setIsSpinning={setIsSpinning} 
            />
            
            <div className="mt-12 hidden lg:block text-center space-y-2">
               <p className="text-slate-400 text-xs font-bold uppercase tracking-widest opacity-60">
                 Ichijo Badminton Club - Key Management Tool
               </p>
               <div className="flex justify-center gap-6">
                 <div className="flex items-center gap-2 text-slate-300">
                   <div className="w-1.5 h-1.5 rounded-full bg-slate-300"></div>
                   <span className="text-[10px] font-black">シャトル整理</span>
                 </div>
                 <div className="flex items-center gap-2 text-slate-300">
                   <div className="w-1.5 h-1.5 rounded-full bg-slate-300"></div>
                   <span className="text-[10px] font-black">忘れ物確認</span>
                 </div>
                 <div className="flex items-center gap-2 text-slate-300">
                   <div className="w-1.5 h-1.5 rounded-full bg-slate-300"></div>
                   <span className="text-[10px] font-black">完全消灯</span>
                 </div>
               </div>
            </div>
          </div>

        </div>
      </main>


      {/* Result Modal - High Visibility */}
      <AnimatePresence>
        {lastWinner && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setLastWinner(null)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 100, opacity: 0 }}
              className="relative w-full max-w-sm bg-white rounded-[3rem] p-10 shadow-3xl text-center overflow-hidden border border-slate-100"
            >
              <div className="absolute top-0 left-0 w-full h-2.5 bg-gradient-to-r from-indigo-300 via-indigo-600 to-indigo-300"></div>
              
              <motion.div 
                animate={{ 
                  scale: [1, 1.2, 1],
                  rotate: [0, 10, -10, 0]
                }}
                className="mt-4 mb-8 relative inline-block"
              >
                <div className="absolute inset-0 bg-amber-400 blur-2xl opacity-20 animate-pulse"></div>
                <div className="w-24 h-24 bg-amber-50 rounded-[2.5rem] flex items-center justify-center text-amber-500 mx-auto border-4 border-white shadow-xl relative">
                  <Trophy className="w-12 h-12" />
                </div>
              </motion.div>

              <p className="text-slate-400 text-sm font-black uppercase tracking-[0.2em] mb-2">本日の返却担当</p>
              <h2 className="text-5xl font-black text-slate-900 mb-8 tracking-tighter">
                {lastWinner.memberName} <span className="text-2xl text-slate-300 font-bold italic -ml-1">さん</span>
              </h2>

              <div className="bg-slate-50 rounded-3xl p-6 border border-slate-100 mb-8 text-left flex items-start gap-4">
                <div className="w-12 h-12 bg-white rounded-2xl shadow-sm flex items-center justify-center flex-shrink-0 text-indigo-600 border border-slate-100">
                  <Key className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-400 text-xs uppercase tracking-wider mb-1">返却対象</h4>
                  <p className="text-indigo-600 text-xl font-black">{keyLabels[lastWinner.keyType]}のカギ</p>
                </div>
              </div>

              <div className="space-y-4 mb-10 text-left px-2">
                <div className="flex items-center gap-3 text-slate-500 text-sm font-bold">
                  <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                    <CheckCircle className="w-3 h-3 text-emerald-600" />
                  </div>
                  <span>窓の閉め忘れ・消灯を確認</span>
                </div>
                <div className="flex items-center gap-3 text-slate-500 text-sm font-bold">
                  <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                    <CheckCircle className="w-3 h-3 text-emerald-600" />
                  </div>
                  <span>忘れ物がないかチェック</span>
                </div>
              </div>

              <button 
                onClick={() => setLastWinner(null)}
                className="w-full py-5 bg-indigo-600 text-white rounded-[1.5rem] font-black text-lg shadow-xl shadow-indigo-100 active:scale-95 transition-all hover:bg-black"
              >
                確認完了
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* RULES MODAL */}
      <AnimatePresence>
        {showRules && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowRules(false)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-sm bg-white rounded-[2.5rem] p-8 shadow-2xl overflow-hidden"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600">
                  <MessageSquare className="w-6 h-6" />
                </div>
                <h2 className="text-xl font-black text-slate-800">返却のルール</h2>
              </div>

              <div className="space-y-4 mb-8">
                {KEY_RETURN_RULES.map((rule, idx) => (
                  <div key={rule.id} className="flex gap-4">
                    <div className="w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[10px] font-black shrink-0 mt-0.5">
                      {idx + 1}
                    </div>
                    <p className="text-sm font-bold text-slate-600 leading-relaxed text-left">
                      {rule.text}
                    </p>
                  </div>
                ))}
              </div>

              <button 
                onClick={() => setShowRules(false)}
                className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black shadow-lg"
              >
                了解しました
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* History Side Panel */}
      <AnimatePresence>
        {showHistory && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowHistory(false)}
              className="fixed inset-0 bg-slate-900/30 backdrop-blur-sm z-40"
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              className="fixed top-0 right-0 bottom-0 w-full max-w-sm bg-white z-50 p-8 flex flex-col shadow-2xl rounded-l-[3rem]"
            >
              <div className="flex items-center justify-between mb-10">
                <h2 className="text-2xl font-black tracking-tight text-slate-900">返却履歴</h2>
                <button 
                  onClick={() => setShowHistory(false)}
                  className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center hover:bg-slate-100 transition-colors"
                >
                  <Plus className="w-8 h-8 rotate-45 text-slate-400" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto space-y-4 pr-1 custom-scrollbar">
                {history.map(record => (
                  <div key={record.id} className="p-6 bg-slate-50 border border-slate-100 rounded-[2rem] hover:bg-white hover:shadow-lg hover:shadow-slate-100 transition-all group">
                    <div className="flex justify-between items-start mb-3">
                       <div className="flex items-center gap-2">
                         <div className="w-2 h-2 rounded-full bg-indigo-400"></div>
                         <span className="text-[10px] font-black text-slate-400 uppercase">
                           {new Date(record.timestamp).toLocaleString('ja-JP', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                         </span>
                       </div>
                       <span className="px-3 py-1 bg-indigo-50 text-indigo-600 text-[10px] font-black rounded-full border border-indigo-100">
                         {keyLabels[record.keyType]}
                       </span>
                    </div>
                    <p className="font-black text-2xl text-slate-800 tracking-tight group-hover:text-indigo-600 transition-colors">{record.memberName}</p>
                  </div>
                ))}
                {history.length === 0 && (
                  <div className="flex flex-col items-center justify-center py-20 text-slate-300 gap-4 opacity-50">
                    <div className="bg-slate-50 p-6 rounded-[2rem]">
                      <History className="w-12 h-12" />
                    </div>
                    <p className="font-black text-sm uppercase tracking-widest">No Logs Found</p>
                  </div>
                )}
              </div>

              {history.length > 0 && (
                <button 
                  onClick={() => {
                    if (confirm('履歴をすべて削除しますか？')) setHistory([]);
                  }}
                  className="mt-8 text-rose-500 font-bold text-xs py-5 rounded-[1.5rem] bg-rose-50 border border-rose-100 hover:bg-rose-100 transition-colors uppercase tracking-widest"
                >
                  Clear All History
                </button>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
