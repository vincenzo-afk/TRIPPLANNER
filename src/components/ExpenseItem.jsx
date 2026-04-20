export default function ExpenseItem({ expense, onDelete, deleting }) {
  return (
    <div className="flex items-center justify-between bg-transparent border-b border-white/5 py-4 hover:bg-white/[0.02] transition-colors px-4 -mx-4 rounded">
      <div className="flex flex-col">
        <h4 className="text-white font-light text-lg mb-1">
          {expense.description}
        </h4>
        <p className="text-white/40 text-xs uppercase tracking-wider">
          Day {expense.day} <span className="mx-2">•</span> {expense.category}
        </p>
      </div>
      <div className="text-right flex items-center gap-3">
        <p className="text-white font-medium text-xl">
          ${expense.amount.toFixed(2)}
        </p>
        {onDelete && (
          <button
            onClick={onDelete}
            disabled={deleting}
            className="px-3 py-1 rounded bg-black/50 hover:bg-red-500/20 text-white/70 hover:text-red-200 text-[10px] uppercase tracking-[0.2em] border border-white/10 hover:border-red-500/30 transition-colors disabled:opacity-50"
            aria-label={`Delete expense ${expense.description}`}
            title="Delete expense"
            type="button"
          >
            {deleting ? "..." : "Delete"}
          </button>
        )}
      </div>
    </div>
  );
}
