"use client";

import { useState, useMemo } from "react";
import { useAppState } from "@/lib/context/AppStateContext";
import { formatDate, formatRupiah, EXPENSE_TYPE_LABELS } from "@/lib/format";
import { cn } from "@/lib/utils";
import {
  Wallet, Plus, Trash2, Edit3, TrendingUp, TrendingDown, DollarSign,
  Trophy, Search, Filter, BarChart3, ArrowUpRight, ArrowDownLeft,
} from "lucide-react";
import { ExpenseRecord, ExpenseType } from "@/types";

const EXPENSE_TYPE_COLOR: Record<ExpenseType, string> = {
  registration: "text-orange-400",
  operational: "text-red-400",
  expense: "text-red-400",
  prize: "text-green-400",
  reimbursement: "text-emerald-400",
};

const EXPENSE_TYPES = [
  { value: "registration", label: "Biaya Pendaftaran" },
  { value: "operational", label: "Biaya Operasional" },
  { value: "prize", label: "Hadiah / Pemasukan" },
  { value: "reimbursement", label: "Reimbursement" },
];

function AddExpenseModal({
  isOpen,
  onClose,
  editExpense,
  competitions,
}: {
  isOpen: boolean;
  onClose: () => void;
  editExpense?: ExpenseRecord;
  competitions: { id: string; title: string }[];
}) {
  const { dispatch } = useAppState();
  const [description, setDescription] = useState(editExpense?.description ?? "");
  const [type, setType] = useState<ExpenseType>(editExpense?.type ?? "registration");
  const [amount, setAmount] = useState(editExpense?.amount?.toString() ?? "");
  const [competitionId, setCompetitionId] = useState(editExpense?.competition_id ?? "");
  const [date, setDate] = useState(
    editExpense?.date ? editExpense.date.slice(0, 10) : new Date().toISOString().slice(0, 10)
  );

  if (!isOpen) return null;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const selectedComp = competitions.find((c) => c.id === competitionId);
    const expense: ExpenseRecord = {
      id: editExpense?.id ?? `e-${Date.now()}`,
      description: description.trim(),
      competition_id: competitionId || undefined,
      competition_title: selectedComp?.title ?? "Umum",
      type,
      amount: parseFloat(amount) || 0,
      date: new Date(date).toISOString(),
      created_at: editExpense?.created_at ?? new Date().toISOString(),
    };
    if (editExpense) {
      dispatch({ type: "UPDATE_EXPENSE", payload: expense });
    } else {
      dispatch({ type: "ADD_EXPENSE", payload: expense });
    }
    onClose();
  }

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-content mx-4 max-w-md">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-green-600 dark:text-green-400" />
            {editExpense ? "Edit Catatan" : "Tambah Catatan Keuangan"}
          </h2>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-700 dark:hover:text-slate-300">✕</button>
        </div>
        <form onSubmit={handleSubmit} className="px-6 py-4 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Deskripsi *</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Biaya pendaftaran, print, dll."
              className="input-base"
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Jenis</label>
              <select value={type} onChange={(e) => setType(e.target.value as ExpenseType)} className="input-base">
                {EXPENSE_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Jumlah (Rp) *</label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="150000"
                min="0"
                className="input-base"
                required
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Kompetisi</label>
            <select value={competitionId} onChange={(e) => setCompetitionId(e.target.value)} className="input-base">
              <option value="">— Umum / Tidak terkait lomba —</option>
              {competitions.map((c) => (
                <option key={c.id} value={c.id}>{c.title}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Tanggal</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="input-base"
            />
          </div>
          <div className="flex gap-3 pt-2 border-t border-slate-200 dark:border-slate-800">
            <button type="button" onClick={onClose} className="btn-secondary flex-1">Batal</button>
            <button type="submit" className="btn-primary flex-1">
              {editExpense ? "Simpan" : "Tambah"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function KeuanganPage() {
  const { state, dispatch } = useAppState();
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editExpense, setEditExpense] = useState<ExpenseRecord | undefined>();

  const filteredExpenses = useMemo(() => {
    return state.expenses
      .filter((e) => {
        const matchSearch = !search ||
          e.description.toLowerCase().includes(search.toLowerCase()) ||
          e.competition_title.toLowerCase().includes(search.toLowerCase());
        const matchType = filterType === "all" || e.type === filterType ||
          (filterType === "income" && (e.type === "prize" || e.type === "reimbursement")) ||
          (filterType === "expense" && (e.type === "registration" || e.type === "operational"));
        return matchSearch && matchType;
      })
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [state.expenses, search, filterType]);

  const summary = useMemo(() => {
    const totalExpense = state.expenses
      .filter((e) => e.type === "registration" || e.type === "operational")
      .reduce((sum, e) => sum + e.amount, 0);
    const totalPrize = state.expenses
      .filter((e) => e.type === "prize")
      .reduce((sum, e) => sum + e.amount, 0);
    const totalReimbursement = state.expenses
      .filter((e) => e.type === "reimbursement")
      .reduce((sum, e) => sum + e.amount, 0);
    const totalIncome = totalPrize + totalReimbursement;
    return { totalExpense, totalPrize, totalReimbursement, totalIncome, net: totalIncome - totalExpense };
  }, [state.expenses]);

  // Per-competition summary
  const perCompSummary = useMemo(() => {
    const map = new Map<string, { title: string; expense: number; income: number }>();
    state.expenses.forEach((e) => {
      const key = e.competition_id ?? "general";
      const existing = map.get(key) ?? { title: e.competition_title, expense: 0, income: 0 };
      if (e.type === "registration" || e.type === "operational") {
        existing.expense += e.amount;
      } else {
        existing.income += e.amount;
      }
      map.set(key, existing);
    });
    return Array.from(map.values()).sort((a, b) => b.expense - a.expense);
  }, [state.expenses]);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-lg font-black text-slate-900 dark:text-white">Budget & Expense Tracker</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            {state.expenses.length} catatan keuangan
          </p>
        </div>
        <button
          onClick={() => { setEditExpense(undefined); setIsModalOpen(true); }}
          className="btn-primary text-xs flex items-center gap-1.5"
        >
          <Plus className="w-3.5 h-3.5" />
          Catat Transaksi
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="card p-4">
          <div className="flex items-center gap-2 mb-1">
            <ArrowDownLeft className="w-4 h-4 text-red-500 dark:text-red-400" />
            <span className="text-xs text-slate-500 dark:text-slate-400">Total Keluar</span>
          </div>
          <p className="text-lg font-black text-red-500 dark:text-red-400">{formatRupiah(summary.totalExpense)}</p>
        </div>
        <div className="card p-4">
          <div className="flex items-center gap-2 mb-1">
            <ArrowUpRight className="w-4 h-4 text-green-600 dark:text-green-400" />
            <span className="text-xs text-slate-500 dark:text-slate-400">Total Masuk</span>
          </div>
          <p className="text-lg font-black text-green-600 dark:text-green-400">{formatRupiah(summary.totalIncome)}</p>
        </div>
        <div className="card p-4">
          <div className="flex items-center gap-2 mb-1">
            <Trophy className="w-4 h-4 text-amber-500 dark:text-amber-400" />
            <span className="text-xs text-slate-500 dark:text-slate-400">Hadiah Juara</span>
          </div>
          <p className="text-lg font-black text-amber-500 dark:text-amber-400">{formatRupiah(summary.totalPrize)}</p>
        </div>
        <div className="card p-4">
          <div className="flex items-center gap-2 mb-1">
            <BarChart3 className={cn("w-4 h-4", summary.net >= 0 ? "text-green-600 dark:text-green-400" : "text-red-500 dark:text-red-400")} />
            <span className="text-xs text-slate-500 dark:text-slate-400">Net ROI</span>
          </div>
          <p className={cn("text-lg font-black", summary.net >= 0 ? "text-green-600 dark:text-green-400" : "text-red-500 dark:text-red-400")}>
            {summary.net >= 0 ? "+" : ""}{formatRupiah(summary.net)}
          </p>
        </div>
      </div>

      {/* Per-competition summary */}
      {perCompSummary.length > 0 && (
        <div className="card p-5">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white mb-4">Ringkasan Per Kompetisi</h2>
          <div className="space-y-3">
            {perCompSummary.map((comp) => (
              <div key={comp.title} className="flex items-center gap-4">
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-slate-900 dark:text-white truncate">{comp.title}</p>
                  <div className="flex items-center gap-3 mt-0.5 text-[11px]">
                    <span className="text-red-500 dark:text-red-400 font-medium">-{formatRupiah(comp.expense)}</span>
                    <span className="text-green-600 dark:text-green-400 font-medium">+{formatRupiah(comp.income)}</span>
                  </div>
                </div>
                <span className={cn("text-xs font-black flex-shrink-0", comp.income - comp.expense >= 0 ? "text-green-600 dark:text-green-400" : "text-red-500 dark:text-red-400")}>
                  {comp.income - comp.expense >= 0 ? "+" : ""}{formatRupiah(comp.income - comp.expense)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Search + Filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari transaksi..."
            className="input-base pl-9"
          />
        </div>
        <div className="flex gap-1.5 flex-wrap">
          {[
            { value: "all", label: "Semua" },
            { value: "expense", label: "Pengeluaran" },
            { value: "income", label: "Pemasukan" },
            { value: "prize", label: "Hadiah" },
            { value: "reimbursement", label: "Reimburse" },
          ].map((f) => (
            <button
              key={f.value}
              onClick={() => setFilterType(f.value)}
              className={cn(
                "px-3 py-2 rounded-xl text-xs font-medium transition-colors",
                filterType === f.value
                  ? "bg-green-500/15 text-green-700 dark:text-green-400 border border-green-500/30 font-bold"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 border border-slate-200 dark:border-slate-700"
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Transactions Table */}
      <div className="card overflow-hidden">
        <div className="px-5 py-3 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white">
            Riwayat Transaksi ({filteredExpenses.length})
          </h2>
        </div>
        {filteredExpenses.length === 0 ? (
          <div className="text-center py-12">
            <DollarSign className="w-10 h-10 text-slate-300 dark:text-slate-700 mx-auto mb-2" />
            <p className="text-sm text-slate-500">Belum ada catatan keuangan.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-200 dark:divide-slate-800">
            {filteredExpenses.map((expense) => {
              const isIncome = expense.type === "prize" || expense.type === "reimbursement";
              return (
                <div
                  key={expense.id}
                  className="group flex items-center gap-4 px-5 py-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                >
                  <div
                    className={cn(
                      "w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0",
                      isIncome ? "bg-green-500/10 text-green-600 dark:text-green-400" : "bg-red-500/10 text-red-500 dark:text-red-400"
                    )}
                  >
                    {isIncome ? (
                      <ArrowUpRight className="w-4 h-4" />
                    ) : (
                      <ArrowDownLeft className="w-4 h-4" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-900 dark:text-white truncate">
                      {expense.description}
                    </p>
                    <div className="flex items-center gap-2 text-[11px] text-slate-500">
                      <span>{formatDate(expense.date, "d MMM yyyy")}</span>
                      <span>·</span>
                      <span className="text-slate-600 dark:text-slate-400">{expense.competition_title}</span>
                      <span>·</span>
                      <span className={EXPENSE_TYPE_COLOR[expense.type]}>
                        {EXPENSE_TYPE_LABELS[expense.type]}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span
                      className={cn(
                        "text-sm font-black",
                        isIncome ? "text-green-600 dark:text-green-400" : "text-red-500 dark:text-red-400"
                      )}
                    >
                      {isIncome ? "+" : "-"}{formatRupiah(expense.amount)}
                    </span>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => { setEditExpense(expense); setIsModalOpen(true); }}
                        className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => dispatch({ type: "DELETE_EXPENSE", payload: expense.id })}
                        className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-red-500/10 text-slate-500 dark:text-slate-400 hover:text-red-500"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <AddExpenseModal
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); setEditExpense(undefined); }}
        editExpense={editExpense}
        competitions={state.competitions}
      />
    </div>
  );
}
