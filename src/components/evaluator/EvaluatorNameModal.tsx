"use client";

import { useState } from "react";
import { UserCheck, Sparkles } from "lucide-react";

interface EvaluatorNameModalProps {
  isOpen: boolean;
  currentName: string;
  onSave: (name: string) => void;
  onCancel?: () => void;
  canCancel?: boolean;
}

export default function EvaluatorNameModal({
  isOpen,
  currentName,
  onSave,
  onCancel,
  canCancel = false,
}: EvaluatorNameModalProps) {
  const [name, setName] = useState(currentName || "");
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (trimmed.length < 3) {
      setError("Por favor, digite seu nome completo (mínimo de 3 caracteres).");
      return;
    }
    setError("");
    onSave(trimmed);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl ring-1 ring-slate-900/5 transition-all">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-teal-100 text-teal-700">
            <UserCheck className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900">Identificação do Avaliador</h2>
            <p className="text-sm text-slate-500">Informe seu nome para registrar suas notas</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700">
              Nome Completo do Jurado / Avaliador
            </label>
            <input
              type="text"
              required
              autoFocus
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (error) setError("");
              }}
              placeholder="Ex: Profa. Mariana Silveira"
              className="mt-1.5 w-full rounded-xl border border-slate-300 px-4 py-3 text-base font-medium text-slate-900 placeholder:text-slate-400 focus:border-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
            />
            {error && <p className="mt-1.5 text-xs font-semibold text-rose-600">{error}</p>}
          </div>

          <div className="rounded-xl bg-teal-50/70 p-3 text-xs text-teal-900">
            <div className="flex items-center gap-1.5 font-bold">
              <Sparkles className="h-3.5 w-3.5 text-teal-600" />
              <span>Acesso Rápido Sem Senha</span>
            </div>
            <p className="mt-1 text-teal-800">
              Seu nome ficará salvo neste aparelho para que você não precise redigitá-lo a cada estande avaliado.
            </p>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            {canCancel && onCancel && (
              <button
                type="button"
                onClick={onCancel}
                className="rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-100"
              >
                Cancelar
              </button>
            )}
            <button
              type="submit"
              className="w-full sm:w-auto rounded-xl bg-teal-600 px-6 py-2.5 text-sm font-bold text-white shadow-md shadow-teal-600/20 hover:bg-teal-700 focus:ring-2 focus:ring-teal-500 focus:outline-none transition-all active:scale-98"
            >
              Continuar para Avaliação
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
