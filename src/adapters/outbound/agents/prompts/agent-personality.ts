import { humanPersonality } from './personalities/human.js';

export const agentPersonality = () => ({
    contributor: humanPersonality,
});
