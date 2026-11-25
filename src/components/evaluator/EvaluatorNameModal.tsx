"use client";

import { useState, useEffect } from "react";
import {
  UserCheck,
  Sparkles,
  Hash,
  User,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
  Edit3,
} from "lucide-react";
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

const DEFAULT_FALLBACK_CODES = [
  { code: "AV-01", name: null },
  { code: "AV-02", name: null },
  { code: "AV-03", name: null },
  { code: "AV-04", name: null },
  { code: "AV-05", name: null },
];

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
  const [isManualInput, setIsManualInput] = useState(false);
  const [error, setError] = useState("");

  // Lista combinada de avaliadores disponíveis
  const evaluatorsList =
    availableEvaluators.length > 0 ? availableEvaluators : DEFAULT_FALLBACK_CODES;

  useEffect(() => {
    if (currentCode) {
      setCode(currentCode.toUpperCase());
    }
    if (currentName) {
      setName(currentName);
    }
  }, [currentCode, currentName, isOpen]);

  if (!isOpen) return null;

  // Ao clicar em uma matrícula da lista
  const handleSelectEvaluatorCard = (selectedCode: string, existingName?: string | null) => {
    const upper = selectedCode.toUpperCase();
    setCode(upper);
    setError("");

    if (existingName) {
      setName(existingName);
    } else if (!name) {
      setName("");
    }
  };

  const handleManualCodeChange = (newCode: string) => {
    const upper = newCode.toUpperCase();
    setCode(upper);
    if (error) setError("");

    const found = evaluatorsList.find((e) => e.code.toUpperCase() === upper);
    if (found && found.name && !name) {
      setName(found.name);
    }
  };

  const selectedEvaluatorInfo = evaluatorsList.find(
    (e) => e.code.toUpperCase() === code.trim().toUpperCase()
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanCode = code.trim().toUpperCase();
    const cleanName = name.trim();

    if (!cleanCode) {
      setError("Por favor, selecione ou digite sua matrícula de jurado.");
      return;
    }

    if (cleanName.length < 3) {
      setError("Por favor, digite seu nome completo (mínimo de 3 caracteres) para identificar suas notas.");
      return;
    }

    setError("");
    onSave(cleanCode, cleanName);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 p-4 backdrop-blur-xs overflow-y-auto">
      <div className="w-full max-w-lg rounded-3xl bg-white p-6 sm:p-8 shadow-2xl ring-1 ring-slate-900/10 transition-all my-8">
        {/* Cabeçalho */}
        <div className="flex items-center gap-3.5 border-b border-slate-100 pb-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-teal-600 text-white shadow-lg shadow-teal-600/30">
            <UserCheck className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Identificação do Avaliador
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 font-medium">
              Escolha sua matrícula para carregar os projetos designados a você
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-5">
          {error && (
            <div className="flex items-center gap-2 rounded-2xl bg-rose-50 border-2 border-rose-200 p-3.5 text-xs sm:text-sm font-bold text-rose-700">
              <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
              <span>{error}</span>
            </div>
          )}

          {/* 1. SELEÇÃO DA MATRÍCULA EM DESTAQUE */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <Hash className="h-4 w-4 text-teal-600" />
                <span>1. Escolha sua Matrícula de Jurado:</span>
              </label>

              <button
                type="button"
                onClick={() => setIsManualInput(!isManualInput)}
                className="text-[11px] font-bold text-teal-700 hover:text-teal-900 underline flex items-center gap-1"
              >
                <Edit3 className="h-3 w-3" />
                <span>{isManualInput ? "Ver botões de seleção" : "Digitar outra matrícula"}</span>
              </button>
            </div>

            {!isManualInput ? (
              <div className="space-y-2">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {evaluatorsList.map((ev) => {
                    const isSelected = code.trim().toUpperCase() === ev.code.toUpperCase();
                    return (
                      <button
                        key={ev.code}
                        type="button"
                        onClick={() => handleSelectEvaluatorCard(ev.code, ev.name)}
                        className={`group relative flex flex-col items-center justify-center p-3.5 rounded-2xl border-2 transition-all cursor-pointer text-center ${
                          isSelected
                            ? "border-teal-600 bg-teal-50/80 shadow-md ring-2 ring-teal-500/25"
                            : "border-slate-200 bg-white hover:border-teal-400 hover:bg-slate-50"
                        }`}
                      >
                        {isSelected && (
                          <div className="absolute top-2 right-2">
                            <CheckCircle2 className="h-4 w-4 text-teal-600" />
                          </div>
                        )}
                        <span
                          className={`text-lg sm:text-xl font-black font-mono tracking-wider transition ${
                            isSelected ? "text-teal-800 scale-105" : "text-slate-900 group-hover:text-teal-700"
                          }`}
                        >
                          {ev.code}
                        </span>
                        <span className="mt-1 text-[11px] font-semibold text-slate-500 truncate max-w-full">
                          {ev.name ? ev.name.split(" ")[0] : "Disponível"}
                        </span>
                      </button>
                    );
                  })}
                </div>
                <p className="text-[11px] text-slate-400 text-center">
                  Toque na sua matrícula acima para selecionar.
                </p>
              </div>
            ) : (
              <div>
                <div className="relative mt-1">
                  <Hash className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    required
                    autoFocus
                    value={code}
                    onChange={(e) => handleManualCodeChange(e.target.value)}
                    placeholder="DIGITE A MATRÍCULA (EX: AV-01)"
                    className="w-full rounded-2xl border-2 border-teal-500 bg-teal-50/30 py-3.5 pl-12 pr-4 text-center text-xl sm:text-2xl font-black font-mono uppercase tracking-widest text-slate-900 placeholder:text-slate-400 placeholder:text-sm focus:border-teal-600 focus:outline-none focus:ring-4 focus:ring-teal-500/20"
                  />
                </div>
              </div>
            )}
          </div>

          {/* 2. CONFIRMAÇÃO DO NOME DO AVALIADOR */}
          <div>
            <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-1.5 flex items-center gap-1.5">
              <User className="h-4 w-4 text-teal-600" />
              <span>2. Seu Nome Completo (digitado na hora) *</span>
            </label>
            <div className="relative">
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
                className="w-full rounded-2xl border border-slate-300 py-3.5 pl-10 pr-4 text-sm sm:text-base font-semibold text-slate-900 placeholder:text-slate-400 focus:border-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
              />
            </div>
            <p className="mt-1 text-[11px] text-slate-500">
              Este nome aparecerá nas fichas que você avaliar e assinar.
            </p>
          </div>

          {/* 3. QUADRO DE CONFERÊNCIA ANTI-ERRO */}
          {code.trim() && (
            <div className="rounded-2xl border-2 border-teal-500/80 bg-linear-to-r from-teal-50 to-emerald-50 p-4 shadow-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-5 w-5 text-teal-700 shrink-0" />
                  <span className="text-xs font-black uppercase tracking-wider text-teal-900">
                    Confirmação de Acesso
                  </span>
                </div>
                <span className="rounded-lg bg-teal-800 text-white px-2.5 py-1 text-xs font-black tracking-wider font-mono">
                  {code.trim().toUpperCase()}
                </span>
              </div>

              <div className="mt-2 text-xs text-teal-950 font-medium space-y-1">
                <p>
                  Você está se identificando como o jurado da <strong>Matrícula {code.trim().toUpperCase()}</strong>.
                </p>
                {selectedEvaluatorInfo?.name && selectedEvaluatorInfo.name !== name && (
                  <p className="rounded-lg bg-amber-100 border border-amber-300 p-2 text-amber-900 text-[11px] font-semibold mt-1">
                    ⚠️ Atenção: Esta matrícula já possui registro prévio no nome de:{" "}
                    <strong>{selectedEvaluatorInfo.name}</strong>. Se você não é esta pessoa, escolha outra matrícula.
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Botões de Ação */}
          <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-3 pt-2 border-t border-slate-100">
            {canCancel && onCancel && (
              <button
                type="button"
                onClick={onCancel}
                className="w-full sm:w-auto rounded-2xl px-5 py-3 text-xs sm:text-sm font-bold text-slate-600 hover:bg-slate-100 transition"
              >
                Cancelar
              </button>
            )}
            <button
              type="submit"
              disabled={!code.trim() || !name.trim()}
              className="w-full sm:w-auto rounded-2xl bg-teal-600 px-7 py-3 text-sm font-black text-white shadow-lg shadow-teal-600/25 hover:bg-teal-700 focus:ring-4 focus:ring-teal-500/30 focus:outline-none transition-all active:scale-98 disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Confirmar e Acessar como {code.trim().toUpperCase() || "Avaliador"}</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
