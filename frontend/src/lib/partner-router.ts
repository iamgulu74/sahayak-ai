import { CHANNEL_PARTNERS, ChannelPartner, RoutingStatus, FundAvailabilityStatus } from "./partners-data";

export interface PartnerWithDistance extends ChannelPartner {
  distanceKm: number;
  compositeScore: number;
  reroutedFrom?: string; // original partner name if auto-rerouted
  rerouteReason?: string;
}

export interface RerouteResult {
  originalPartner: ChannelPartner;
  reroutedPartner: PartnerWithDistance;
  reason: string;
  timestamp: string;
}

// Haversine distance formula in kilometers
export function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// Routing & Fund availability score: available=100, limited=50, restricted=10
function fundScore(status: FundAvailabilityStatus): number {
  return { available: 100, limited: 50, restricted: 10 }[status] ?? 50;
}

// Processing speed score: faster = higher (10 days = 100, 30 days = 30)
function speedScore(days: number): number {
  if (days <= 0) return 50;
  return Math.max(20, Math.min(100, 110 - days * 2.5));
}

// Scheme compatibility score
function schemeCompatibilityScore(partner: ChannelPartner, schemeId?: string): number {
  if (!schemeId) return 70;
  return partner.supportedSchemes.includes(schemeId) ? 100 : 0;
}

// Distance score: closer = higher (max 100 at 0km, 0 at 300km)
function distanceScore(km: number): number {
  return Math.max(0, 100 - (km / 300) * 100);
}

export interface PartnerFilterOptions {
  lat?: number;
  lng?: number;
  state?: string;
  schemeId?: string;
  category?: string;
  radiusKm?: number;
  limit?: number;
  allowRestricted?: boolean;
}

export function rankPartners(options: PartnerFilterOptions): PartnerWithDistance[] {
  const {
    lat,
    lng,
    state,
    schemeId,
    category = "SC",
    radiusKm = 600,
    limit = 10,
    allowRestricted = false,
  } = options;

  // Filter out pure reference-only apex bodies for direct routing
  let pool = CHANNEL_PARTNERS.filter((p) => !p.isReferenceOnly);

  if (!allowRestricted) {
    // Keep available and limited; exclude completely restricted unless requested
    pool = pool.filter((p) => p.routingStatus !== "restricted");
  }

  // Filter by state if provided (strict isolation to selected state)
  if (state && state.toLowerCase() !== "all states" && state.toLowerCase() !== "all") {
    pool = pool.filter(
      (p) => p.state.toLowerCase() === state.toLowerCase()
    );
  }

  // Filter by scheme compatibility if provided
  if (schemeId) {
    const compatible = pool.filter((p) => p.supportedSchemes.includes(schemeId));
    if (compatible.length > 0) pool = compatible;
  }

  // Filter by social category
  if (category) {
    const catMatches = pool.filter((p) => p.supportedCategories.includes(category));
    if (catMatches.length > 0) pool = catMatches;
  }

  // Score & calculate distance
  const withScores: PartnerWithDistance[] = pool.map((partner) => {
    const distKm = lat && lng ? haversineKm(lat, lng, partner.lat, partner.lng) : 0;
    const ds = distanceScore(distKm);
    const fs = fundScore(partner.fundAvailability);
    const cs = schemeCompatibilityScore(partner, schemeId);
    const ss = speedScore(partner.avgProcessingDays);
    const ps = partner.performanceScore || 85;

    // Composite: scheme 35%, fund 25%, performance/speed 25%, distance 15%
    const compositeScore = Math.round(
      cs * 0.35 + fs * 0.25 + ((ss + ps) / 2) * 0.25 + ds * 0.15
    );

    return {
      ...partner,
      distanceKm: Math.round(distKm * 10) / 10,
      compositeScore,
    };
  });

  return withScores
    .sort((a, b) => b.compositeScore - a.compositeScore)
    .slice(0, limit);
}

/**
 * Intelligent Partner Auto-Rerouting (PRD Addendum Section 2.3)
 * If the selected or top partner becomes restricted or has limited funds/high backlog,
 * this function automatically surfaces the best alternate partner supporting the scheme.
 */
export function getAutoReroutedPartner(
  originalPartnerId: string,
  schemeId: string,
  state: string
): RerouteResult | null {
  const original = CHANNEL_PARTNERS.find((p) => p.id === originalPartnerId);
  if (!original) return null;

  // If original is already 🟢 available, no rerouting required
  if (original.fundAvailability === "available" && original.routingStatus === "available") {
    return null;
  }

  // Find eligible alternative: must support scheme, must be 'available' fund status
  const candidates = CHANNEL_PARTNERS.filter(
    (p) =>
      p.id !== originalPartnerId &&
      !p.isReferenceOnly &&
      p.supportedSchemes.includes(schemeId) &&
      p.fundAvailability === "available"
  );

  if (candidates.length === 0) return null;

  // Rank candidate partners by composite score
  const ranked = rankPartners({
    state,
    schemeId,
    allowRestricted: false,
    limit: 5,
  }).filter((p) => p.id !== originalPartnerId && p.fundAvailability === "available");

  const bestAlternative = ranked[0] || {
    ...candidates[0],
    distanceKm: 12.5,
    compositeScore: 92,
  };

  const reason =
    original.fundAvailability === "restricted"
      ? `Original partner (${original.name}) is currently NOT accepting applications due to quota limits.`
      : `Original partner (${original.name}) has limited fund availability and an elevated application backlog (${original.currentLoad}).`;

  return {
    originalPartner: original,
    reroutedPartner: {
      ...bestAlternative,
      reroutedFrom: original.name,
      rerouteReason: reason,
    },
    reason,
    timestamp: new Date().toISOString(),
  };
}

export const INDIAN_STATES = [
  "All States",
  "Assam",
  "Bihar",
  "Odisha",
  "Delhi",
  "Andhra Pradesh",
  "Karnataka",
  "Maharashtra",
  "Gujarat",
  "Himachal Pradesh",
  "West Bengal",
  "Uttar Pradesh",
  "Tamil Nadu",
  "Arunachal Pradesh",
  "Chhattisgarh",
  "Goa",
  "Haryana",
  "Jharkhand",
  "Kerala",
  "Madhya Pradesh",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Telangana",
  "Tripura",
  "Uttarakhand",
];
