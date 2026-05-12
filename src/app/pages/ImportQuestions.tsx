import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Upload, FileText, CheckCircle, AlertCircle, X, Download,
  Edit2, Trash2, Plus, ChevronRight, File, FileSpreadsheet,
  FileCode, Loader2
} from 'lucide-react';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import { useQuiz, generateId } from '../store/quizStore';
import { NavSidebar } from '../components/NavSidebar';
import { AdminPageSkeleton } from '../components/Skeletons';
import { Question, Category, Difficulty } from '../store/types';

/* ─── helpers ─── */
const CATEGORIES: Category[] = ['Quran', 'Hadith', 'Seerah', 'Aqeedah', 'Fiqh', 'General Knowledge'];
const DIFFICULTIES: Difficulty[] = ['Easy', 'Medium', 'Hard'];

function normalizeCategory(val: string): Category {
  const l = (val ?? '').toLowerCase().trim();
  if (l.includes('quran') || l.includes("qur'an")) return 'Quran';
  if (l.includes('hadith')) return 'Hadith';
  if (l.includes('seerah') || l.includes('sirah')) return 'Seerah';
  if (l.includes('aqeedah') || l.includes('aqidah') || l.includes('creed')) return 'Aqeedah';
  if (l.includes('fiqh') || l.includes('jurisprudence')) return 'Fiqh';
  return 'General Knowledge';
}
function normalizeDifficulty(val: string): Difficulty {
  const l = (val ?? '').toLowerCase().trim();
  if (l.includes('hard') || l.includes('difficult')) return 'Hard';
  if (l.includes('medium') || l.includes('intermediate')) return 'Medium';
  return 'Easy';
}

/* ─── Q&A row type ─── */
interface ParsedRow {
  question: string;
  answer: string;
  category: Category;
  difficulty: Difficulty;
}

/* ─── Parse structured rows (CSV/Excel) ─── */
function parseStructuredRows(raw: Record<string, string>[]): ParsedRow[] {
  return raw
    .map(row => ({
      question: (row.question || row.Question || row.QUESTION || row.Q || '').trim(),
      answer: (row.answer || row.Answer || row.ANSWER || row.A || '').trim(),
      category: normalizeCategory(row.category || row.Category || row.CATEGORY || ''),
      difficulty: normalizeDifficulty(row.difficulty || row.Difficulty || row.DIFFICULTY || ''),
    }))
    .filter(r => r.question && r.answer);
}

/* ─── Smart text parser for DOCX/PDF ─── */
function parseTextToQuestions(rawText: string): ParsedRow[] {
  const results: ParsedRow[] = [];
  const lines = rawText.split('\n').map(l => l.trim()).filter(l => l.length > 0);

  // Pass 1 — Q: / A: pattern
  for (let i = 0; i < lines.length; i++) {
    if (/^(q\s*:|question\s*:)\s*/i.test(lines[i])) {
      const q = lines[i].replace(/^(q\s*:|question\s*:)\s*/i, '').trim();
      let j = i + 1;
      while (j < lines.length && j < i + 5 && !/^(a\s*:|answer\s*:|ans\s*:)\s*/i.test(lines[j])) j++;
      if (j < lines.length && /^(a\s*:|answer\s*:|ans\s*:)\s*/i.test(lines[j])) {
        const a = lines[j].replace(/^(a\s*:|answer\s*:|ans\s*:)\s*/i, '').trim();
        if (q && a) { results.push({ question: q, answer: a, category: 'General Knowledge', difficulty: 'Medium' }); i = j; }
      }
    }
  }
  if (results.length > 0) return results;

  // Pass 2 — numbered "1. Question\nAnswer: ..."
  for (let i = 0; i < lines.length; i++) {
    const numMatch = lines[i].match(/^(\d+)[\.\)]\s+(.+)$/);
    if (numMatch) {
      const q = numMatch[2].trim();
      let j = i + 1;
      // skip blank-ish lines
      while (j < lines.length && j < i + 5 && !/^(answer|ans|a)\s*[:\.]/i.test(lines[j])) {
        j++;
      }
      if (j < lines.length && /^(answer|ans|a)\s*[:\.]/i.test(lines[j])) {
        const a = lines[j].replace(/^(answer|ans|a)\s*[:\.]?\s*/i, '').trim();
        if (q && a) { results.push({ question: q, answer: a, category: 'General Knowledge', difficulty: 'Medium' }); i = j; }
      }
    }
  }
  if (results.length > 0) return results;

  // Pass 3 — alternating lines (odd = question, even = answer)
  for (let i = 0; i + 1 < lines.length; i += 2) {
    const q = lines[i].replace(/^\d+[\.\)]\s*/, '').trim();
    const a = lines[i + 1].replace(/^(answer|ans|a\s*[:\.]\s*)/i, '').trim();
    if (q.length > 10 && a.length > 1 && q.endsWith('?')) {
      results.push({ question: q, answer: a, category: 'General Knowledge', difficulty: 'Medium' });
    }
  }

  return results;
}

/* ─── File type icon ─── */
function FileIcon({ ext }: { ext: string }) {
  if (ext === 'pdf') return <FileCode className="w-5 h-5 text-red-500" />;
  if (ext === 'docx' || ext === 'doc') return <FileText className="w-5 h-5 text-blue-500" />;
  if (ext === 'xlsx' || ext === 'xls') return <FileSpreadsheet className="w-5 h-5 text-green-600" />;
  return <File className="w-5 h-5 text-gray-400" />;
}

/* ═══════════════════════════════════════════════ COMPONENT ═══════════════════════════════ */
export default function ImportQuestions() {
  const { state, dispatch } = useQuiz();
  const [loading, setLoading] = useState(true);
  const [preview, setPreview] = useState<ParsedRow[] | null>(null);
  const [fileName, setFileName] = useState('');
  const [fileExt, setFileExt] = useState('');
  const [error, setError] = useState('');
  const [processing, setProcessing] = useState(false);
  const [imported, setImported] = useState(0);
  const [skipped, setSkipped] = useState(0);
  const [dragOver, setDragOver] = useState(false);
  const [editIdx, setEditIdx] = useState<number | null>(null);
  const [editRow, setEditRow] = useState<ParsedRow | null>(null);
  const [rawTextView, setRawTextView] = useState('');
  const [showRawText, setShowRawText] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 500);
    return () => clearTimeout(t);
  }, []);

  /* ─── extractors ─── */
  async function extractDocx(file: File): Promise<string> {
    const mammoth = await import('mammoth');
    const ab = await file.arrayBuffer();
    const result = await mammoth.default.extractRawText({ arrayBuffer: ab });
    return result.value;
  }

  async function extractPdf(file: File): Promise<string> {
    const pdfjsLib = await import('pdfjs-dist');
    // Set worker src — try local package path first, fallback to unpkg CDN
    try {
      (pdfjsLib as any).GlobalWorkerOptions.workerSrc = new URL(
        'pdfjs-dist/build/pdf.worker.min.mjs',
        import.meta.url,
      ).href;
    } catch {
      (pdfjsLib as any).GlobalWorkerOptions.workerSrc =
        `https://unpkg.com/pdfjs-dist@${(pdfjsLib as any).version}/build/pdf.worker.min.mjs`;
    }

    const ab = await file.arrayBuffer();
    const loadingTask = (pdfjsLib as any).getDocument({ data: new Uint8Array(ab) });
    const pdf = await loadingTask.promise;
    let text = '';
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      const pageText = (content.items as any[])
        .map((item: any) => item.str)
        .join(' ');
      text += pageText + '\n';
    }
    return text;
  }

  /* ─── main handler ─── */
  async function handleFile(file: File) {
    setError('');
    setPreview(null);
    setImported(0);
    setSkipped(0);
    setRawTextView('');
    const ext = file.name.split('.').pop()?.toLowerCase() ?? '';
    setFileName(file.name);
    setFileExt(ext);
    setProcessing(true);

    try {
      if (ext === 'csv') {
        Papa.parse(file, {
          header: true,
          skipEmptyLines: true,
          complete: (result) => {
            const rows = parseStructuredRows(result.data as Record<string, string>[]);
            setProcessing(false);
            if (rows.length === 0) { setError('No valid Q&A rows found. Check column names: Question, Answer, Category, Difficulty'); return; }
            setPreview(rows);
          },
          error: () => { setProcessing(false); setError('Failed to parse CSV file.'); },
        });
        return;
      }

      if (ext === 'xlsx' || ext === 'xls') {
        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            const wb = XLSX.read(e.target?.result, { type: 'binary' });
            const ws = wb.Sheets[wb.SheetNames[0]];
            const raw = XLSX.utils.sheet_to_json<Record<string, string>>(ws);
            const rows = parseStructuredRows(raw);
            setProcessing(false);
            if (rows.length === 0) { setError('No valid Q&A rows found. Check column names: Question, Answer.'); return; }
            setPreview(rows);
          } catch (_) { setProcessing(false); setError('Failed to parse Excel file.'); }
        };
        reader.readAsBinaryString(file);
        return;
      }

      if (ext === 'docx' || ext === 'doc') {
        const text = await extractDocx(file);
        setRawTextView(text);
        const rows = parseTextToQuestions(text);
        setProcessing(false);
        if (rows.length === 0) {
          setError('Could not auto-detect Q&A pairs. Please ensure the document uses a supported format (e.g., "Q: ... / A: ..." or numbered lists with answers).');
          setShowRawText(true);
          return;
        }
        setPreview(rows);
        return;
      }

      if (ext === 'pdf') {
        const text = await extractPdf(file);
        setRawTextView(text);
        const rows = parseTextToQuestions(text);
        setProcessing(false);
        if (rows.length === 0) {
          setError('Could not auto-detect Q&A pairs from the PDF. Check the raw extracted text and ensure the document uses a supported format.');
          setShowRawText(true);
          return;
        }
        setPreview(rows);
        return;
      }

      setProcessing(false);
      setError('Unsupported format. Use CSV, Excel (XLSX/XLS), Word (DOCX), or PDF.');
    } catch (err: any) {
      setProcessing(false);
      setError(`Extraction failed: ${err?.message || 'Unknown error'}`);
    }
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }

  function handleImport() {
    if (!preview) return;
    const existingSet = new Set(state.questions.map(q => q.question.toLowerCase().trim()));
    const newQs: Question[] = [];
    let skip = 0;
    preview.forEach(row => {
      if (existingSet.has(row.question.toLowerCase().trim())) { skip++; }
      else { newQs.push({ id: generateId(), ...row, used: false }); existingSet.add(row.question.toLowerCase().trim()); }
    });
    dispatch({ type: 'ADD_QUESTIONS', payload: newQs });
    setImported(newQs.length);
    setSkipped(skip);
    setPreview(null);
  }

  function deletePreviewRow(i: number) {
    if (!preview) return;
    setPreview(preview.filter((_, idx) => idx !== i));
  }

  function saveEdit() {
    if (editIdx === null || !editRow || !preview) return;
    const updated = [...preview];
    updated[editIdx] = editRow;
    setPreview(updated);
    setEditIdx(null);
    setEditRow(null);
  }

  function downloadTemplate() {
    const csv = 'Question,Answer,Category,Difficulty\n' +
      '"What is the first pillar of Islam?","Shahada (Declaration of Faith)",General Knowledge,Easy\n' +
      '"How many times a day do Muslims pray?","Five (Fajr, Dhuhr, Asr, Maghrib, Isha)",Fiqh,Easy\n' +
      '"What does Bismillah mean?","In the name of Allah",Quran,Easy\n' +
      '"Who was the last Prophet?","Prophet Muhammad ﷺ",Seerah,Easy\n';
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'mssn_questions_template.csv'; a.click();
    URL.revokeObjectURL(url);
  }

  const inputStyle = "w-full px-3 py-2 rounded-lg text-sm text-gray-800 outline-none focus:ring-2 focus:ring-green-500 bg-white";
  const inputBorder = { border: '1px solid #d1d5db' };

  return (
    <NavSidebar>
      {loading ? (
        <AdminPageSkeleton rows={4} />
      ) : (
      <div className="min-h-full" style={{ background: '#f3f6f4' }}>
        {/* Header */}
        <div className="bg-white border-b border-gray-100 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-bold text-gray-900 flex items-center gap-2">
                <Upload className="w-5 h-5" style={{ color: '#0B5D3B' }} />
                Import Questions
              </h1>
              <p className="text-xs text-gray-400 mt-0.5">
                Upload CSV, Excel, Word (.docx), or PDF — questions are auto-extracted
              </p>
            </div>
            <button
              onClick={downloadTemplate}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
              style={{ border: '1px solid #e5e7eb' }}
            >
              <Download className="w-4 h-4" />
              CSV Template
            </button>
          </div>
        </div>

        <div className="max-w-3xl mx-auto p-4 md:p-6 space-y-5">
          {/* Supported formats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 md:gap-3">
            {[
              { ext: 'CSV', icon: FileSpreadsheet, color: '#16a34a', bg: '#dcfce7', note: 'Structured table' },
              { ext: 'XLSX / XLS', icon: FileSpreadsheet, color: '#15803d', bg: '#f0fdf4', note: 'Excel workbook' },
              { ext: 'DOCX / DOC', icon: FileText, color: '#1d4ed8', bg: '#dbeafe', note: 'Word document' },
              { ext: 'PDF', icon: FileCode, color: '#dc2626', bg: '#fee2e2', note: 'Scanned or typed' },
            ].map(fmt => {
              const Icon = fmt.icon;
              return (
                <div
                  key={fmt.ext}
                  className="bg-white rounded-xl p-4 flex flex-col items-center text-center gap-2"
                  style={{ border: '1px solid #e5ebe7' }}
                >
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center"
                    style={{ background: fmt.bg }}
                  >
                    <Icon className="w-5 h-5" style={{ color: fmt.color }} />
                  </div>
                  <p className="text-xs font-bold text-gray-700">{fmt.ext}</p>
                  <p className="text-xs text-gray-400">{fmt.note}</p>
                </div>
              );
            })}
          </div>

          {/* Format hint for DOCX/PDF */}
          <div
            className="px-4 py-3 rounded-xl text-sm"
            style={{ background: '#fffbeb', border: '1px solid #fde68a' }}
          >
            <p className="font-semibold text-yellow-800 mb-1">DOCX / PDF Format Tips</p>
            <p className="text-yellow-700 text-xs">
              For best results, format your document with one of these patterns:
            </p>
            <div className="mt-2 grid grid-cols-2 gap-2 text-xs font-mono">
              <div className="bg-yellow-50 px-3 py-2 rounded-lg" style={{ color: '#92400e' }}>
                Q: What is Islam?<br/>A: Submission to Allah
              </div>
              <div className="bg-yellow-50 px-3 py-2 rounded-lg" style={{ color: '#92400e' }}>
                1. What is Tawbah?<br/>Answer: Repentance
              </div>
            </div>
          </div>

          {/* Drop zone */}
          <motion.div
            onClick={() => !processing && fileRef.current?.click()}
            onDrop={handleDrop}
            onDragOver={e => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            animate={{
              borderColor: dragOver ? '#0B5D3B' : '#d1d5db',
              background: dragOver ? '#f0fdf4' : '#ffffff',
            }}
            className="border-2 border-dashed rounded-2xl py-14 flex flex-col items-center justify-center cursor-pointer transition-all"
          >
            <input
              ref={fileRef}
              type="file"
              accept=".csv,.xlsx,.xls,.docx,.doc,.pdf"
              className="hidden"
              onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])}
            />
            {processing ? (
              <div className="flex flex-col items-center gap-3">
                <Loader2 className="w-10 h-10 animate-spin text-green-600" />
                <p className="text-sm font-semibold text-gray-600">Extracting content...</p>
                <p className="text-xs text-gray-400">This may take a moment for large files</p>
              </div>
            ) : (
              <>
                <Upload className="w-10 h-10 mb-3" style={{ color: dragOver ? '#0B5D3B' : '#9ca3af' }} />
                <p className="font-bold text-gray-700 mb-1">
                  {dragOver ? 'Drop to upload' : 'Drop your file here'}
                </p>
                <p className="text-sm text-gray-400">or click to browse · CSV, XLSX, DOCX, PDF</p>
                {fileName && (
                  <div className="flex items-center gap-2 mt-3 px-3 py-1.5 rounded-lg bg-green-50 border border-green-200">
                    <FileIcon ext={fileExt} />
                    <span className="text-sm font-medium text-green-700">{fileName}</span>
                  </div>
                )}
              </>
            )}
          </motion.div>

          {/* Error */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="flex items-start gap-3 px-4 py-3 rounded-xl text-sm"
                style={{ background: '#fef2f2', border: '1px solid #fecaca' }}
              >
                <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-red-700">{error}</p>
                </div>
                <button onClick={() => setError('')}><X className="w-4 h-4 text-red-400" /></button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Success */}
          <AnimatePresence>
            {imported > 0 && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm"
                style={{ background: '#f0fdf4', border: '1px solid #bbf7d0' }}
              >
                <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                <p className="text-green-700">
                  Successfully imported <strong>{imported}</strong> questions!
                  {skipped > 0 && <span className="text-green-500 ml-1">({skipped} duplicates skipped)</span>}
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Raw text view (for DOCX/PDF debugging) */}
          {rawTextView && showRawText && (
            <div className="bg-white rounded-xl overflow-hidden" style={{ border: '1px solid #e5e7eb' }}>
              <div className="flex items-center justify-between px-4 py-3" style={{ borderBottom: '1px solid #f0f4f1' }}>
                <p className="text-sm font-semibold text-gray-700">Raw Extracted Text</p>
                <button onClick={() => setShowRawText(false)} className="text-xs text-gray-400 hover:text-gray-600">
                  Hide
                </button>
              </div>
              <pre className="p-4 text-xs text-gray-600 overflow-y-auto max-h-64 whitespace-pre-wrap font-mono"
                style={{ background: '#f9fafb' }}>
                {rawTextView.slice(0, 3000)}{rawTextView.length > 3000 ? '\n...(truncated)' : ''}
              </pre>
            </div>
          )}

          {rawTextView && !showRawText && !preview && (
            <button
              onClick={() => setShowRawText(true)}
              className="text-xs text-gray-500 underline"
            >
              View raw extracted text
            </button>
          )}

          {/* Preview table */}
          <AnimatePresence>
            {preview && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-2xl overflow-hidden"
                style={{ border: '1px solid #e5ebe7', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}
              >
                {/* Preview header */}
                <div
                  className="flex items-center justify-between px-5 py-3.5"
                  style={{ background: '#f9fafb', borderBottom: '1px solid #f0f4f1' }}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className="text-xs font-bold px-2 py-0.5 rounded-full"
                      style={{ background: '#dcfce7', color: '#166534' }}
                    >
                      {preview.length} found
                    </span>
                    <p className="text-sm font-semibold text-gray-700">Preview — Review before importing</p>
                  </div>
                  <button onClick={() => setPreview(null)}>
                    <X className="w-4 h-4 text-gray-400 hover:text-gray-600" />
                  </button>
                </div>

                {/* Column headers */}
                <div
                  className="grid grid-cols-12 px-5 py-2.5 text-xs font-semibold uppercase tracking-wide text-gray-400"
                  style={{ borderBottom: '1px solid #f5f5f5' }}
                >
                  <span className="col-span-1">#</span>
                  <span className="col-span-4">Question</span>
                  <span className="col-span-4">Answer</span>
                  <span className="col-span-1">Cat.</span>
                  <span className="col-span-1">Diff.</span>
                  <span className="col-span-1"></span>
                </div>

                {/* Rows */}
                <div className="divide-y divide-gray-50 max-h-96 overflow-y-auto">
                  {preview.map((row, i) => (
                    <div key={i}>
                      {editIdx === i ? (
                        /* Inline edit row */
                        <div className="px-5 py-3 bg-blue-50" style={{ border: '1px solid #dbeafe' }}>
                          <div className="grid grid-cols-2 gap-2 mb-2">
                            <div>
                              <label className="text-xs font-semibold text-gray-500 mb-1 block">Question</label>
                              <textarea
                                value={editRow?.question ?? ''}
                                onChange={e => setEditRow(r => r ? { ...r, question: e.target.value } : r)}
                                rows={2}
                                className="w-full px-2 py-1.5 rounded text-xs text-gray-800 outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                                style={{ border: '1px solid #93c5fd' }}
                              />
                            </div>
                            <div>
                              <label className="text-xs font-semibold text-gray-500 mb-1 block">Answer</label>
                              <textarea
                                value={editRow?.answer ?? ''}
                                onChange={e => setEditRow(r => r ? { ...r, answer: e.target.value } : r)}
                                rows={2}
                                className="w-full px-2 py-1.5 rounded text-xs text-gray-800 outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                                style={{ border: '1px solid #93c5fd' }}
                              />
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <select
                              value={editRow?.category}
                              onChange={e => setEditRow(r => r ? { ...r, category: e.target.value as Category } : r)}
                              className="text-xs px-2 py-1 rounded border border-gray-200 text-gray-700"
                            >
                              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                            <select
                              value={editRow?.difficulty}
                              onChange={e => setEditRow(r => r ? { ...r, difficulty: e.target.value as Difficulty } : r)}
                              className="text-xs px-2 py-1 rounded border border-gray-200 text-gray-700"
                            >
                              {DIFFICULTIES.map(d => <option key={d} value={d}>{d}</option>)}
                            </select>
                            <button
                              onClick={saveEdit}
                              className="px-3 py-1 rounded text-xs font-bold text-white ml-auto"
                              style={{ background: '#0B5D3B' }}
                            >
                              Save
                            </button>
                            <button
                              onClick={() => { setEditIdx(null); setEditRow(null); }}
                              className="px-3 py-1 rounded text-xs font-semibold text-gray-500 border border-gray-200"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        /* Normal row */
                        <div className="grid grid-cols-12 px-5 py-3 items-start group hover:bg-gray-50 transition-colors">
                          <span className="col-span-1 text-xs font-bold text-gray-300 mt-0.5">{i + 1}</span>
                          <p className="col-span-4 text-xs text-gray-800 pr-3 leading-snug">{row.question}</p>
                          <p className="col-span-4 text-xs text-gray-500 pr-2 truncate">{row.answer}</p>
                          <span
                            className="col-span-1 text-xs px-1.5 py-0.5 rounded-full font-semibold self-start"
                            style={{ background: '#dcfce7', color: '#166534' }}
                          >
                            {row.category.split(' ')[0]}
                          </span>
                          <span
                            className="col-span-1 text-xs px-1.5 py-0.5 rounded-full font-semibold self-start"
                            style={{ background: '#fffbeb', color: '#92400e' }}
                          >
                            {row.difficulty}
                          </span>
                          <div className="col-span-1 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity justify-end self-start">
                            <button
                              onClick={() => { setEditIdx(i); setEditRow({ ...row }); }}
                              className="p-1 rounded hover:bg-blue-100 transition-colors"
                            >
                              <Edit2 className="w-3 h-3 text-blue-500" />
                            </button>
                            <button
                              onClick={() => deletePreviewRow(i)}
                              className="p-1 rounded hover:bg-red-100 transition-colors"
                            >
                              <Trash2 className="w-3 h-3 text-red-400" />
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Import footer */}
                <div
                  className="flex items-center justify-between px-5 py-4"
                  style={{ background: '#f9fafb', borderTop: '1px solid #f0f4f1' }}
                >
                  <p className="text-xs text-gray-400">
                    Duplicates will be automatically skipped · You can edit rows above
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setPreview(null)}
                      className="px-4 py-2 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-100 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleImport}
                      className="flex items-center gap-2 px-5 py-2 rounded-xl font-bold text-white text-sm hover:opacity-90 transition-all"
                      style={{ background: '#0B5D3B', boxShadow: '0 2px 8px rgba(11,93,59,0.3)' }}
                    >
                      <Upload className="w-4 h-4" />
                      Import {preview.length} Questions
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
      )}
    </NavSidebar>
  );
}