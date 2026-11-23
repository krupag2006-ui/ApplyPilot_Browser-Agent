import React from 'react';
import { CheckCircle2, Clock, AlertTriangle, XCircle, FileText } from 'lucide-react';

export function StatusBadge({ status, size = 'sm' }) {
  const norm = String(status || '').toLowerCase();

  const sizeClasses = size === 'xs' 
    ? 'text-[11px] px-2 py-0.5' 
    : size === 'md' 
    ? 'text-xs px-3 py-1 font-semibold' 
    : 'text-xs px-2.5 py-0.5';

  if (norm === 'submitted') {
    return (
      <span className={`inline-flex items-center gap-1 rounded-full font-medium bg-[#E8F3EE] text-[#1D5E43] border border-[#CDE5D8] ${sizeClasses}`}>
        <CheckCircle2 className="w-3.5 h-3.5 text-[#1D5E43]" />
        Submitted
      </span>
    );
  }

  if (norm === 'ready for review' || norm === 'ready') {
    return (
      <span className={`inline-flex items-center gap-1 rounded-full font-medium bg-[#FFF6E9] text-[#A66113] border border-[#FBE0B8] ${sizeClasses}`}>
        <Clock className="w-3.5 h-3.5 text-[#A66113]" />
        Ready for Review
      </span>
    );
  }

  if (norm === 'draft') {
    return (
      <span className={`inline-flex items-center gap-1 rounded-full font-medium bg-[#F3EFEA] text-[#635A4F] border border-[#E3DBD0] ${sizeClasses}`}>
        <FileText className="w-3.5 h-3.5 text-[#635A4F]" />
        Draft
      </span>
    );
  }

  if (norm === 'under review' || norm === 'in progress') {
    return (
      <span className={`inline-flex items-center gap-1 rounded-full font-medium bg-[#EBF2F7] text-[#246187] border border-[#CFDFEC] ${sizeClasses}`}>
        <Clock className="w-3.5 h-3.5 text-[#246187]" />
        Under Review
      </span>
    );
  }

  if (norm === 'selected') {
    return (
      <span className={`inline-flex items-center gap-1 rounded-full font-medium bg-[#DEF5E5] text-[#146631] border border-[#BCE8C7] ${sizeClasses}`}>
        <CheckCircle2 className="w-3.5 h-3.5 text-[#146631]" />
        Selected
      </span>
    );
  }

  if (norm === 'rejected') {
    return (
      <span className={`inline-flex items-center gap-1 rounded-full font-medium bg-[#FBEBEA] text-[#A62F24] border border-[#F4CCC8] ${sizeClasses}`}>
        <XCircle className="w-3.5 h-3.5 text-[#A62F24]" />
        Rejected
      </span>
    );
  }

  return (
    <span className={`inline-flex items-center gap-1 rounded-full font-medium bg-ivory-200 text-charcoal-700 border border-ivory-300 ${sizeClasses}`}>
      {status}
    </span>
  );
}

export function EligibilityBadge({ status }) {
  const norm = String(status || '').toLowerCase();

  if (norm === 'eligible') {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#E8F3EE] text-[#1D5E43] border border-[#CDE5D8]">
        <CheckCircle2 className="w-3.5 h-3.5" />
        Eligible
      </span>
    );
  }

  if (norm === 'ineligible') {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#FBEBEA] text-[#A62F24] border border-[#F4CCC8]">
        <XCircle className="w-3.5 h-3.5" />
        Ineligible
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#FFF6E9] text-[#A66113] border border-[#FBE0B8]">
      <AlertTriangle className="w-3.5 h-3.5" />
      Needs Review
    </span>
  );
}

export function MatchScoreBadge({ score }) {
  const numeric = Number(score) || 0;
  let color = 'bg-[#FBEBEA] text-[#A62F24] border-[#F4CCC8]';
  if (numeric >= 75) {
    color = 'bg-[#E8F3EE] text-[#1D5E43] border-[#CDE5D8]';
  } else if (numeric >= 40) {
    color = 'bg-[#FFF6E9] text-[#A66113] border-[#FBE0B8]';
  }

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-bold border ${color}`}>
      {numeric}% Match
    </span>
  );
}
