"use client";

import { ProjectRankingItem, FairSettings, Criterion, OFFICIAL_CRITERIA } from "@/types";

interface PrintClassificationProps {
  rankings: ProjectRankingItem[];
  settings: FairSettings | null;
  criteria?: Criterion[];
}

export default function PrintClassification({
  rankings,
  settings,
  criteria = OFFICIAL_CRITERIA,
}: PrintClassificationProps) {
  const evaluatedRankings = rankings.filter((r) => r.evaluationsCount > 0);

  return (
    <div className="hidden print:block text-black bg-white p-6 font-sans">
      {/* Cabeçalho Oficial */}
      <div className="text-center border-b-2 border-slate-900 pb-4 mb-6">
        <h1 className="text-xl font-black uppercase tracking-wider text-slate-900">
          {settings?.name || "AvaliaFeira – Feira de Ciências e Tecnologia"}
        </h1>
        <h2 className="text-sm font-bold text-slate-700 mt-1">
          {settings?.edition || "Edição 2026"} • ATA OFICIAL DE RESULTADOS E CLASSIFICAÇÃO GERAL
        </h2>
        <div className="flex justify-center gap-6 text-xs text-slate-600 mt-2 font-medium">
          <span><strong>Data:</strong> {settings?.date || "25 de Novembro de 2026"}</span>
          {settings?.location && <span><strong>Local:</strong> {settings.location}</span>}
          <span><strong>Emissão:</strong> {new Date().toLocaleString("pt-BR")}</span>
        </div>
      </div>

      {/* Tabela de Classificação Ranqueada */}
      <div className="mb-8">
        <table className="w-full text-left text-[10.5pt] border-collapse border border-slate-400">
          <thead>
            <tr className="bg-slate-200 text-slate-900 font-bold border-b border-slate-400">
              <th className="border border-slate-400 px-2 py-1.5 text-center w-12">Pos.</th>
              <th className="border border-slate-400 px-2 py-1.5 w-20">Código</th>
              <th className="border border-slate-400 px-2 py-1.5">Título do Projeto</th>
              <th className="border border-slate-400 px-2 py-1.5 w-40">Categoria</th>
              <th className="border border-slate-400 px-2 py-1.5 text-center w-12">Jurados</th>
              {criteria.map((c) => (
                <th
                  key={c.id}
                  className="border border-slate-400 px-1 py-1.5 text-center w-8 text-[9pt]"
                  title={`C${c.id}: ${c.name}`}
                >
                  C{c.id}
                </th>
              ))}
              <th className="border border-slate-400 px-2 py-1.5 text-right w-24">Pontuação Final</th>
            </tr>
          </thead>
          <tbody>
            {evaluatedRankings.map((item) => (
              <tr key={item.project.id} className="border-b border-slate-300">
                <td className="border border-slate-400 px-2 py-1.5 text-center font-bold">
                  {item.rank}º
                </td>
                <td className="border border-slate-400 px-2 py-1.5 font-bold whitespace-nowrap">
                  {item.project.code}
                </td>
                <td className="border border-slate-400 px-2 py-1.5 leading-snug">
                  <div className="font-bold">{item.project.title}</div>
                  <div className="text-[9pt] text-slate-600">{item.project.members}</div>
                </td>
                <td className="border border-slate-400 px-2 py-1.5 text-[9.5pt]">
                  {item.project.category}
                </td>
                <td className="border border-slate-400 px-2 py-1.5 text-center font-semibold">
                  {item.evaluationsCount}
                </td>
                {criteria.map((c) => (
                  <td key={c.id} className="border border-slate-400 px-1 py-1.5 text-center font-mono text-[9pt]">
                    {(item.criteriaAverages[c.id] || 0).toFixed(1)}
                  </td>
                ))}
                <td className="border border-slate-400 px-2 py-1.5 text-right font-black text-base whitespace-nowrap">
                  {item.finalScore.toFixed(2)}
                  {item.isTechnicalTie && (
                    <span className="block text-[8pt] font-semibold text-slate-600">
                      (Empate Técnico)
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Critérios de Desempate e Observações */}
      <div className="border border-slate-300 rounded-lg p-3 text-[9.5pt] text-slate-700 mb-8 bg-slate-50">
        <h4 className="font-bold text-slate-900 mb-1">Critérios de Homologação e Desempate Oficial:</h4>
        <p>
          1. A Pontuação Final corresponde à soma exata das médias aritméticas de cada um dos 10 critérios oficiais (escala 0.00 a 100.00).
        </p>
        <p>
          2. Em caso de empate na pontuação final, aplicou-se a ordem de desempate: 1º Domínio do conteúdo (C1), 2º Fundamentação científica (C5), 3º Metodologia e desenvolvimento (C6) e 4º Criatividade e originalidade (C2).
        </p>
      </div>

      {/* Linhas de Assinatura */}
      <div className="mt-12 pt-6 grid grid-cols-3 gap-6 text-center text-xs">
        <div className="border-t border-slate-800 pt-2">
          <p className="font-bold text-slate-900">Presidente da Comissão Julgadora</p>
          <p className="text-slate-500 text-[10px]">Coordenação Científica</p>
        </div>
        <div className="border-t border-slate-800 pt-2">
          <p className="font-bold text-slate-900">Coordenador(a) Geral da Feira</p>
          <p className="text-slate-500 text-[10px]">Direção Organizadora</p>
        </div>
        <div className="border-t border-slate-800 pt-2">
          <p className="font-bold text-slate-900">Representante do Corpo de Jurados</p>
          <p className="text-slate-500 text-[10px]">Avaliador Credenciado</p>
        </div>
      </div>
    </div>
  );
}
