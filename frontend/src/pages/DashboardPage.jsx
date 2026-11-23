import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { 
  FileText, Briefcase, CheckCircle2, Clock, Calendar, 
  ArrowRight, Sparkles, AlertCircle, Send, ArrowUpRight,
  TrendingUp, Award, ExternalLink
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { StatusBadge, EligibilityBadge, MatchScoreBadge } from '../components/StatusBadge';

export default function DashboardPage({ onOpenUpload }) {
  const { profile, opportunities, matches, applications, setSelectedApplicationId } = useApp();

  // Dynamic greeting based on time of day
  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  }, []);

  // Compute profile completion percentage
  const profileCompletion = useMemo(() => {
    if (!profile) return 0;
    let score = 20; // base profile created
    if (profile.name) score += 20;
    if (profile.email) score += 20;
    if (profile.education && profile.education.length > 0) score += 20;
    if (profile.skills && profile.skills.length > 0) score += 20;
    return score;
  }, [profile]);

  // Total applications submitted vs total drafts
  const submittedCount = useMemo(() => {
    return applications.filter(a => a.status?.toLowerCase() === 'submitted').length;
  }, [applications]);

  const readyOrDraftCount = useMemo(() => {
    return applications.filter(a => a.status?.toLowerCase() !== 'submitted').length;
  }, [applications]);

  // Top recommended opportunities from matches (or catalog fallback)
  const recommendedOpportunities = useMemo(() => {
    if (matches && matches.length > 0) {
      return matches.slice(0, 4);
    }
    return opportunities.slice(0, 4).map(opp => ({
      ...opp,
      match_score: null,
      eligibility_status: null,
      matched_skills: [],
      missing_skills: opp.required_skills,
    }));
  }, [matches, opportunities]);

  // Upcoming deadlines sorted
  const upcomingDeadlines = useMemo(() => {
    const list = [...opportunities];
    return list.sort((a, b) => new Date(a.deadline) - new Date(b.deadline)).slice(0, 4);
  }, [opportunities]);

  // Recent application activity with company & role joined
  const recentActivities = useMemo(() => {
    if (!applications || applications.length === 0) return [];
    return applications.map(app => {
      const opp = opportunities.find(o => o.id === app.opportunity_id);
      return {
        ...app,
        company: opp ? opp.company : app.opportunity_id,
        role: opp ? opp.role : 'Application',
        deadline: opp ? opp.deadline : null,
      };
    }).reverse().slice(0, 5);
  }, [applications, opportunities]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Top Banner / Greeting */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-ivory-300">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-terracotta-600 mb-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Student Overview</span>
          </div>
          <h1 className="font-editorial text-3xl sm:text-4xl font-bold text-forest-950">
            {greeting}, {profile?.name ? profile.name.split(' ')[0] : 'Student'}!
          </h1>
          <p className="text-sm text-charcoal-600 mt-1">
            {profile 
              ? 'Here is an overview of your matches, upcoming deadlines, and application pipeline.'
              : 'Upload your resume to activate smart matching and browser autofill.'}
          </p>
        </div>

        <div className="flex items-center gap-3">
          {profile ? (
            <button
              onClick={onOpenUpload}
              className="flex items-center gap-2 px-4 py-2 rounded-md bg-ivory-200 hover:bg-ivory-300 border border-ivory-300 text-charcoal-800 text-sm font-medium transition-colors"
            >
              <FileText className="w-4 h-4 text-forest-700" />
              <span>Update Resume</span>
            </button>
          ) : (
            <button
              onClick={onOpenUpload}
              className="flex items-center gap-2 px-5 py-2.5 rounded-md bg-forest-800 hover:bg-forest-900 text-ivory-50 text-sm font-semibold transition-colors shadow-sm"
            >
              <FileText className="w-4 h-4 text-terracotta-300" />
              <span>Upload Resume to Start</span>
            </button>
          )}

          <Link
            to="/opportunities"
            className="flex items-center gap-2 px-4 py-2 rounded-md bg-forest-800 hover:bg-forest-900 text-ivory-50 text-sm font-medium transition-colors shadow-sm"
          >
            <span>Browse Opportunities</span>
            <ArrowRight className="w-4 h-4 text-terracotta-300" />
          </Link>
        </div>
      </div>

      {/* No Profile Callout Banner */}
      {!profile && (
        <div className="p-5 rounded-xl bg-ivory-200 border border-ivory-300 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-lg bg-terracotta-100 text-terracotta-700 flex items-center justify-center shrink-0">
              <AlertCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-editorial text-base font-bold text-forest-950">
                No active resume profile loaded
              </h3>
              <p className="text-xs text-charcoal-600 mt-0.5">
                Upload your PDF resume once to compute accurate match scores, verify eligibility, and autofill forms.
              </p>
            </div>
          </div>
          <button
            onClick={onOpenUpload}
            className="px-4 py-2 rounded-md bg-forest-800 text-ivory-50 text-xs font-semibold shrink-0 hover:bg-forest-900"
          >
            Upload Resume Now
          </button>
        </div>
      )}

      {/* Stats Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Card 1: Resume Status */}
        <div className="bg-[#FAF6F0] p-5 rounded-xl border border-ivory-300 space-y-2">
          <div className="flex items-center justify-between text-xs text-charcoal-500">
            <span>Resume Profile</span>
            <FileText className="w-4 h-4 text-forest-700" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-editorial text-2xl font-bold text-forest-950">
              {profile ? `${profileCompletion}%` : 'Not uploaded'}
            </span>
            {profile && (
              <span className="text-xs font-medium text-forest-600 bg-forest-100 px-1.5 py-0.5 rounded">
                Active
              </span>
            )}
          </div>
          <p className="text-[11px] text-charcoal-500 truncate">
            {profile ? `${profile.skills?.length || 0} skills identified` : 'Upload PDF to extract skills'}
          </p>
        </div>

        {/* Card 2: Matched Opportunities */}
        <div className="bg-[#FAF6F0] p-5 rounded-xl border border-ivory-300 space-y-2">
          <div className="flex items-center justify-between text-xs text-charcoal-500">
            <span>Matched Opportunities</span>
            <TrendingUp className="w-4 h-4 text-terracotta-600" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-editorial text-2xl font-bold text-forest-950">
              {matches?.length || opportunities?.length || 0}
            </span>
            <span className="text-xs text-charcoal-500">catalog roles</span>
          </div>
          <p className="text-[11px] text-charcoal-500">
            {matches?.length > 0 
              ? `${matches.filter(m => m.match_score >= 50).length} high-match roles`
              : 'Deterministic matching active'}
          </p>
        </div>

        {/* Card 3: Applications Submitted */}
        <div className="bg-[#FAF6F0] p-5 rounded-xl border border-ivory-300 space-y-2">
          <div className="flex items-center justify-between text-xs text-charcoal-500">
            <span>Applications Submitted</span>
            <CheckCircle2 className="w-4 h-4 text-forest-700" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-editorial text-2xl font-bold text-forest-950">
              {submittedCount}
            </span>
            <span className="text-xs text-charcoal-500">recorded</span>
          </div>
          <p className="text-[11px] text-charcoal-500">
            {readyOrDraftCount > 0 ? `${readyOrDraftCount} in progress` : 'All applications up to date'}
          </p>
        </div>

        {/* Card 4: Approaching Deadlines */}
        <div className="bg-[#FAF6F0] p-5 rounded-xl border border-ivory-300 space-y-2">
          <div className="flex items-center justify-between text-xs text-charcoal-500">
            <span>Upcoming Deadlines</span>
            <Calendar className="w-4 h-4 text-terracotta-600" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-editorial text-2xl font-bold text-forest-950">
              {upcomingDeadlines.length}
            </span>
            <span className="text-xs text-charcoal-500">next 60 days</span>
          </div>
          <p className="text-[11px] text-charcoal-500 truncate">
            Earliest: {upcomingDeadlines[0]?.deadline || 'None'}
          </p>
        </div>

      </div>

      {/* Main Content Grid: Top Opportunities & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column (8 cols): Recommended Opportunities */}
        <div className="lg:col-span-8 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-editorial text-xl font-bold text-forest-950">
                Recommended Opportunities
              </h2>
              <p className="text-xs text-charcoal-500">
                Ranked by deterministic skill compatibility with your resume
              </p>
            </div>
            <Link
              to="/opportunities"
              className="text-xs font-semibold text-forest-800 hover:text-forest-950 flex items-center gap-1"
            >
              <span>View all ({opportunities.length})</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-3">
            {recommendedOpportunities.map((opp) => (
              <div
                key={opp.id}
                className="bg-white p-5 rounded-xl border border-ivory-300 hover:border-forest-300 transition-all shadow-soft flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-2 max-w-lg">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-editorial text-lg font-bold text-forest-950">
                      {opp.role}
                    </h3>
                    {opp.match_score !== null && (
                      <MatchScoreBadge score={opp.match_score} />
                    )}
                    {opp.eligibility_status && (
                      <EligibilityBadge status={opp.eligibility_status} />
                    )}
                  </div>

                  <p className="text-xs text-charcoal-600 font-medium">
                    {opp.company} • <span className="text-charcoal-500">{opp.location}</span>
                  </p>

                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {opp.required_skills?.map((skill, i) => {
                      const isMatched = opp.matched_skills?.includes(skill);
                      return (
                        <span
                          key={i}
                          className={`text-[11px] px-2 py-0.5 rounded-full font-medium ${
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

                <div className="flex sm:flex-col items-center sm:items-end justify-between gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-0 border-ivory-200">
                  <div className="text-right">
                    <span className="text-[11px] text-charcoal-500 block">Deadline</span>
                    <span className="text-xs font-semibold text-charcoal-800">{opp.deadline}</span>
                  </div>

                  <Link
                    to={`/opportunities?selected=${opp.id}`}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-forest-800 hover:bg-forest-900 text-ivory-50 text-xs font-semibold transition-colors shadow-sm"
                  >
                    <span>View & Apply</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column (4 cols): Application Activity & Deadlines */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Recent Activity Card */}
          <div className="bg-[#FAF6F0] p-5 rounded-xl border border-ivory-300 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-ivory-300">
              <h3 className="font-editorial text-base font-bold text-forest-950">
                Recent Applications
              </h3>
              <Link to="/tracker" className="text-xs font-semibold text-forest-800 hover:underline">
                Tracker
              </Link>
            </div>

            {recentActivities.length === 0 ? (
              <div className="text-center py-6 space-y-2">
                <FileText className="w-8 h-8 text-charcoal-400 mx-auto" />
                <p className="text-xs text-charcoal-600">No applications started yet.</p>
                <Link
                  to="/opportunities"
                  className="inline-block text-xs font-semibold text-terracotta-600 hover:underline"
                >
                  Browse opportunities & apply →
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {recentActivities.map((act) => (
                  <div
                    key={act.id}
                    className="p-3 bg-white rounded-lg border border-ivory-200 flex items-center justify-between gap-2"
                  >
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-forest-950 truncate">
                        {act.role}
                      </p>
                      <p className="text-[11px] text-charcoal-500 truncate">
                        {act.company}
                      </p>
                    </div>
                    <div className="shrink-0">
                      <StatusBadge status={act.status} size="xs" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Upcoming Deadlines Widget */}
          <div className="bg-[#FAF6F0] p-5 rounded-xl border border-ivory-300 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-ivory-300">
              <h3 className="font-editorial text-base font-bold text-forest-950">
                Earliest Deadlines
              </h3>
              <span className="text-[11px] text-charcoal-500">2027 Placement</span>
            </div>

            <div className="space-y-2.5">
              {upcomingDeadlines.map((opp) => (
                <div key={opp.id} className="flex items-center justify-between text-xs py-1">
                  <span className="text-charcoal-800 font-medium truncate max-w-[170px]" title={opp.role}>
                    {opp.role}
                  </span>
                  <span className="font-mono text-[11px] text-charcoal-500 bg-ivory-200 px-2 py-0.5 rounded">
                    {opp.deadline}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Assistant Quick Launch Box */}
          <div className="p-5 rounded-xl bg-forest-900 text-ivory-100 space-y-3">
            <div className="flex items-center gap-2 text-terracotta-300 text-xs font-semibold">
              <Send className="w-4 h-4" />
              <span>Application Assistant</span>
            </div>
            <p className="text-xs text-forest-200 leading-relaxed">
              Have an application draft ready? Launch the Playwright browser assistant to autofill the form.
            </p>
            <Link
              to="/assistant"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-md bg-terracotta-500 hover:bg-terracotta-600 text-white text-xs font-semibold transition-colors"
            >
              <span>Launch Assistant</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

        </div>

      </div>

    </div>
  );
}
