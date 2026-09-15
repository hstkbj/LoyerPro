/**
 * Intégration réelle de FedaPay Checkout.js.
 * ---------------------------------------------------------------------------
 * Jusqu'ici, "payer un abonnement" fabriquait un faux identifiant de
 * transaction (`'TX_FP_' + Date.now()`) sans jamais appeler FedaPay : aucun
 * argent n'était réellement collecté. Ce module ouvre le VRAI widget de
 * paiement FedaPay (carte bancaire, MTN Mobile Money, Moov Money) et ne
 * confirme le paiement qu'après vérification côté serveur (voir
 * /api/fedapay/verify-transaction), pour ne jamais activer un abonnement sur
 * la seule foi d'une réponse côté navigateur (qui pourrait être falsifiée).
 *
 * Documentation FedaPay Checkout.js : https://docs.fedapay.com/introduction/en/checkoutjs-en
 *
 * Prérequis pour que ce module fonctionne réellement (sinon message clair
 * affiché à l'utilisateur, sans jamais planter l'app) :
 *   - Le script `https://cdn.fedapay.com/checkout.js` doit être chargé
 *     (ajouté dans index.html).
 *   - VITE_FEDAPAY_PUBLIC_KEY doit être définie (clé publique sandbox ou live).
 *   - FEDAPAY_SECRET_KEY doit être définie côté serveur pour la vérification.
 */

export interface FedaPayCheckoutOptions {
  amount: number; // Montant dans la devise ci-dessous (ex: 15000 pour 15 000 XOF)
  currency: string; // 'XOF', 'XAF', etc. — doit correspondre à ce que votre compte FedaPay accepte
  description: string;
  customerEmail?: string;
  customerFirstname?: string;
  customerLastname?: string;
  customerPhone?: string;
  onApproved: (transactionId: number | string) => void;
  onDismissed?: () => void;
  onError?: (message: string) => void;
}

export function isFedaPayReady(): boolean {
  return typeof window !== 'undefined' && Boolean((window as any).FedaPay) && Boolean(
    (import.meta as any).env?.VITE_FEDAPAY_PUBLIC_KEY
  );
}

export function openFedaPayCheckout(opts: FedaPayCheckoutOptions): void {
  const FedaPay = (window as any).FedaPay;
  const publicKey = (import.meta as any).env?.VITE_FEDAPAY_PUBLIC_KEY;

  if (!FedaPay) {
    opts.onError?.(
      "Le module de paiement FedaPay n'a pas pu se charger (connexion internet, bloqueur de publicité, ou script non installé)."
    );
    return;
  }
  if (!publicKey) {
    opts.onError?.(
      "Le paiement en ligne n'est pas encore configuré sur ce site (VITE_FEDAPAY_PUBLIC_KEY manquante). Contactez l'administrateur."
    );
    return;
  }

  // Checkout.js s'attache à un bouton DOM réel : on en crée un invisible,
  // on simule le clic, puis on le retire une fois la boîte de dialogue fermée.
  const tempButton = document.createElement('button');
  tempButton.style.display = 'none';
  tempButton.setAttribute('aria-hidden', 'true');
  document.body.appendChild(tempButton);

  const cleanup = () => {
    if (tempButton.parentNode) tempButton.parentNode.removeChild(tempButton);
  };

  try {
    FedaPay.init(tempButton, {
      public_key: publicKey,
      transaction: {
        amount: Math.round(opts.amount),
        description: opts.description,
      },
      currency: { iso: opts.currency || 'XOF' },
      customer: {
        email: opts.customerEmail,
        firstname: opts.customerFirstname,
        lastname: opts.customerLastname,
        phone_number: opts.customerPhone ? { number: opts.customerPhone } : undefined,
      },
      onComplete: (resp: any) => {
        cleanup();
        // BUG CORRIGÉ : la vraie constante FedaPay s'appelle
        // "CHECKOUT_COMPLETED" (avec un D final), pas "CHECKOUT_COMPLETE".
        // Comme cette dernière n'existe pas sur l'objet FedaPay (donc vaut
        // "undefined"), la comparaison échouait TOUJOURS — même quand le
        // paiement avait réellement réussi — et affichait à tort "le
        // paiement n'a pas abouti". On vérifie aussi en secours le statut
        // réel de la transaction, pour ne plus jamais dépendre d'une seule
        // constante du SDK.
        const isDismissed = resp.reason === FedaPay.DIALOG_DISMISSED;
        const isCompleted =
          resp.reason === FedaPay.CHECKOUT_COMPLETED ||
          resp.transaction?.status === 'approved' ||
          resp.transaction?.status === 'pending'; // 'pending' possible sur certains Mobile Money : on vérifie ensuite côté serveur

        if (isDismissed) {
          opts.onDismissed?.();
        } else if (isCompleted && resp.transaction?.id) {
          opts.onApproved(resp.transaction.id);
        } else {
          opts.onError?.('Le paiement n\'a pas abouti. Aucun montant n\'a été débité.');
        }
      },
    });
    tempButton.click();
  } catch (err: any) {
    cleanup();
    opts.onError?.(err?.message || 'Erreur lors de l\'ouverture du module de paiement.');
  }
}

/**
 * Vérifie côté serveur (avec la clé secrète FedaPay, jamais exposée au
 * navigateur) que la transaction est bien "approved" avant d'activer quoi
 * que ce soit. Ne JAMAIS activer un abonnement sur la seule foi du callback
 * client ci-dessus : un visiteur malveillant pourrait falsifier la réponse
 * dans son navigateur. Réutilise la route déjà existante côté serveur
 * (server/app.ts: GET /api/fedapay/verify-transaction/:id).
 */
export async function verifyFedaPayTransaction(transactionId: number | string): Promise<{
  approved: boolean;
  simulated?: boolean;
  status?: string;
  error?: string;
}> {
  try {
    const res = await fetch(`/api/fedapay/verify-transaction/${transactionId}`);
    const data = await res.json();

    if (!res.ok) {
      return { approved: false, error: data?.error || `Erreur HTTP ${res.status}` };
    }

    const tx = data?.['v1/transaction'] || data; // supporte le mode simulation local (objet plat)
    const status = tx?.status;
    return {
      approved: status === 'approved',
      status,
      simulated: Boolean(data?.notice),
    };
  } catch (err: any) {
    return { approved: false, error: err?.message || 'Erreur réseau lors de la vérification du paiement.' };
  }
}
