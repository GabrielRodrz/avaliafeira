"use client";

import { useState, useEffect, useMemo } from "react";
import {
  UserCheck,
  Hash,
  User,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
  BookmarkCheck,
  ShieldAlert,
  Loader2,
} from "lucide-react";
import { Evaluator, Project } from "@/types";

interface EvaluatorNameModalProps {
  isOpen: boolean;
  currentCode: string;
  currentName: string;
  onSave: (code: string, name: string) => void;
  onCancel?: () => void;
  canCancel?: boolean;
  availableEvaluators?: Evaluator[];
  projects?: Project[];
}

export default function EvaluatorNameModal({
  isOpen,
  currentCode,
  currentName,
  onSave,
  onCancel,
  canCancel = false,
  availableEvaluators = [],
  projects = [],
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

  const cleanCode = code.replace(/\D/g, "").slice(0, 6);

  // Busca se o código digitado existe na lista oficial de jurados
  const matchedEvaluator = useMemo(() => {
    if (cleanCode.length !== 6) return null;
    return availableEvaluators.find(
      (e) => e.code.replace(/\D/g, "") === cleanCode
    ) || null;
  }, [cleanCode, availableEvaluators]);

  // Contagem de projetos designados para essa matrícula
  const assignedProjectsCount = useMemo(() => {
    if (!cleanCode || cleanCode.length !== 6) return 0;
    return projects.filter((p) =>
      p.assigned_evaluators?.some((c) => c.replace(/\D/g, "") === cleanCode)
    ).length;
  }, [cleanCode, projects]);

  const handleCodeChange = (raw: string) => {
    const numericOnly = raw.replace(/\D/g, "").slice(0, 6);
    setCode(numericOnly);
    setError("");

    // Se já tiver 6 dígitos e encontrar o jurado, pré-preenche o nome cadastrado
    if (numericOnly.length === 6) {
      const found = availableEvaluators.find(
        (e) => e.code.replace(/\D/g, "") === numericOnly
      );
      if (found?.name) {
        setName(found.name);
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (cleanCode.length !== 6) {
      setError("Por favor, digite sua matrícula com exatamente 6 dígitos.");
      return;
    }

    if (!matchedEvaluator) {
      setError(
        `A matrícula ${cleanCode} não foi localizada no cadastro oficial. Apenas jurados cadastrados pela organização podem avaliar.`
      );
      return;
    }

    const finalName = matchedEvaluator.name?.trim() || name.trim();
    if (!finalName || finalName.length < 2) {
      setError("Por favor, informe seu nome para confirmar a identificação.");
      return;
    }

    setError("");
    onSave(matchedEvaluator.code, finalName);
  };

  const isCodeComplete = cleanCode.length === 6;
  const isFound = Boolean(matchedEvaluator);
  const displayName = matchedEvaluator?.name || name;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/75 p-3.5 sm:p-4 backdrop-blur-xs overflow-y-auto">
      <div className="w-full max-w-md rounded-3xl bg-white p-5 sm:p-7 shadow-2xl ring-1 ring-slate-900/10 transition-all my-auto">
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
              Digite seu número de matrícula oficial para acessar
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          {error && (
            <div className="flex items-start gap-2.5 rounded-2xl bg-rose-50 border-2 border-rose-200 p-3.5 text-xs sm:text-sm font-bold text-rose-800 leading-snug">
              <AlertCircle className="h-5 w-5 shrink-0 text-rose-600 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Campo Matrícula (6 dígitos) */}
          <div>
            <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-1.5 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Hash className="h-4 w-4 text-teal-600" />
                <span>Número da Matrícula (6 dígitos) *</span>
              </span>
              <span className="text-[10px] font-bold text-teal-800 bg-teal-50 border border-teal-200 px-2 py-0.5 rounded-md">
                Somente números
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
                placeholder="000000"
                maxLength={6}
                className={`w-full rounded-2xl border-2 py-3.5 px-4 text-center text-3xl sm:text-4xl font-mono font-black tracking-widest transition shadow-inner focus:outline-none ${
                  isCodeComplete
                    ? isFound
                      ? "border-emerald-500 bg-emerald-50/30 text-emerald-950 ring-2 ring-emerald-500/20"
                      : "border-rose-400 bg-rose-50/30 text-rose-950 ring-2 ring-rose-500/20"
                    : "border-teal-500 bg-teal-50/20 text-slate-900 focus:border-teal-600 focus:bg-white focus:ring-4 focus:ring-teal-500/20"
                }`}
              />
            </div>
            <p className="mt-1.5 text-[11px] text-slate-500 text-center font-medium">
              Informe a matrícula de 6 dígitos numéricos entregue pela coordenação.
            </p>
          </div>

          {/* ESTADO 1: Digitação em andamento (< 6 dígitos) */}
          {!isCodeComplete && (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-3.5 text-center text-xs text-slate-500">
              Digite os <strong>6 dígitos</strong> da sua matrícula para buscar seu cadastro e seus projetos designados.
            </div>
          )}

          {/* ESTADO 2: 6 dígitos digitados E ENCONTRADO na lista oficial */}
          {isCodeComplete && isFound && (
            <div className="rounded-2xl border-2 border-emerald-400 bg-linear-to-b from-emerald-50 to-teal-50/70 p-4 shadow-sm animate-in fade-in-50 duration-200">
              <div className="flex items-center justify-between border-b border-emerald-200/60 pb-2.5">
                <div className="flex items-center gap-1.5 text-emerald-800 font-black text-xs uppercase tracking-wider">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  <span>Jurado(a) Localizado(a)</span>
                </div>
                <span className="rounded-lg bg-teal-800 text-white px-2.5 py-0.5 text-xs font-mono font-black tracking-wider shadow-2xs">
                  {cleanCode}
                </span>
              </div>

              <div className="mt-3 space-y-2">
                <div>
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wide block">
                    Nome Oficial Cadastrado:
                  </span>
                  <p className="text-base sm:text-lg font-black text-slate-900 leading-tight">
                    {displayName || "Avaliador(a) Cadastrado(a)"}
                  </p>
                </div>

                {/* Se por acaso o jurado estiver sem nome cadastrado, permite preencher */}
                {!matchedEvaluator?.name && (
                  <div className="pt-2">
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Seu Nome Completo:
                    </label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Digite seu nome completo"
                      className="w-full rounded-xl border border-slate-300 bg-white py-2 px-3 text-sm font-semibold text-slate-900 focus:border-teal-600 focus:outline-none"
                    />
                  </div>
                )}

                <div className="flex items-center gap-2 rounded-xl bg-white/80 border border-emerald-200 p-2.5 text-xs font-bold text-teal-900">
                  <BookmarkCheck className="h-4 w-4 text-teal-700 shrink-0" />
                  <span>
                    {assignedProjectsCount > 0 ? (
                      <>
                        <strong>{assignedProjectsCount}</strong> {assignedProjectsCount === 1 ? "projeto designado" : "projetos designados"} para sua avaliação
                      </>
                    ) : (
                      "Nenhum projeto alocado especificamente no momento"
                    )}
                  </span>
                </div>

                <p className="text-[11px] text-teal-950 font-medium pt-1">
                  Por favor, confirme se estes são os seus dados antes de entrar.
                </p>
              </div>
            </div>
          )}

          {/* ESTADO 3: 6 dígitos digitados MAS NÃO ENCONTRADO */}
          {isCodeComplete && !isFound && (
            <div className="rounded-2xl border-2 border-rose-300 bg-rose-50/80 p-4 shadow-sm animate-in fade-in-50 duration-200">
              <div className="flex items-center gap-2 text-rose-800 font-black text-xs uppercase tracking-wider">
                <ShieldAlert className="h-4 w-4 text-rose-600 shrink-0" />
                <span>Matrícula Não Cadastrada</span>
              </div>
              <p className="mt-2 text-xs sm:text-sm font-bold text-rose-950 leading-snug">
                A matrícula <strong>{cleanCode}</strong> não consta na lista de avaliadores oficiais desta feira.
              </p>
              <p className="mt-1.5 text-[11px] text-rose-800 leading-relaxed">
                Apenas jurados previamente cadastrados pela comissão organizadora têm permissão para avaliar. Por favor, confirme o número da sua matrícula com a coordenação.
              </p>
            </div>
          )}

          {/* Botões de Ação */}
          <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
            {canCancel && onCancel && (
              <button
                type="button"
                onClick={onCancel}
                className="w-full sm:w-auto rounded-2xl px-5 py-3 text-xs sm:text-sm font-bold text-slate-600 hover:bg-slate-100 transition"
              >
                Voltar
              </button>
            )}

            <button
              type="submit"
              disabled={!isCodeComplete || !isFound || !displayName?.trim()}
              className={`w-full sm:w-auto rounded-2xl px-7 py-3 text-sm font-black transition-all flex items-center justify-center gap-2 active:scale-98 ${
                isCodeComplete && isFound && displayName?.trim()
                  ? "bg-teal-600 text-white shadow-lg shadow-teal-600/30 hover:bg-teal-700 focus:ring-4 focus:ring-teal-500/30 cursor-pointer"
                  : "bg-slate-200 text-slate-400 cursor-not-allowed shadow-none"
              }`}
            >
              <span>
                {isCodeComplete && isFound
                  ? "OK, Confirmar e Entrar"
                  : isCodeComplete
                  ? "Acesso Não Permitido"
                  : "Digite os 6 dígitos"}
              </span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
