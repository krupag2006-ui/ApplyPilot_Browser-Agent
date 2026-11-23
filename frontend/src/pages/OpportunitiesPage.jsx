import React, { useState, useMemo, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  Search, Filter, SlidersHorizontal, MapPin, Calendar, 
  Sparkles, CheckCircle2, XCircle, AlertTriangle, ArrowRight,
  Briefcase, FileText, Send, ChevronRight, X, ExternalLink,
  ShieldCheck, Loader2
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { StatusBadge, EligibilityBadge, MatchScoreBadge } from '../components/StatusBadge';
import { api } from '../api/client';

export default function OpportunitiesPage({ onOpenUpload }) {
  const { 
    profile, opportunities, matches, applications, 
    applyToOpportunity, setSelectedApplicationId 
  } = useApp();
  
  const location = useLocation();
  const navigate = useNavigate();

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedLocation, setSelectedLocation] = useState('All');
  const [selectedEligibility, setSelectedEligibility] = useState('All');
  const [sortBy, setSortBy] = useState('match'); // 'match', 'deadline', 'company'
  
  // Selected opportunity for detail modal & AI Eligibility inspection
  const [detailOpportunity, setDetailOpportunity] = useState(null);
  const [eligibilityData, setEligibilityData] = useState(null);
  const [loadingEligibility, setLoadingEligibility] = useState(false);
  const [applyingOpportunityId, setApplyingOpportunityId] = useState(null);

  // Check URL query parameters for pre-selected opportunity (e.g. from Dashboard)
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const selectedId = params.get('selected');
    if (selectedId && opportunities.length > 0) {
      const opp = opportunities.find(o => o.id === selectedId);
      if (opp) {
        handleOpenDetail(opp);
      }
    }
  }, [location.search, opportunities]);

  // Merge opportunities with match details if matches are loaded
  const combinedOpportunities = useMemo(() => {
    const matchMap = new Map();
    matches.forEach(m => matchMap.set(m.id, m));

    return opportunities.map(opp => {
      const match = matchMap.get(opp.id);
      return {
        ...opp,
        match_score: match ? match.match_score : null,
        eligibility_status: match ? match.eligibility_status : null,
        eligibility_reasons: match ? match.eligibility_reasons : [],
        matched_skills: match ? match.matched_skills : [],
        missing_skills: match ? match.missing_skills : opp.required_skills,
      };
    });
  }, [opportunities, matches]);

  // Extract distinct locations
  const availableLocations = useMemo(() => {
    const locs = new Set(opportunities.map(o => o.location));
    return ['All', ...Array.from(locs)];
  }, [opportunities]);

  // Filtered & sorted opportunities
  const filteredOpportunities = useMemo(() => {
    return combinedOpportunities.filter(opp => {
      // Search query (role, company, required skills)
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesRole = opp.role.toLowerCase().includes(q);
        const matchesCompany = opp.company.toLowerCase().includes(q);
        const matchesSkill = opp.required_skills.some(s => s.toLowerCase().includes(q));
        if (!matchesRole && !matchesCompany && !matchesSkill) return false;
      }

      // Location filter
      if (selectedLocation !== 'All' && opp.location !== selectedLocation) {
        return false;
      }

      // Eligibility filter
      if (selectedEligibility !== 'All') {
        if (selectedEligibility === 'eligible' && opp.eligibility_status !== 'eligible') return false;
        if (selectedEligibility === 'needs_review' && opp.eligibility_status !== 'needs_review') return false;
        if (selectedEligibility === 'ineligible' && opp.eligibility_status !== 'ineligible') return false;
      }

      // Category filter (based on keywords in role)
      if (selectedCategory !== 'All') {
        const r = opp.role.toLowerCase();
        if (selectedCategory === 'Backend' && !r.includes('backend')) return false;
        if (selectedCategory === 'Frontend' && !r.includes('frontend')) return false;
        if (selectedCategory === 'Full-Stack' && !r.includes('full-stack') && !r.includes('software')) return false;
        if (selectedCategory === 'Data & ML' && !r.includes('data') && !r.includes('machine learning') && !r.includes('database')) return false;
        if (selectedCategory === 'Cloud & QA' && !r.includes('cloud') && !r.includes('qa')) return false;
        if (selectedCategory === 'Design' && !r.includes('design') && !r.includes('prototyping')) return false;
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === 'match') {
        return (b.match_score ?? -1) - (a.match_score ?? -1);
      }
      if (sortBy === 'deadline') {
        return new Date(a.deadline) - new Date(b.deadline);
      }
      if (sortBy === 'company') {
        return a.company.localeCompare(b.company);
      }
      return 0;
    });
  }, [combinedOpportunities, searchQuery, selectedLocation, selectedEligibility, selectedCategory, sortBy]);

  // Open detail modal and fetch live eligibility endpoint
  const handleOpenDetail = async (opp) => {
    setDetailOpportunity(opp);
    setEligibilityData(null);

    if (profile?.profile_id) {
      setLoadingEligibility(true);
      try {
        const res = await api.checkEligibility(opp.id, profile.profile_id);
        setEligibilityData(res);
      } catch (err) {
        console.error('Failed to fetch eligibility:', err);
      } finally {
        setLoadingEligibility(false);
      }
    }
  };

  // Check if an application already exists for this opportunity
  const getExistingApplication = (opportunityId) => {
    return applications.find(a => a.opportunity_id === opportunityId);
  };

  // Handle Apply button click
  const handleApply = async (opportunity) => {
    if (!profile) {
      onOpenUpload();
      return;
    }

    setApplyingOpportunityId(opportunity.id);
    try {
      const app = await applyToOpportunity(opportunity.id);
      if (app) {
        setSelectedApplicationId(app.id);
        setDetailOpportunity(null);
        navigate('/assistant');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setApplyingOpportunityId(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-ivory-300">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-terracotta-600 mb-1">
            <Briefcase className="w-3.5 h-3.5" />
            <span>Opportunities Catalog</span>
          </div>
          <h1 className="font-editorial text-3xl sm:text-4xl font-bold text-forest-950">
            Discover & Verify Opportunities
          </h1>
          <p className="text-sm text-charcoal-600 mt-1 max-w-2xl">
            Ten curated fictional internship positions with realistic degree criteria and skill stacks. 
            All eligibility verification is executed deterministically without guesswork.
          </p>
        </div>

        {!profile && (
          <button
            onClick={onOpenUpload}
            className="flex items-center gap-2 px-4 py-2.5 rounded-md bg-forest-800 hover:bg-forest-900 text-ivory-50 text-xs font-semibold shrink-0 shadow-sm"
          >
            <Sparkles className="w-3.5 h-3.5 text-terracotta-300" />
            <span>Upload Resume to View Matches</span>
          </button>
        )}
      </div>

      {/* Category Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-ivory-300 text-sm">
        {['All', 'Backend', 'Frontend', 'Full-Stack', 'Data & ML', 'Cloud & QA', 'Design'].map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-colors shrink-0 ${
              selectedCategory === cat
                ? 'bg-forest-800 text-ivory-50'
                : 'bg-ivory-200 text-charcoal-700 hover:bg-ivory-300'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Search & Filter Controls */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3 p-4 bg-[#FAF6F0] rounded-xl border border-ivory-300">
        
        {/* Search Input */}
        <div className="md:col-span-5 relative">
          <Search className="w-4 h-4 text-charcoal-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by role, company, or skills (e.g. Python, React)..."
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-ivory-300 bg-white text-xs sm:text-sm text-charcoal-900 focus:border-terracotta-500"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-2.5 text-charcoal-400 hover:text-charcoal-700"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Location Dropdown */}
        <div className="md:col-span-3">
          <select
            value={selectedLocation}
            onChange={(e) => setSelectedLocation(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-ivory-300 bg-white text-xs sm:text-sm text-charcoal-900 focus:border-terracotta-500"
          >
            <option value="All">All Locations</option>
            {availableLocations.filter(l => l !== 'All').map(loc => (
              <option key={loc} value={loc}>{loc}</option>
            ))}
          </select>
        </div>

        {/* Eligibility Filter */}
        <div className="md:col-span-2">
          <select
            value={selectedEligibility}
            onChange={(e) => setSelectedEligibility(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-ivory-300 bg-white text-xs sm:text-sm text-charcoal-900 focus:border-terracotta-500"
          >
            <option value="All">All Eligibility</option>
            <option value="eligible">Eligible Only</option>
            <option value="needs_review">Needs Review</option>
            <option value="ineligible">Ineligible</option>
          </select>
        </div>

        {/* Sort By */}
        <div className="md:col-span-2">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-ivory-300 bg-white text-xs sm:text-sm text-charcoal-900 focus:border-terracotta-500"
          >
            <option value="match">Highest Match</option>
            <option value="deadline">Closest Deadline</option>
            <option value="company">Company Name</option>
          </select>
        </div>

      </div>

      {/* Opportunities List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between text-xs text-charcoal-500 px-1">
          <span>Showing {filteredOpportunities.length} of {opportunities.length} opportunities</span>
          {profile && <span>Ranked according to your parsed skills</span>}
        </div>

        {filteredOpportunities.length === 0 ? (
          <div className="text-center py-16 bg-[#FAF6F0] rounded-xl border border-ivory-300 p-8 space-y-3">
            <Briefcase className="w-10 h-10 text-charcoal-400 mx-auto" />
            <h3 className="font-editorial text-lg font-bold text-forest-950">
              No matching opportunities found
            </h3>
            <p className="text-xs text-charcoal-600 max-w-sm mx-auto">
              Try adjusting your search criteria, clear filters, or reset category to "All".
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('All');
                setSelectedLocation('All');
                setSelectedEligibility('All');
              }}
              className="text-xs font-semibold text-terracotta-600 underline"
            >
              Reset all filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredOpportunities.map((opp) => {
              const existingApp = getExistingApplication(opp.id);
              const isApplying = applyingOpportunityId === opp.id;

              return (
                <div
                  key={opp.id}
                  className="bg-white rounded-xl border border-ivory-300 hover:border-forest-400 transition-all shadow-soft p-5 flex flex-col justify-between gap-4"
                >
                  <div className="space-y-3">
                    
                    {/* Top row: Role & Badges */}
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="font-editorial text-lg font-bold text-forest-950 leading-snug">
                          {opp.role}
                        </h3>
                        <p className="text-xs font-medium text-charcoal-600 mt-0.5">
                          {opp.company}
                        </p>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        {opp.match_score !== null && (
                          <MatchScoreBadge score={opp.match_score} />
                        )}
                        {opp.eligibility_status && (
                          <EligibilityBadge status={opp.eligibility_status} />
                        )}
                      </div>
                    </div>

                    {/* Metadata chips */}
                    <div className="flex flex-wrap items-center gap-3 text-xs text-charcoal-500">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-forest-700" />
                        {opp.location}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-terracotta-600" />
                        Deadline: {opp.deadline}
                      </span>
                    </div>

                    {/* Degree & Year Requirements */}
                    <div className="p-2.5 rounded-lg bg-ivory-100/70 border border-ivory-200 text-xs space-y-1">
                      <div className="flex items-center justify-between text-[11px] text-charcoal-600">
                        <span>Allowed Degrees:</span>
                        <span className="font-semibold uppercase text-forest-900">
                          {opp.eligibility_requirements?.allowed_degrees?.join(', ') || 'Any'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-[11px] text-charcoal-600">
                        <span>Graduation Window:</span>
                        <span className="font-semibold text-forest-900">
                          {opp.eligibility_requirements?.graduation_year_min} – {opp.eligibility_requirements?.graduation_year_max}
                        </span>
                      </div>
                    </div>

                    {/* Required Skills list */}
                    <div>
                      <span className="text-[11px] font-semibold text-charcoal-600 block mb-1.5">
                        Required Skills:
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {opp.required_skills?.map((skill, i) => {
                          const isMatched = opp.matched_skills?.includes(skill);
                          return (
                            <span
                              key={i}
                              className={`text-[11px] px-2 py-0.5 rounded-md font-medium ${
                                isMatched
                                  ? 'bg-forest-100 text-forest-800 border border-forest-200'
                                  : 'bg-ivory-200 text-charcoal-600'
                              }`}
                            >
                              {skill}
                            </span>
                          );
                        })}
                      </div>
                    </div>

                  </div>

                  {/* Actions footer */}
                  <div className="pt-3 border-t border-ivory-200 flex items-center justify-between gap-3">
                    <button
                      onClick={() => handleOpenDetail(opp)}
                      className="text-xs font-semibold text-forest-800 hover:text-forest-950 underline"
                    >
                      Inspect Eligibility & Details
                    </button>

                    <div className="flex items-center gap-2">
                      {existingApp ? (
                        <button
                          onClick={() => {
                            setSelectedApplicationId(existingApp.id);
                            navigate('/assistant');
                          }}
                          className="flex items-center gap-1 px-3 py-1.5 rounded-md bg-ivory-200 hover:bg-ivory-300 text-charcoal-800 text-xs font-semibold border border-ivory-300"
                        >
                          <StatusBadge status={existingApp.status} size="xs" />
                          <span className="ml-1">Open in Assistant →</span>
                        </button>
                      ) : (
                        <button
                          disabled={isApplying}
                          onClick={() => handleApply(opp)}
                          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-md bg-forest-800 hover:bg-forest-900 text-ivory-50 text-xs font-semibold transition-colors shadow-sm disabled:opacity-50"
                        >
                          {isApplying ? (
                            <>
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              <span>Creating Draft...</span>
                            </>
                          ) : (
                            <>
                              <Send className="w-3.5 h-3.5 text-terracotta-300" />
                              <span>Apply with Assistant</span>
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  </div>

                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Opportunity Details & AI Eligibility Modal */}
      {detailOpportunity && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-charcoal-950/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#FAF6F0] rounded-xl border border-ivory-300 shadow-lifted max-w-2xl w-full overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-ivory-300 flex items-start justify-between bg-ivory-100">
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-terracotta-600">
                  Opportunity Analysis
                </span>
                <h2 className="font-editorial text-2xl font-bold text-forest-950 mt-0.5">
                  {detailOpportunity.role}
                </h2>
                <p className="text-xs text-charcoal-600">
                  {detailOpportunity.company} • {detailOpportunity.location}
                </p>
              </div>
              <button
                onClick={() => setDetailOpportunity(null)}
                className="p-1 rounded-md text-charcoal-400 hover:text-charcoal-700 hover:bg-ivory-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6">
              
              {/* AI Eligibility Checker Section */}
              <div className="p-4 rounded-xl bg-white border border-ivory-300 shadow-soft space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-ivory-200">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-forest-700" />
                    <h3 className="font-editorial text-base font-bold text-forest-950">
                      AI Eligibility Analysis
                    </h3>
                  </div>
                  {detailOpportunity.match_score !== null && (
                    <MatchScoreBadge score={detailOpportunity.match_score} />
                  )}
                </div>

                {!profile ? (
                  <div className="text-center py-4 space-y-2">
                    <p className="text-xs text-charcoal-600">
                      Upload your resume to perform live eligibility analysis against this role.
                    </p>
                    <button
                      onClick={() => {
                        setDetailOpportunity(null);
                        onOpenUpload();
                      }}
                      className="px-4 py-2 rounded-md bg-forest-800 text-ivory-50 text-xs font-semibold"
                    >
                      Upload Resume
                    </button>
                  </div>
                ) : loadingEligibility ? (
                  <div className="flex items-center justify-center gap-2 py-4 text-xs text-charcoal-600">
                    <Loader2 className="w-4 h-4 animate-spin text-forest-700" />
                    <span>Verifying graduation year and skill aliases with backend...</span>
                  </div>
                ) : (
                  <div className="space-y-3">
                    
                    {/* Status & Reasons Banner */}
                    <div className="p-3 rounded-lg bg-ivory-100 border border-ivory-200 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-charcoal-700">Verification Result:</span>
                        <EligibilityBadge status={eligibilityData?.eligibility_status || detailOpportunity.eligibility_status} />
                      </div>
                      
                      <div className="text-xs text-charcoal-700 space-y-1">
                        <span className="font-semibold text-forest-950 block">Analysis Reasons:</span>
                        {(eligibilityData?.reasons || detailOpportunity.eligibility_reasons || []).map((reason, i) => (
                          <p key={i} className="flex items-start gap-1.5 text-charcoal-600">
                            <span className="text-forest-700">•</span>
                            <span>{reason}</span>
                          </p>
                        ))}
                      </div>
                    </div>

                    {/* Skill Breakdown */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                      
                      {/* Matched skills */}
                      <div className="p-3 rounded-lg bg-[#F2F8F5] border border-[#C8E3D5] space-y-1.5">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-[#164330]">
                          <CheckCircle2 className="w-4 h-4 text-[#2C7B58]" />
                          <span>Matching Skills ({detailOpportunity.matched_skills?.length || 0})</span>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {detailOpportunity.matched_skills?.length > 0 ? (
                            detailOpportunity.matched_skills.map((s, i) => (
                              <span key={i} className="text-[11px] px-2 py-0.5 rounded bg-white text-forest-800 font-medium border border-forest-200">
                                {s}
                              </span>
                            ))
                          ) : (
                            <span className="text-[11px] text-charcoal-500 italic">None matched</span>
                          )}
                        </div>
                      </div>

                      {/* Missing skills */}
                      <div className="p-3 rounded-lg bg-[#FAF5F2] border border-[#EACEC5] space-y-1.5">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-[#7E3523]">
                          <AlertTriangle className="w-4 h-4 text-terracotta-500" />
                          <span>Missing Skills ({detailOpportunity.missing_skills?.length || 0})</span>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {detailOpportunity.missing_skills?.length > 0 ? (
                            detailOpportunity.missing_skills.map((s, i) => (
                              <span key={i} className="text-[11px] px-2 py-0.5 rounded bg-white text-terracotta-800 font-medium border border-terracotta-200">
                                {s}
                              </span>
                            ))
                          ) : (
                            <span className="text-[11px] text-forest-700 font-medium">All required skills present!</span>
                          )}
                        </div>
                      </div>

                    </div>

                    {/* Legal / Ethical Notice */}
                    <p className="text-[11px] text-charcoal-400 italic">
                      Disclaimer: AI estimates are deterministic advisory recommendations based on extracted text and do not guarantee final hiring decisions.
                    </p>

                  </div>
                )}
              </div>

              {/* Position Overview & Requirements */}
              <div className="space-y-3">
                <h3 className="font-editorial text-base font-bold text-forest-950">
                  Role Requirements & Guidelines
                </h3>
                <div className="p-3.5 bg-white rounded-lg border border-ivory-200 text-xs text-charcoal-700 space-y-2">
                  <p>
                    <span className="font-semibold text-charcoal-900">Application Deadline:</span> {detailOpportunity.deadline}
                  </p>
                  <p>
                    <span className="font-semibold text-charcoal-900">Location Type:</span> {detailOpportunity.location}
                  </p>
                  <p>
                    <span className="font-semibold text-charcoal-900">Eligible Degree Categories:</span> {detailOpportunity.eligibility_requirements?.allowed_degrees?.join(', ').toUpperCase()}
                  </p>
                  <p>
                    <span className="font-semibold text-charcoal-900">Batch Graduation Window:</span> {detailOpportunity.eligibility_requirements?.graduation_year_min} to {detailOpportunity.eligibility_requirements?.graduation_year_max}
                  </p>
                </div>
              </div>

            </div>

            {/* Modal Actions */}
            <div className="px-6 py-4 border-t border-ivory-300 bg-ivory-100 flex items-center justify-between">
              <button
                onClick={() => setDetailOpportunity(null)}
                className="px-4 py-2 rounded-md border border-ivory-300 text-charcoal-700 text-xs font-semibold hover:bg-ivory-200"
              >
                Close
              </button>

              <button
                onClick={() => handleApply(detailOpportunity)}
                className="flex items-center gap-2 px-5 py-2.5 rounded-md bg-forest-800 hover:bg-forest-900 text-ivory-50 text-xs font-semibold transition-colors shadow-sm"
              >
                <Send className="w-4 h-4 text-terracotta-300" />
                <span>Apply with Browser Assistant</span>
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
