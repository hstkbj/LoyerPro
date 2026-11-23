import React from 'react';
import { Link } from 'react-router-dom';
import { Seo } from '../seo/Seo';
import { LEGAL } from '../../lib/site';

export interface LegalSection {
  id: string;
  title: string;
  content: React.ReactNode;
}

interface LegalLayoutProps {
  title: string;
  intro: string;
  path: string;
  sections: LegalSection[];
}

export function LegalLayout({ title, intro, path, sections }: LegalLayoutProps) {
  return (
    <>
      <Seo title={title} description={intro} path={path} />

      <div className="border-b border-slate-200 bg-sand-50">
        <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
          <nav aria-label="Fil d'Ariane" className="mb-4 text-xs text-slate-500">
            <Link to="/" className="hover:text-brand-700">Accueil</Link>
            <span className="mx-2" aria-hidden="true">/</span>
            <span className="text-slate-700">{title}</span>
          </nav>
          <h1 className="text-3xl font-bold text-slate-900 sm:text-4xl">{title}</h1>
          <p className="mt-3 max-w-2xl text-base text-slate-600">{intro}</p>
          <p className="mt-4 text-xs font-medium text-slate-500">Dernière mise à jour : {LEGAL.lastUpdated}</p>
        </div>
      </div>

      <div className="mx-auto grid max-w-5xl gap-10 px-4 py-10 sm:px-6 lg:grid-cols-[230px_1fr] lg:px-8 lg:py-14">
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <nav aria-label="Sommaire" className="rounded-2xl border border-slate-200 bg-white p-4">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500">Sommaire</p>
            <ol className="space-y-1.5 text-sm">
              {sections.map((s, i) => (
                <li key={s.id}>
                  <a href={`#${s.id}`} className="block rounded-md px-2 py-1 text-slate-600 hover:bg-brand-50 hover:text-brand-800">
                    {i + 1}. {s.title}
                  </a>
                </li>
              ))}
            </ol>
          </nav>
        </aside>

        <article className="space-y-10 text-[15px] leading-relaxed text-slate-700">
          {sections.map((s, i) => (
            <section key={s.id} id={s.id} className="scroll-mt-24 space-y-3">
              <h2 className="text-xl font-bold text-slate-900 sm:text-2xl">
                {i + 1}. {s.title}
              </h2>
              <div className="space-y-3 [&_a]:font-semibold [&_a]:text-brand-700 [&_a]:underline [&_a]:underline-offset-2 [&_li]:ml-5 [&_li]:list-disc [&_ul]:space-y-1.5">
                {s.content}
              </div>
            </section>
          ))}
        </article>
      </div>
    </>
  );
}
