"use client";

import { useState, useEffect } from "react";
import { UserCheck, Sparkles, Hash, User, ArrowRight } from "lucide-react";
import { Evaluator } from "@/types";

interface EvaluatorNameModalProps {
  isOpen: boolean;
  currentCode: string;
  currentName: string;
  onSave: (code: string, name: string) => void;
  onCancel?: () => void;
  canCancel?: boolean;
  availableEvaluators?: Evaluator[];
}

export default function EvaluatorNameModal({
  isOpen,
  currentCode,
  currentName,
  onSave,
  onCancel,
  canCancel = false,
  availableEvaluators = [],
}: EvaluatorNameModalProps) {
  const [code, setCode] = useState(currentCode || "");
  const [name, setName] = useState(currentName || "");
  const [error, setError] = useState("");

  useEffect(() => {
    if (currentCode) setCode(currentCode);
    if (currentName) setName(currentName);
  }, [currentCode, currentName, isOpen]);

  // Se o avaliador digitar uma matrícula existente que já tem nome gravado, sugerir o nome
  const handleCodeChange = (newCode: string) => {
    const upper = newCode.toUpperCase();
    setCode(upper);
    if (error) setError("");

    const found = availableEvaluators.find((e) => e.code.toUpperCase() === upper);
    if (found && found.name && !name) {
      setName(found.name);
    }
  };

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanCode = code.trim().toUpperCase();
    const cleanName = name.trim();

    if (!cleanCode) {
      setError("Por favor, informe sua matrícula ou código de jurado (ex: AV-01).");
      return;
    }

    if (cleanName.length < 3) {
      setError("Por favor, digite seu nome completo (mínimo de 3 caracteres).");
      return;
    }

    setError("");
    onSave(cleanCode, cleanName);
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
            <p className="text-sm text-slate-500">Informe sua matrícula e seu nome para avaliar</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          {error && (
            <div className="rounded-xl bg-rose-50 border border-rose-200 p-3 text-xs font-semibold text-rose-700">
              {error}
            </div>
          )}

          {/* Campo Matrícula */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
              Matrícula / Código do Jurado *
            </label>
            <div className="relative mt-1.5">
              <Hash className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                required
                autoFocus
                value={code}
                onChange={(e) => handleCodeChange(e.target.value)}
                placeholder="Ex: AV-01 ou 101"
                className="w-full rounded-xl border border-slate-300 py-3 pl-10 pr-4 text-sm font-bold uppercase text-slate-900 placeholder:text-slate-400 focus:border-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
              />
            </div>
            <p className="mt-1 text-[11px] text-slate-500">
              A matrícula define a escala de projetos designados para você avaliar.
            </p>
          </div>

          {/* Campo Nome Completo */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
              Seu Nome Completo (digitado na hora) *
            </label>
            <div className="relative mt-1.5">
              <User className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                required
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (error) setError("");
                }}
                placeholder="Ex: Profa. Mariana Silveira"
                className="w-full rounded-xl border border-slate-300 py-3 pl-10 pr-4 text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:border-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
              />
            </div>
          </div>

          <div className="rounded-xl bg-teal-50/80 p-3 text-xs text-teal-900 border border-teal-200/60">
            <div className="flex items-center gap-1.5 font-bold">
              <Sparkles className="h-3.5 w-3.5 text-teal-600" />
              <span>Escala Personalizada de Avaliação</span>
            </div>
            <p className="mt-1 text-teal-800 leading-relaxed">
              O sistema exibirá os estandes e projetos que a coordenação atribuiu especificamente para sua matrícula avaliar.
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
              className="w-full sm:w-auto rounded-xl bg-teal-600 px-6 py-2.5 text-sm font-bold text-white shadow-md shadow-teal-600/20 hover:bg-teal-700 focus:ring-2 focus:ring-teal-500 focus:outline-none transition-all active:scale-98 flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Acessar Meus Projetos</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
