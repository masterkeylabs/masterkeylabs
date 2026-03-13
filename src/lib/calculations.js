/**
 * Masterkey Audit Engine - Proxy Layer
 * This file maintains backward compatibility by re-exporting modules from /lib/audit
 */

// Formatters
export { formatINR, formatINRFull } from './audit/formatters';

// Parsers
export { parseNumericalRange, parseHoursRange } from './audit/parsers';

// Config
export { VISIBILITY_CONFIG, NIGHT_LOSS_CONFIG, OPERATIONAL_CONFIG } from './audit/config';

// Engines
export { calculateVisibility } from './audit/engines/visibility';
export { calculateLossAudit, BUSINESS_VERTICALS } from './audit/engines/operational';
export { calculateNightLoss } from './audit/engines/night-loss';
export { calculateAIThreat } from './audit/engines/ai-threat';
export { calculateExportOpportunity, EXPORT_CATEGORIES } from './audit/engines/export';

// Signal Metadata (Commonly used in UI)
import { VISIBILITY_CONFIG } from './audit/config';
export const VISIBILITY_SIGNALS = [
    { id: 'hasGoogleMyBusiness', label: 'Google Business Profile (verified + complete)', points: VISIBILITY_CONFIG.WEIGHTS.hasGoogleMyBusiness },
    { id: 'hasWebsite', label: 'Mobile-optimised Website', points: VISIBILITY_CONFIG.WEIGHTS.hasWebsite },
    { id: 'hasWhatsApp', label: 'WhatsApp Business (active)', points: VISIBILITY_CONFIG.WEIGHTS.hasWhatsApp },
    { id: 'activeSocialMedia', label: 'Active Social Media (2+ platforms)', points: VISIBILITY_CONFIG.WEIGHTS.activeSocialMedia },
    { id: 'seoOptimized', label: 'Local SEO (keyword optimised)', points: VISIBILITY_CONFIG.WEIGHTS.seoOptimized },
    { id: 'hasCRM', label: 'CRM / Lead Management Tool', points: VISIBILITY_CONFIG.WEIGHTS.hasCRM },
    { id: 'runsAds', label: 'Paid Ads (Google / Meta active)', points: VISIBILITY_CONFIG.WEIGHTS.runsAds },
];
