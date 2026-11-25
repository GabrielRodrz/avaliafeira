"use client";

import { useEffect, useState, useRef } from "react";
import QRCode from "qrcode";
import {
  QrCode,
  Copy,
  Check,
  Download,
  Printer,
  FileSpreadsheet,
  Settings,
  Sparkles,
  ExternalLink,
  Save,
  CheckCircle2,
} from "lucide-react";
import { FairSettings, ProjectRankingItem, Criterion, OFFICIAL_CRITERIA } from "@/types";

interface SettingsAndSharingProps {
  settings: FairSettings | null;
  onSaveSettings: (settings: Partial<FairSettings>) => Promise<void>;
  rankings: ProjectRankingItem[];
  criteria?: Criterion[];
  onTriggerPrint: () => void;
}

export default function SettingsAndSharing({
  settings,
  onSaveSettings,
  rankings,
  criteria = OFFICIAL_CRITERIA,
  onTriggerPrint,
}: SettingsAndSharingProps) {
  const [name, setName] = useState(settings?.name || "");
  const [edition, setEdition] = useState(settings?.edition || "");
  const [date, setDate] = useState(settings?.date || "");
  const [location, setLocation] = useState(settings?.location || "");
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>("");
  const [evaluatorUrl, setEvaluatorUrl] = useState<string>("");
  const [isCopied, setIsCopied] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const url = `${window.location.origin}/avaliar`;
      setEvaluatorUrl(url);

      QRCode.toDataURL(
        url,
        {
          width: 320,
          margin: 2,
          color: {
            dark: "#0f172a",
            light: "#ffffff",
          },
        },
        (err, dataUrl) => {
          if (!err && dataUrl) {
            setQrCodeDataUrl(dataUrl);
          }
        }
      );
    }
  }, []);

  useEffect(() => {
    if (settings) {
      setName(settings.name);
      setEdition(settings.edition);
      setDate(settings.date);
      setLocation(settings.location || "");
    }
  }, [settings]);

  const handleCopyLink = () => {
    if (navigator.clipboard && evaluatorUrl) {
      navigator.clipboard.writeText(evaluatorUrl);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await onSaveSettings({
        name: name.trim(),
        edition: edition.trim(),
        date: date.trim(),
        location: location.trim(),
      });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2000);
    } catch (e) {
      alert("Erro ao salvar configurações.");
    } finally {
      setIsSaving(false);
    }
  };

  // Exportar Relatório CSV Completo
  const handleExportCSV = () => {
    const headers = [
      "Classificação",
      "Código",
      "Título do Projeto",
      "Categoria",
      "Integrantes",
      "Orientador",
      "Estande",
      "Qtd Jurados",
      ...criteria.map((c) => `Média C${c.id} - ${c.name}`),
      "Pontuação Final (0-100)",
      "Observação",
    ];

    const rows = rankings.map((r) => {
      const criteriaCols = criteria.map((c) =>
        r.evaluationsCount > 0 ? (r.criteriaAverages[c.id] || 0).toFixed(2) : "0.00"
      );

      const status = r.isTechnicalTie ? "Empate Técnico" : "";

      return [
        r.evaluationsCount > 0 ? `${r.rank}º` : "Não avaliado",
        `"${r.project.code}"`,
        `"${r.project.title.replace(/"/g, '""')}"`,
        `"${r.project.category.replace(/"/g, '""')}"`,
        `"${(r.project.members || "").replace(/"/g, '""')}"`,
        `"${(r.project.advisor || "").replace(/"/g, '""')}"`,
        `"${r.project.stand || ""}"`,
        r.evaluationsCount,
        ...criteriaCols,
        r.evaluationsCount > 0 ? r.finalScore.toFixed(2) : "0.00",
        `"${status}"`,
      ];
    });

    const csvContent =
      "\uFEFF" + [headers.join(";"), ...rows.map((row) => row.join(";"))].join("\r\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    const dateStr = new Date().toISOString().split("T")[0];
    link.setAttribute("href", url);
    link.setAttribute("download", `classificacao_avaliafeira_${dateStr}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-8">
      {/* Grid: QR Code de Avaliação e Ações de Exportação */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Card: QR Code & Compartilhamento para os Jurados */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <QrCode className="h-5 w-5 text-teal-600" />
              <h3 className="text-base font-black text-slate-900">
                Acesso dos Jurados via QR Code
              </h3>
            </div>
            <p className="text-xs text-slate-500 mb-4">
              Disponibilize este QR Code nos crachás ou estandes para que os avaliadores abram o formulário móvel instantaneamente.
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-5 my-4">
              {qrCodeDataUrl ? (
                <div className="rounded-2xl border-2 border-slate-200 p-2 bg-white shadow-xs">
                  <img
                    src={qrCodeDataUrl}
                    alt="QR Code de Avaliação"
                    className="h-40 w-40 rounded-xl"
                  />
                </div>
              ) : (
                <div className="h-40 w-40 rounded-xl bg-slate-100 flex items-center justify-center text-xs text-slate-400">
                  Gerando QR Code...
                </div>
              )}

              <div className="space-y-2.5 w-full text-xs">
                <div>
                  <span className="font-bold text-slate-700 block mb-1">
                    Link Direto do Avaliador:
                  </span>
                  <div className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-[11px] text-slate-800 break-all font-mono">
                    <span className="truncate">{evaluatorUrl}</span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 pt-1">
                  <button
                    type="button"
                    onClick={handleCopyLink}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-slate-900 px-3.5 py-2 text-xs font-bold text-white shadow-xs hover:bg-slate-800 transition active:scale-95 cursor-pointer"
                  >
                    {isCopied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                    <span>{isCopied ? "Link Copiado!" : "Copiar Link"}</span>
                  </button>

                  {qrCodeDataUrl && (
                    <a
                      href={qrCodeDataUrl}
                      download="qrcode_avaliafeira.png"
                      className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 transition active:scale-95"
                    >
                      <Download className="h-3.5 w-3.5" />
                      <span>Baixar Imagem</span>
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 text-[11px] text-slate-400">
            Dica: Você pode imprimir este QR Code e colá-lo na entrada do pavilhão de ciências.
          </div>
        </div>

        {/* Card: Exportação e Relatórios Oficiais */}
        <div className="rounded-2xl border border-slate-200 bg-linear-to-b from-teal-50/40 via-white to-white p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <FileSpreadsheet className="h-5 w-5 text-teal-600" />
              <h3 className="text-base font-black text-slate-900">
                Relatórios e Classificação Oficial
              </h3>
            </div>
            <p className="text-xs text-slate-600 mb-6">
              Emita a ata de classificação final da feira de ciências em planilha eletrônica compatível com Excel ou gere a folha oficial para impressão e homologação.
            </p>

            <div className="space-y-3">
              {/* Exportar CSV */}
              <button
                type="button"
                onClick={handleExportCSV}
                className="w-full flex items-center justify-between rounded-2xl border border-emerald-300 bg-emerald-50/80 p-4 hover:bg-emerald-100/90 transition text-left cursor-pointer group"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-xs">
                    <FileSpreadsheet className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-emerald-950">
                      Exportar Relatório CSV (Excel)
                    </h4>
                    <p className="text-xs text-emerald-800">
                      Médias dos 10 critérios, desempates e pontuações finais
                    </p>
                  </div>
                </div>
                <Download className="h-4 w-4 text-emerald-700 group-hover:translate-y-0.5 transition" />
              </button>

              {/* Imprimir Ata Oficial */}
              <button
                type="button"
                onClick={onTriggerPrint}
                className="w-full flex items-center justify-between rounded-2xl border border-slate-300 bg-white p-4 hover:bg-slate-50 transition text-left cursor-pointer group"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-white shadow-xs">
                    <Printer className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-950">
                      Imprimir Classificação Oficial
                    </h4>
                    <p className="text-xs text-slate-600">
                      Ata formatada para impressão A4 com campo para assinaturas
                    </p>
                  </div>
                </div>
                <Printer className="h-4 w-4 text-slate-700" />
              </button>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 text-[11px] text-slate-500">
            A ata inclui todos os projetos ranqueados com critérios de desempate homologados.
          </div>
        </div>
      </div>

      {/* Formulário: Dados da Feira de Ciências */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
        <div className="flex items-center gap-2 mb-2">
          <Settings className="h-5 w-5 text-teal-600" />
          <h3 className="text-base font-black text-slate-900">
            Dados e Identificação do Evento
          </h3>
        </div>
        <p className="text-xs text-slate-500 mb-5">
          Essas informações aparecem no cabeçalho das telas dos jurados e no documento oficial impresso.
        </p>

        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                Nome do Evento / Feira
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Feira de Ciências e Tecnologia"
                className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-900 focus:border-teal-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                Edição / Ano
              </label>
              <input
                type="text"
                required
                value={edition}
                onChange={(e) => setEdition(e.target.value)}
                placeholder="Ex: Edição 2026"
                className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-900 focus:border-teal-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                Data do Evento
              </label>
              <input
                type="text"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                placeholder="Ex: 25 e 26 de Novembro de 2026"
                className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-xs font-medium text-slate-900 focus:border-teal-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                Localização / Pavilhão
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Ex: Ginásio Central / Pavilhão A"
                className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-xs font-medium text-slate-900 focus:border-teal-600 focus:outline-none"
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-slate-100">
            {saveSuccess ? (
              <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-600">
                <CheckCircle2 className="h-4 w-4" />
                Configurações salvas com sucesso!
              </span>
            ) : <span />}

            <button
              type="submit"
              disabled={isSaving}
              className="rounded-xl bg-teal-600 px-5 py-2 text-xs font-bold text-white shadow-md hover:bg-teal-700 transition disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
            >
              <Save className="h-4 w-4" />
              <span>{isSaving ? "Salvando..." : "Salvar Configurações"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
