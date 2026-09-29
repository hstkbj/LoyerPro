import { createApp } from '../server/app.js';

// Sur Vercel, une app Express est directement compatible avec l'interface
// attendue par les Serverless Functions ((req, res) => void) : il suffit de
// l'exporter telle quelle. Le wrapper "serverless-http" (conçu à l'origine
// pour le format d'évènement AWS Lambda, différent de celui de Vercel)
// provoquait un blocage silencieux de chaque requête jusqu'au timeout
// (FUNCTION_INVOCATION_TIMEOUT) — il n'a jamais été nécessaire ici.
const app = createApp();

export default app;