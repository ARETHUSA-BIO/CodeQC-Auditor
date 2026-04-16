/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Code2, 
  Search, 
  AlertCircle, 
  CheckCircle2, 
  AlertTriangle, 
  ArrowRight, 
  Zap, 
  RefreshCcw,
  Terminal,
  ShieldCheck,
  Cpu,
  FileCode
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { cn } from './lib/utils';
import { analysisCode, QCResult, QCIssue } from './services/gemini';

export default function App() {
  const [code, setCode] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<QCResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleAnalyze = async () => {
    if (!code.trim()) return;
    setIsAnalyzing(true);
    setError(null);
    try {
      const data = await analysisCode(code);
      setResult(data);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Analysis failed. Please check your script and try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getIssueIcon = (type: QCIssue['type']) => {
    switch (type) {
      case 'error': return <AlertCircle className="w-5 h-5 text-red-500" />;
      case 'warning': return <AlertTriangle className="w-5 h-5 text-amber-500" />;
      case 'suggestion': return <Zap className="w-5 h-5 text-blue-500" />;
    }
  };

  return (
    <div className="min-h-screen immersive-grid pb-20 selection:bg-blue-500/30">
      {/* App Header */}
      <header className="h-[64px] bg-[#14161d] border-b border-white/10 flex items-center justify-between px-8 sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <div className="w-6 h-6 bg-gradient-to-br from-[#3b82f6] to-[#8b5cf6] rounded-[6px] shadow-[0_0_15px_rgba(59,130,246,0.4)]" />
          <h1 className="text-lg font-semibold tracking-tight text-[#f8fafc]">QC Code Studio</h1>
        </div>
        <div className="px-3 py-1 bg-green-500/10 border border-green-500/20 rounded-md text-[11px] font-bold uppercase tracking-widest text-[#10b981]">
          Session Active
        </div>
      </header>

      <main className="max-w-[1400px] mx-auto px-8 py-10">
        <div className="grid lg:grid-cols-[1fr_400px] grid-cols-1 gap-1">
          
          {/* Main Editor Section */}
          <section className="panel-card rounded-l-xl overflow-hidden flex flex-col min-h-[700px]">
            <div className="panel-header flex justify-between items-center">
              <div className="flex items-center gap-3">
                <FileCode className="w-3.5 h-3.5" />
                <span>Code Preview: analysis_target.py</span>
              </div>
              {code && (
                <button 
                  onClick={() => setCode('')}
                  className="text-[10px] font-mono hover:text-red-400 transition-colors uppercase tracking-widest flex items-center gap-1.5 opacity-60 hover:opacity-100"
                >
                  <RefreshCcw className="w-3 h-3" />
                  Clear Buffer
                </button>
              )}
            </div>
            
            <div className="relative flex-1 bg-[#0f1115]">
              <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-radial-gradient from-blue-500/10 to-transparent pointer-events-none" />
              <textarea
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="Paste Colab script or Python logic here..."
                className="w-full h-full bg-transparent p-8 font-mono text-[14px] leading-relaxed resize-none focus:outline-none transition-all placeholder:text-slate-700 text-slate-300"
                spellCheck={false}
              />
            </div>

            <div className="p-6 bg-[#14161d]/50 border-t border-white/5 flex gap-4">
              <button
                onClick={handleAnalyze}
                disabled={isAnalyzing || !code.trim()}
                className={cn(
                  "flex-1 py-3 px-6 rounded-lg font-semibold text-sm uppercase tracking-widest transition-all",
                  isAnalyzing || !code.trim()
                    ? "bg-white/5 text-slate-600 cursor-not-allowed"
                    : "btn-immersive-primary"
                )}
              >
                {isAnalyzing ? (
                  <span className="flex items-center justify-center gap-2">
                    <RefreshCcw className="w-4 h-4 animate-spin" />
                    Executing Logic Trace...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    Run QC Analysis <ArrowRight className="w-4 h-4" />
                  </span>
                )}
              </button>
              <button className="px-6 py-3 btn-immersive-secondary rounded-lg font-semibold text-sm uppercase tracking-widest">
                Export
              </button>
            </div>
          </section>

          {/* Results Sidebar */}
          <section className="panel-card rounded-r-xl overflow-hidden flex flex-col bg-[#0a0b0e]/50 border-l-0">
            <div className="panel-header flex items-center gap-3">
              <Cpu className="w-3.5 h-3.5" />
              <span>QC Diagnostics</span>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              <AnimatePresence mode="wait">
                {!result && !isAnalyzing ? (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="h-full flex flex-col items-center justify-center text-center p-8 border-2 border-dashed border-white/5 rounded-xl opacity-40"
                  >
                    <Search className="w-12 h-12 mb-4" />
                    <p className="text-sm font-mono uppercase tracking-widest">Awaiting Input</p>
                  </motion.div>
                ) : isAnalyzing ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map(i => (
                      <div key={i} className="h-24 bg-white/5 animate-pulse rounded-lg" />
                    ))}
                  </div>
                ) : result ? (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="space-y-6"
                  >
                    {/* Score Metric */}
                    <div className="bg-[#14161d] border border-white/10 rounded-xl p-5 relative overflow-hidden group">
                      <div className="absolute top-0 left-0 w-1 h-full bg-blue-500" />
                      <div className="mono-label text-slate-500 mb-2">Code Quality Score</div>
                      <div className="text-4xl font-bold text-[#f8fafc] group-hover:text-blue-400 transition-colors">
                        {result.score}<span className="text-xl text-slate-600">%</span>
                      </div>
                    </div>

                    {/* Summary */}
                    <div className="p-4 bg-white/5 border border-white/5 rounded-lg text-sm leading-relaxed text-slate-400 italic">
                      {result.summary}
                    </div>

                    {/* Issues */}
                    <div className="space-y-3">
                      <div className="mono-label text-slate-600 border-b border-white/5 pb-2">Diagnostic Reports ({result.issues.length})</div>
                      {result.issues.map((issue, idx) => (
                        <div key={idx} className="p-4 bg-[#14161d] border border-white/10 rounded-xl space-y-3 hover:border-white/20 transition-all">
                          <div className="flex items-center gap-3">
                            {getIssueIcon(issue.type)}
                            <span className="font-bold text-[12px] uppercase tracking-wide">{issue.title}</span>
                          </div>
                          <p className="text-sm text-slate-400 leading-snug">{issue.description}</p>
                          {issue.fix && (
                            <div className="p-3 bg-green-500/5 border border-green-500/10 rounded-lg text-xs text-green-400 font-mono italic">
                              Fix: <span className="text-slate-300">{issue.fix}</span>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>

                    {/* Optimizations */}
                    <div className="space-y-3">
                      <div className="mono-label text-slate-600 border-b border-white/5 pb-2">Optimization Path</div>
                      {result.suggestedOptimizations.map((opt, i) => (
                        <div key={i} className="flex items-center gap-3 text-xs text-slate-400 py-1">
                          <div className="w-1 h-1 rounded-full bg-blue-500 shadow-[0_0_5px_#3b82f6]" />
                          {opt}
                        </div>
                      ))}
                    </div>
                  </motion.div>
                ) : null}
              </AnimatePresence>
            </div>
          </section>
        </div>
      </main>

      {/* Action Footer */}
      <footer className="fixed bottom-0 left-0 w-full h-[60px] bg-[#14161d] border-t border-white/10 px-8 flex items-center justify-between text-slate-500 z-50">
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-2">
            <Zap className="w-3.5 h-3.5 text-blue-500" />
            <span className="text-[11px] font-bold uppercase tracking-wider">High Accuracy Mode</span>
          </div>
          <div className="h-4 w-px bg-white/10" />
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-3.5 h-3.5 text-green-500" />
            <span className="text-[11px] font-bold uppercase tracking-wider">Integrity Verified</span>
          </div>
        </div>
        <div className="flex items-center gap-4 text-[11px] font-mono">
          <span className="opacity-50">Logic Engine:</span>
          <span className="text-slate-300">Gemini-3.1-Pro</span>
          <div className="h-4 w-px bg-white/10" />
          <span className="opacity-50">Lat:</span>
          <span className="text-slate-300 tracking-tighter">0.34ms</span>
        </div>
      </footer>

      {error && (
        <div className="fixed bottom-20 right-8 p-4 bg-red-500/10 border border-red-500/20 text-red-500 rounded-lg text-sm flex items-center gap-3 animate-in fade-in slide-in-from-right-4">
          <AlertCircle className="w-5 h-5" />
          {error}
        </div>
      )}
    </div>
  );
}


