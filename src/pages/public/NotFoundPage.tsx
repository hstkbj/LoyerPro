import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Home, Search } from 'lucide-react';
import { Seo } from '../../components/seo/Seo';

export function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <>
      <Seo title="Page introuvable" description="Cette page n'existe pas ou a été déplacée." noindex />
      <section className="relative overflow-hidden bg-sand-50">
        <div className="mx-auto flex min-h-[70vh] max-w-3xl flex-col items-center justify-center px-4 py-20 text-center sm:px-6">
          <p className="font-display text-8xl font-bold leading-none text-brand-700 sm:text-9xl" aria-hidden="true">
            404
          </p>
          <h1 className="mt-6 text-2xl font-bold text-slate-900 sm:text-3xl">Cette page est introuvable</h1>
          <p className="mt-3 max-w-md text-slate-600">
            Le lien est peut-être incorrect, ou l'annonce n'est plus disponible. Reprenez votre recherche depuis l'un
            de ces points de départ.
          </p>

          <div className="mt-8 flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
            <Link
              to="/"
              className="inline-flex items-center justify-center gap-2 rounded-md bg-brand-700 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-800"
            >
              <Home className="h-4 w-4" aria-hidden="true" />
              Retour à l'accueil
            </Link>
            <Link
              to="/properties"
              className="inline-flex items-center justify-center gap-2 rounded-md border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-800 transition-colors hover:bg-slate-50"
            >
              <Search className="h-4 w-4" aria-hidden="true" />
              Voir les logements
            </Link>
          </div>

          <button
            type="button"
            onClick={() => navigate(-1)}
            className="mt-6 inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-brand-700"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Revenir à la page précédente
          </button>
        </div>
      </section>
    </>
  );
}
