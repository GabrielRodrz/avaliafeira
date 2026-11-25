"use client";

import { useState, useEffect } from "react";
import {
  UserCheck,
  Hash,
  User,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  Sparkles,
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

export default function EvaluatorNameModal({
  isOpen,
  currentCode,
  currentName,
  onSave,
  onCancel,
  canCancel = false,
  availableEvaluators = [],
}: EvaluatorNameModalProps) {
  const [code, setCode] = useState(currentCode ? currentCode.replace(/\D/g, "") : "");
  const [name, setName] = useState(currentName || "");
  const [error, setError] = useState("");

  useEffect(() => {
    if (currentCode) {
      setCode(currentCode.replace(/\D/g, ""));
    }
    if (currentName) {
      setName(currentName);
    }
  }, [currentCode, currentName, isOpen]);

  if (!isOpen) return null;

  const handleCodeChange = (raw: string) => {
    // Permite SOMENTE NÚMEROS
    const numericOnly = raw.replace(/\D/g, "");
    setCode(numericOnly);
    if (error) setError("");

    // Se a matrícula existir e já tiver um nome vinculado, sugere o nome
    if (numericOnly) {
      const found = availableEvaluators.find(
        (e) => e.code.replace(/\D/g, "") === numericOnly
      );
      if (found && found.name && !name) {
        setName(found.name);
      }
    }
  };

  const selectedEvaluator = availableEvaluators.find(
    (e) => e.code.replace(/\D/g, "") === code.trim()
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanCode = code.trim().replace(/\D/g, "");
    const cleanName = name.trim();

    if (!cleanCode || cleanCode.length !== 6) {
      setError("Por favor, digite o número da sua matrícula com exatamente 6 dígitos (ex: 849201).");
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 p-3 sm:p-4 backdrop-blur-xs overflow-y-auto">
      <div className="w-full max-w-md rounded-3xl bg-white p-5 sm:p-8 shadow-2xl ring-1 ring-slate-900/10 transition-all my-auto">
        {/* Cabeçalho */}
        <div className="flex items-center gap-3.5 border-b border-slate-100 pb-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-teal-600 text-white shadow-lg shadow-teal-600/30">
            <UserCheck className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Identificação do Jurado
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 font-medium">
              Digite o número da sua matrícula para acessar seus projetos
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

          {/* Campo Matrícula (Apenas Números) */}
          <div>
            <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-1.5 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Hash className="h-4 w-4 text-teal-600" />
                <span>Número da Matrícula (Somente Números) *</span>
              </span>
              <span className="text-[10px] font-bold text-teal-700 bg-teal-50 border border-teal-200 px-2 py-0.5 rounded-md">
                Apenas dígitos
              </span>
            </label>

            <div className="relative mt-1">
              <input
                type="tel"
                inputMode="numeric"
                pattern="[0-9]*"
                required
                autoFocus
                value={code}
                onChange={(e) => handleCodeChange(e.target.value)}
                placeholder="Ex: 849201"
                maxLength={6}
                className="w-full rounded-2xl border-2 border-teal-500 bg-teal-50/30 py-4 px-4 text-center text-3xl sm:text-4xl font-mono font-black tracking-widest text-teal-950 placeholder:text-slate-300 focus:border-teal-600 focus:bg-white focus:outline-none focus:ring-4 focus:ring-teal-500/20 transition shadow-inner"
              />
            </div>
            <p className="mt-1.5 text-[11px] text-slate-500 text-center font-medium">
              Digite o código de 6 dígitos numéricos fornecido pela coordenação (ex: <strong>849201</strong>).
            </p>
          </div>

          {/* Campo Nome do Avaliador */}
          <div>
            <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-1.5 flex items-center gap-1.5">
              <User className="h-4 w-4 text-teal-600" />
              <span>Seu Nome Completo (digitado na hora) *</span>
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
              Seu nome ficará registrado em cada projeto que você avaliar.
            </p>
          </div>

          {/* Quadro de Conferência e Destaque */}
          {code.trim() && (
            <div className="rounded-2xl border-2 border-teal-500/80 bg-linear-to-r from-teal-50 to-emerald-50 p-4 shadow-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-5 w-5 text-teal-700 shrink-0" />
                  <span className="text-xs font-black uppercase tracking-wider text-teal-900">
                    Confirmação de Acesso
                  </span>
                </div>
                <span className="rounded-xl bg-teal-800 text-white px-3 py-1 text-sm font-black tracking-wider font-mono shadow-xs">
                  MATRÍCULA {code.trim()}
                </span>
              </div>

              <div className="mt-2 text-xs text-teal-950 font-medium space-y-1">
                <p>
                  Você está acessando a escala da <strong>Matrícula Nº {code.trim()}</strong>.
                </p>
                {selectedEvaluator?.name && selectedEvaluator.name !== name && (
                  <p className="rounded-xl bg-amber-100 border border-amber-300 p-2 text-amber-900 text-[11px] font-semibold mt-1">
                    ⚠️ Esta matrícula já possui registro prévio no nome de:{" "}
                    <strong>{selectedEvaluator.name}</strong>. Confirme se você é este jurado.
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
              <span>Acessar como Matrícula {code.trim() || "..."}</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
