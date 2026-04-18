import type { Mode, Depth } from "../types";

interface EditorPanelProps {
  code: string;
  mode: Mode;
  depth: Depth;
  loading: boolean;
  errorText: string;
  onCodeChange: (code: string) => void;
  onModeChange: (mode: Mode) => void;
  onDepthChange: (depth: Depth) => void;
  onClear: () => void;
  onSubmit: () => void;
}

export const EditorPanel = ({
  code,
  mode,
  depth,
  loading,
  errorText,
  onCodeChange,
  onModeChange,
  onDepthChange,
  onClear,
  onSubmit,
}: EditorPanelProps) => {
  return (
    <form
      className="flex flex-col gap-4 p-6 rounded-xl border border-slate-700 bg-slate-800 shadow-lg"
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit();
      }}
    >
      <label className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-slate-200">Code</span>
          <button
            type="button"
            className="px-3 py-1 text-sm font-medium text-cyan-400 border border-slate-600 bg-slate-700 rounded-lg hover:bg-slate-600 transition-colors"
            onClick={onClear}
            title="Clear code and response"
          >
            Clear
          </button>
        </div>
        <textarea
          value={code}
          onChange={(e) => onCodeChange(e.target.value)}
          rows={14}
          placeholder="Paste your code here..."
          className="w-full px-3.5 py-2.5 border border-slate-600 rounded-xl bg-slate-900 text-slate-100 outline-none transition-all focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/20 resize-vertical placeholder-slate-500"
        />
        <div className="text-xs text-slate-500">{code.length} characters</div>
      </label>

      <div className="flex flex-wrap gap-3 items-end">
        <label className="flex flex-col flex-1 min-w-56 gap-2">
          <span className="text-sm font-medium text-slate-200">Mode</span>
          <select
            value={mode}
            onChange={(e) => onModeChange(e.target.value as Mode)}
            className="px-3 py-2.5 h-12 border border-slate-600 rounded-xl bg-slate-900 text-slate-100 font-medium outline-none transition-all focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/20"
          >
            <option value="explain">Explain</option>
            <option value="teach">Teach</option>
            <option value="quiz">Quiz</option>
            <option value="structure">Explain architecture flow</option>
          </select>
        </label>

        <fieldset className="flex flex-col flex-1 min-w-56 gap-2">
          <legend className="text-sm font-medium text-slate-200">Depth</legend>
          <div className="flex gap-3.5 items-center">
            {["quick", "medium", "deep"].map((d) => (
              <label key={d} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="depth"
                  value={d}
                  checked={depth === d}
                  onChange={(e) => onDepthChange(e.target.value as Depth)}
                  className="w-4 h-4 accent-cyan-500 cursor-pointer"
                />
                <span className="text-sm font-medium text-slate-400 capitalize">
                  {d}
                </span>
              </label>
            ))}
          </div>
        </fieldset>

        <button
          type="submit"
          disabled={loading}
          className="px-5 py-2.5 h-12 min-w-fit bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-bold rounded-xl shadow-lg hover:shadow-xl disabled:opacity-70 disabled:cursor-progress transition-all"
        >
          {loading ? "Analyzing..." : "Analyze"}
        </button>
      </div>

      {loading && (
        <p className="text-sm text-cyan-400 font-medium">
          Analyzing your code...
        </p>
      )}
      {errorText && (
        <p className="text-sm text-red-400 font-medium">{errorText}</p>
      )}
    </form>
  );
};
