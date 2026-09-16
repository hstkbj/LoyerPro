import serverless from 'serverless-http';
import { createApp } from '../server/app.ts';

const app = createApp();

export default serverless(app);
