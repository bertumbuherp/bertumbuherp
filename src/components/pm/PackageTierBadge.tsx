'use client';

import React from 'react';
import { PackageTierType } from '@/lib/types';
import { Package, CheckCircle2 } from 'lucide-react';

interface PackageTierBadgeProps {
  tier?: PackageTierType;
  services?: string[];
  showServicesInline?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const TIER_CONFIG: Record<PackageTierType, { label: string; color: string; bg: string; border: string }> = {
  TIER_A: {
    label: 'Tier A (Enterprise)',
    color: '#8b5cf6', // violet
    bg: 'rgba(139, 92, 246, 0.12)',
    border: 'rgba(139, 92, 246, 0.3)',
  },
  TIER_B: {
    label: 'Tier B (Growth)',
    color: '#3b82f6', // blue
    bg: 'rgba(59, 130, 246, 0.12)',
    border: 'rgba(59, 130, 246, 0.3)',
  },
  TIER_C: {
    label: 'Tier C (Essential)',
    color: '#10b981', // green
    bg: 'rgba(16, 185, 129, 0.12)',
    border: 'rgba(16, 185, 129, 0.3)',
  },
  CUSTOM: {
    label: 'Custom Package',
    color: '#f59e0b', // amber
    bg: 'rgba(245, 158, 11, 0.12)',
    border: 'rgba(245, 158, 11, 0.3)',
  },
};

export default function PackageTierBadge({
  tier = 'CUSTOM',
  services = [],
  showServicesInline = true,
  size = 'md',
}: PackageTierBadgeProps) {
  const config = TIER_CONFIG[tier] || TIER_CONFIG.CUSTOM;

  return (
    <div className="inline-flex flex-wrap items-center gap-1.5">
      {/* Tier Badge */}
      <span
        className="inline-flex items-center gap-1 font-semibold rounded-md transition-all"
        style={{
          color: config.color,
          background: config.bg,
          border: `1px solid ${config.border}`,
          padding: size === 'sm' ? '2px 6px' : size === 'lg' ? '4px 10px' : '3px 8px',
          fontSize: size === 'sm' ? '10px' : size === 'lg' ? '13px' : '11px',
        }}
      >
        <Package size={size === 'sm' ? 10 : size === 'lg' ? 14 : 12} />
        {config.label}
      </span>

      {/* Inline Services Chips (e.g., Amida (A): SMS, CC, Production, Design, Ecommerce, Performance) */}
      {showServicesInline && services.length > 0 && (
        <div className="inline-flex flex-wrap items-center gap-1">
          {services.map((service, idx) => (
            <span
              key={idx}
              className="inline-flex items-center gap-0.5 rounded px-1.5 py-0.5 text-[10px] font-medium"
              style={{
                background: 'var(--bg-page, #f8fafc)',
                color: 'var(--text-secondary, #475569)',
                border: '1px solid var(--border, #e2e8f0)',
              }}
              title={`Paket Layanan: ${service}`}
            >
              <CheckCircle2 size={9} style={{ color: config.color }} />
              {service}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
