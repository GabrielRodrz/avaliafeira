"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Award,
  Shield,
  Smartphone,
  BarChart3,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  Users,
  Compass,
  FileCheck,
} from "lucide-react";
import { getFairSettings, getProjects } from "@/lib/data-service";
import { FairSettings, Project } from "@/types";

export default function HomePage() {
  const [settings, setSettings] = useState<FairSettings | null>(null);
  const [projectsCount, setProjectsCount] = useState<number>(0);

  useEffect(() => {
    async function load() {
      try {
        const [s, p] = await Promise.all([getFairSettings(), getProjects()]);
        setSettings(s);
        setProjectsCount(p.length);
      } catch (e) {
        console.error(e);
      }
    }
    load();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between">
      {/* Navbar Superior */}
      <header className="border-b border-slate-200/80 bg-white/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-600 text-white shadow-md shadow-teal-600/25">
              <Award className="h-6 w-6" />
            </div>
            <div>
              <span className="text-lg font-black tracking-tight text-slate-900">
                AvaliaFeira
              </span>
              <span className="ml-2 rounded-md bg-teal-100 px-2 py-0.5 text-xs font-bold text-teal-800">
                {settings?.edition || "2026"}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/admin"
              className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs sm:text-sm font-bold text-slate-700 shadow-xs hover:bg-slate-50 transition"
            >
              <Shield className="h-4 w-4 text-teal-600" />
              <span>Painel Admin</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Conteúdo Principal */}
      <main className="mx-auto max-w-5xl px-4 py-10 sm:py-16 text-center">
        {/* Badge da Feira */}
        <div className="inline-flex items-center gap-2 rounded-full bg-teal-100/80 border border-teal-200 px-4 py-1.5 text-xs font-bold text-teal-900 shadow-xs">
          <Sparkles className="h-4 w-4 text-teal-700" />
          <span>{settings?.name || "Sistema Oficial de Avaliação de Feira de Ciências"}</span>
        </div>

        {/* Título Principal */}
        <h1 className="mt-6 text-3xl sm:text-5xl font-black tracking-tight text-slate-900 leading-tight">
          Avaliação Científica Ágil, <br className="hidden sm:inline" />
          <span className="text-teal-600">Transparente</span> e em Tempo Real
        </h1>

        <p className="mx-auto mt-4 max-w-2xl text-sm sm:text-base text-slate-600 leading-relaxed">
          Plataforma oficial para jurados e comissão organizadora. Lançamento rápido de notas pelo celular, cálculo de médias com desempate automático e classificação instantânea.
        </p>

        {/* Grade de Portais de Acesso */}
        <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-6 text-left max-w-3xl mx-auto">
          {/* Card: Área do Avaliador (Mobile-First) */}
          <Link
            href="/avaliar"
            className="group relative flex flex-col justify-between rounded-3xl border-2 border-teal-500 bg-white p-6 sm:p-8 shadow-xl shadow-teal-900/5 hover:border-teal-600 hover:shadow-2xl transition duration-200"
          >
            <div>
              <div className="flex items-center justify-between">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-teal-500 text-white shadow-md shadow-teal-500/30 group-hover:scale-105 transition">
                  <Smartphone className="h-6 w-6" />
                </div>
                <span className="rounded-full bg-teal-100 px-3 py-1 text-xs font-black text-teal-800">
                  Mobile-First
                </span>
              </div>

              <h2 className="mt-6 text-2xl font-black text-slate-900 group-hover:text-teal-700 transition">
                Área do Avaliador
              </h2>
              <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                Acesso direto sem necessidade de senha. Digite seu nome, escolha o projeto e atribua notas táteis nos 10 critérios oficiais.
              </p>

              <div className="mt-4 flex flex-wrap gap-2 text-xs font-semibold text-teal-800">
                <span className="flex items-center gap-1 rounded-md bg-teal-50 px-2 py-1">
                  <CheckCircle2 className="h-3.5 w-3.5 text-teal-600" />
                  Botões Táteis (0 a 10 pts)
                </span>
                <span className="flex items-center gap-1 rounded-md bg-teal-50 px-2 py-1">
                  <CheckCircle2 className="h-3.5 w-3.5 text-teal-600" />
                  Selo "Avaliado por você"
                </span>
              </div>
            </div>

            <div className="mt-8 flex items-center justify-between pt-4 border-t border-slate-100 font-bold text-teal-700">
              <span>Iniciar Avaliações</span>
              <ArrowRight className="h-5 w-5 transform group-hover:translate-x-1.5 transition" />
            </div>
          </Link>

          {/* Card: Painel Administrativo */}
          <Link
            href="/admin"
            className="group relative flex flex-col justify-between rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-md hover:border-slate-300 hover:shadow-xl transition duration-200"
          >
            <div>
              <div className="flex items-center justify-between">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-900 text-white shadow-md shadow-slate-900/30 group-hover:scale-105 transition">
                  <BarChart3 className="h-6 w-6" />
                </div>
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-700">
                  Coordenação
                </span>
              </div>

              <h2 className="mt-6 text-2xl font-black text-slate-900 group-hover:text-teal-700 transition">
                Painel Administrativo
              </h2>
              <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                Pódio e classificação em tempo real, auditoria de fichas individuais, gestão de projetos, administradores, exportação CSV e impressão oficial.
              </p>

              <div className="mt-4 flex flex-wrap gap-2 text-xs font-semibold text-slate-700">
                <span className="flex items-center gap-1 rounded-md bg-slate-100 px-2 py-1">
                  <CheckCircle2 className="h-3.5 w-3.5 text-slate-500" />
                  Pódio 1º, 2º e 3º Lugares
                </span>
                <span className="flex items-center gap-1 rounded-md bg-slate-100 px-2 py-1">
                  <CheckCircle2 className="h-3.5 w-3.5 text-slate-500" />
                  Desempate Oficial
                </span>
              </div>
            </div>

            <div className="mt-8 flex items-center justify-between pt-4 border-t border-slate-100 font-bold text-slate-800">
              <span>Acessar Painel</span>
              <ArrowRight className="h-5 w-5 transform group-hover:translate-x-1.5 transition" />
            </div>
          </Link>
        </div>

        {/* Indicadores Rápidos */}
        <section className="mt-14 grid grid-cols-2 sm:grid-cols-4 gap-4 text-center max-w-3xl mx-auto">
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
            <span className="text-2xl sm:text-3xl font-black text-teal-700">{projectsCount || 6}</span>
            <span className="block text-xs font-semibold text-slate-500 mt-1">Projetos Inscritos</span>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
            <span className="text-2xl sm:text-3xl font-black text-teal-700">10</span>
            <span className="block text-xs font-semibold text-slate-500 mt-1">Critérios Oficiais</span>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
            <span className="text-2xl sm:text-3xl font-black text-teal-700">100</span>
            <span className="block text-xs font-semibold text-slate-500 mt-1">Pontos Máximos</span>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
            <span className="text-2xl sm:text-3xl font-black text-teal-700">Realtime</span>
            <span className="block text-xs font-semibold text-slate-500 mt-1">Sincronização</span>
          </div>
        </section>
      </main>

      {/* Rodapé */}
      <footer className="border-t border-slate-200 bg-white py-6 text-center text-xs text-slate-500">
        <p>
          AvaliaFeira – Sistema Oficial de Avaliação e Julgamento Científico © {new Date().getFullYear()}
        </p>
      </footer>
    </div>
  );
}
