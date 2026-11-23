import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  ArrowRight, Sparkles, ShieldCheck, CheckCircle2, Clock, 
  Send, Compass, Briefcase, FileText, Terminal, ArrowUpRight,
  ChevronRight, Users, Star, Award
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { MatchScoreBadge, EligibilityBadge } from '../components/StatusBadge';

export default function LandingPage({ onOpenUpload }) {
  const { profile, opportunities, matches } = useApp();
  const navigate = useNavigate();

  const handleGetStarted = () => {
    if (profile) {
      navigate('/dashboard');
    } else {
      onOpenUpload();
    }
  };

  return (
    <div className="space-y-24 pb-16">
      
      {/* Hero Section */}
      <section className="relative pt-12 md:pt-20 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Column: Editorial Headline & Messaging */}
            <div className="lg:col-span-7 space-y-6 text-left">
              
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-forest-100/80 border border-forest-200 text-forest-800 text-xs font-semibold tracking-wide">
                <Sparkles className="w-3.5 h-3.5 text-terracotta-600" />
                <span>Next-Gen Application Copilot for Students</span>
              </div>

              <h1 className="font-editorial text-4xl sm:text-5xl md:text-6xl font-bold text-forest-950 leading-[1.12]">
                Less Applying.<br />
                <span className="italic font-normal text-terracotta-600">More Achieving.</span>
              </h1>

              <p className="text-base sm:text-lg text-charcoal-700 max-w-xl leading-relaxed">
                Tired of re-typing your name, college, and projects into dozens of application portals? 
                Upload your resume once. ApplyPilot extracts your profile, checks eligibility deterministically, 
                and autofills demo applications using browser automation — while always keeping you in the driver’s seat.
              </p>

              {/* CTAs */}
              <div className="flex flex-wrap items-center gap-4 pt-2">
                <button
                  onClick={handleGetStarted}
                  className="flex items-center gap-2.5 px-6 py-3.5 rounded-lg bg-forest-800 hover:bg-forest-900 text-ivory-50 text-base font-semibold shadow-card transition-all hover:-translate-y-0.5"
                >
                  <span>{profile ? 'Go to Dashboard' : 'Get Started Free'}</span>
                  <ArrowRight className="w-4 h-4 text-terracotta-300" />
                </button>

                <Link
                  to="/opportunities"
                  className="flex items-center gap-2 px-6 py-3.5 rounded-lg bg-ivory-200 hover:bg-ivory-300 border border-ivory-400 text-forest-900 text-base font-semibold transition-all"
                >
                  <span>Explore Opportunities</span>
                  <ArrowUpRight className="w-4 h-4 text-charcoal-600" />
                </Link>
              </div>

              {/* Trust Indicators */}
              <div className="pt-6 border-t border-ivory-300 grid grid-cols-3 gap-4 text-left">
                <div>
                  <p className="font-editorial text-2xl font-bold text-forest-900">100%</p>
                  <p className="text-xs text-charcoal-600 mt-0.5">Deterministic Rules</p>
                </div>
                <div>
                  <p className="font-editorial text-2xl font-bold text-forest-900">0</p>
                  <p className="text-xs text-charcoal-600 mt-0.5">Repetitive Typing</p>
                </div>
                <div>
                  <p className="font-editorial text-2xl font-bold text-forest-900">Human</p>
                  <p className="text-xs text-charcoal-600 mt-0.5">In The Loop Always</p>
                </div>
              </div>

            </div>

            {/* Right Column: Visual Product Showcase Preview */}
            <div className="lg:col-span-5 relative">
              
              {/* Decorative background framing */}
              <div className="absolute -inset-3 bg-gradient-to-tr from-forest-100 via-ivory-300 to-terracotta-50 rounded-2xl -rotate-1 opacity-70"></div>
              
              <div className="relative bg-[#FAF6F0] rounded-xl border border-ivory-300 shadow-lifted p-6 space-y-4">
                
                {/* Header of mock card */}
                <div className="flex items-center justify-between pb-3 border-b border-ivory-300">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-terracotta-400" />
                    <div className="w-3 h-3 rounded-full bg-[#E5B54F]" />
                    <div className="w-3 h-3 rounded-full bg-forest-500" />
                    <span className="text-xs font-mono text-charcoal-500 ml-2">applypilot-agent.local</span>
                  </div>
                  <span className="text-[11px] font-semibold text-forest-700 bg-forest-100 px-2 py-0.5 rounded-full">
                    Active Demo
                  </span>
                </div>

                {/* Candidate preview pill */}
                <div className="p-3 bg-ivory-100 rounded-lg border border-ivory-200 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-forest-800 text-ivory-100 font-bold flex items-center justify-center text-sm">
                      {profile?.name ? profile.name.charAt(0) : 'A'}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-charcoal-900">
                        {profile?.name || 'Alex Example'}
                      </h4>
                      <p className="text-xs text-charcoal-500">
                        {profile?.email || 'alex.example@example.com'} • B.Tech 2027
                      </p>
                    </div>
                  </div>
                  <span className="text-xs font-medium text-forest-700 bg-white px-2 py-1 rounded border border-ivory-300">
                    Parsed
                  </span>
                </div>

                {/* Matched Opportunity Card Preview */}
                <div className="p-4 bg-white rounded-lg border border-ivory-200 shadow-sm space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <h5 className="font-editorial text-base font-bold text-forest-950">
                        Backend Engineering Intern
                      </h5>
                      <p className="text-xs text-charcoal-600">
                        Pebblewing Systems • Remote (India)
                      </p>
                    </div>
                    <MatchScoreBadge score={100} />
                  </div>

                  <div className="flex flex-wrap gap-1.5">
                    <span className="text-[11px] px-2 py-0.5 rounded bg-forest-100 text-forest-800 font-medium">Python</span>
                    <span className="text-[11px] px-2 py-0.5 rounded bg-forest-100 text-forest-800 font-medium">FastAPI</span>
                    <span className="text-[11px] px-2 py-0.5 rounded bg-forest-100 text-forest-800 font-medium">SQL</span>
                    <span className="text-[11px] px-2 py-0.5 rounded bg-forest-100 text-forest-800 font-medium">Git</span>
                  </div>

                  <div className="pt-2 border-t border-ivory-200 flex items-center justify-between text-xs">
                    <EligibilityBadge status="eligible" />
                    <span className="text-terracotta-700 font-semibold flex items-center gap-1">
                      Ready for Autofill <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>

                {/* Automation step simulation banner */}
                <div className="p-3 bg-forest-900 text-ivory-100 rounded-lg text-xs space-y-1.5 font-mono">
                  <div className="flex items-center justify-between text-[11px] text-terracotta-300">
                    <span>PLAYWRIGHT BROWSER AGENT</span>
                    <span>100% FILLED</span>
                  </div>
                  <p className="text-forest-200 text-[11px]">
                    &gt; Target: http://127.0.0.1:8000/demo/applications/1
                  </p>
                  <p className="text-ivory-100 text-[11px]">
                    &gt; Waiting for student confirmation before submission.
                  </p>
                </div>

              </div>

            </div>

          </div>

        </div>
      </section>

      {/* How It Works Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-terracotta-600">
            Workflow Architecture
          </span>
          <h2 className="font-editorial text-3xl sm:text-4xl font-bold text-forest-950">
            How ApplyPilot Works
          </h2>
          <p className="text-sm sm:text-base text-charcoal-600">
            A transparent four-step cycle that removes application friction without taking away your control.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          
          {/* Step 1 */}
          <div className="bg-[#FAF6F0] p-6 rounded-xl border border-ivory-300 relative space-y-3">
            <div className="w-10 h-10 rounded-lg bg-forest-800 text-ivory-100 font-editorial font-bold text-lg flex items-center justify-center">
              1
            </div>
            <h3 className="font-editorial text-lg font-bold text-forest-950">
              Upload Resume
            </h3>
            <p className="text-xs text-charcoal-600 leading-relaxed">
              Upload your text-based PDF once. The PyMuPDF engine extracts your contact info, graduation year, degrees, and technical skills.
            </p>
          </div>

          {/* Step 2 */}
          <div className="bg-[#FAF6F0] p-6 rounded-xl border border-ivory-300 relative space-y-3">
            <div className="w-10 h-10 rounded-lg bg-forest-800 text-ivory-100 font-editorial font-bold text-lg flex items-center justify-center">
              2
            </div>
            <h3 className="font-editorial text-lg font-bold text-forest-950">
              Deterministic Matching
            </h3>
            <p className="text-xs text-charcoal-600 leading-relaxed">
              Algorithms compare your skills and graduation year against opportunity requirements. You receive transparent percentage scores and reasons.
            </p>
          </div>

          {/* Step 3 */}
          <div className="bg-[#FAF6F0] p-6 rounded-xl border border-ivory-300 relative space-y-3">
            <div className="w-10 h-10 rounded-lg bg-forest-800 text-ivory-100 font-editorial font-bold text-lg flex items-center justify-center">
              3
            </div>
            <h3 className="font-editorial text-lg font-bold text-forest-950">
              Browser Autofill
            </h3>
            <p className="text-xs text-charcoal-600 leading-relaxed">
              Playwright browser automation injects your verified information into application forms seamlessly, saving you hundreds of keystrokes.
            </p>
          </div>

          {/* Step 4 */}
          <div className="bg-[#FAF6F0] p-6 rounded-xl border border-ivory-300 relative space-y-3">
            <div className="w-10 h-10 rounded-lg bg-forest-800 text-ivory-100 font-editorial font-bold text-lg flex items-center justify-center">
              4
            </div>
            <h3 className="font-editorial text-lg font-bold text-forest-950">
              Review & Submit
            </h3>
            <p className="text-xs text-charcoal-600 leading-relaxed">
              You inspect every pre-filled field. No application is ever submitted without your explicit confirmation. Track progress in one place.
            </p>
          </div>

        </div>

      </section>

      {/* Features Showcase Section */}
      <section className="bg-[#F4EFEA] py-16 border-y border-[#EAE2D7]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          
          <div className="max-w-2xl space-y-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-terracotta-600">
              Core Capabilities
            </span>
            <h2 className="font-editorial text-3xl sm:text-4xl font-bold text-forest-950">
              Engineered for Precision & Trust
            </h2>
            <p className="text-sm text-charcoal-600">
              No black-box guesses or fabricated experiences. Everything is verifiable and student-centric.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            <div className="bg-white p-6 rounded-xl border border-ivory-300 shadow-sm space-y-3">
              <div className="w-10 h-10 rounded-lg bg-forest-100 text-forest-800 flex items-center justify-center">
                <FileText className="w-5 h-5" />
              </div>
              <h3 className="font-editorial text-lg font-bold text-forest-950">
                Rule-Based PDF Parsing
              </h3>
              <p className="text-xs text-charcoal-600 leading-relaxed">
                Extracts names, emails, phone numbers, degrees (B.Tech, BCA, MCA, etc.), and canonical skill aliases without sending your resume to third-party ad networks.
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl border border-ivory-300 shadow-sm space-y-3">
              <div className="w-10 h-10 rounded-lg bg-terracotta-100 text-terracotta-700 flex items-center justify-center">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="font-editorial text-lg font-bold text-forest-950">
                Transparent Eligibility Checker
              </h3>
              <p className="text-xs text-charcoal-600 leading-relaxed">
                Understand immediately whether you qualify before applying. See exact missing skills and graduation year criteria, avoiding wasted applications.
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl border border-ivory-300 shadow-sm space-y-3">
              <div className="w-10 h-10 rounded-lg bg-forest-100 text-forest-800 flex items-center justify-center">
                <Terminal className="w-5 h-5" />
              </div>
              <h3 className="font-editorial text-lg font-bold text-forest-950">
                Playwright Browser Agent
              </h3>
              <p className="text-xs text-charcoal-600 leading-relaxed">
                High-speed browser automation fills demo application forms with HMAC verification tokens, leaving you to simply review and approve.
              </p>
            </div>

          </div>

        </div>
      </section>

      {/* Student Benefits Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-forest-900 text-ivory-100 rounded-2xl p-8 sm:p-12 border border-forest-800 shadow-lifted">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            <div className="lg:col-span-8 space-y-4">
              <span className="text-xs font-semibold uppercase tracking-wider text-terracotta-300">
                Why Students Love ApplyPilot
              </span>
              <h2 className="font-editorial text-3xl sm:text-4xl font-bold leading-tight">
                Reclaim 10+ hours every week during placement season.
              </h2>
              <p className="text-sm sm:text-base text-forest-200 max-w-xl leading-relaxed">
                Applying to dozens of companies manually is exhausting and prone to typo mistakes. 
                ApplyPilot ensures your applications are consistent, fully qualified, and fast to submit.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div className="flex items-center gap-2 text-xs sm:text-sm text-ivory-200">
                  <CheckCircle2 className="w-4 h-4 text-terracotta-400 shrink-0" />
                  <span>Eliminate repetitive manual form-filling</span>
                </div>
                <div className="flex items-center gap-2 text-xs sm:text-sm text-ivory-200">
                  <CheckCircle2 className="w-4 h-4 text-terracotta-400 shrink-0" />
                  <span>Never miss an application deadline</span>
                </div>
                <div className="flex items-center gap-2 text-xs sm:text-sm text-ivory-200">
                  <CheckCircle2 className="w-4 h-4 text-terracotta-400 shrink-0" />
                  <span>Transparent matching without secret rejections</span>
                </div>
                <div className="flex items-center gap-2 text-xs sm:text-sm text-ivory-200">
                  <CheckCircle2 className="w-4 h-4 text-terracotta-400 shrink-0" />
                  <span>100% human-approved submissions</span>
                </div>
              </div>
            </div>

            <div className="lg:col-span-4 flex flex-col items-center justify-center text-center p-6 bg-forest-950/60 rounded-xl border border-forest-800/80">
              <Award className="w-12 h-12 text-terracotta-400 mb-3" />
              <p className="font-editorial text-xl font-bold text-ivory-100">
                Ready to take flight?
              </p>
              <p className="text-xs text-forest-300 mt-1 mb-5">
                Takes less than 30 seconds to parse your resume and discover top matches.
              </p>
              <button
                onClick={handleGetStarted}
                className="w-full py-3 px-4 rounded-lg bg-terracotta-500 hover:bg-terracotta-600 text-white font-semibold text-sm transition-colors shadow-sm"
              >
                {profile ? 'Go to Dashboard' : 'Upload Resume & Match'}
              </button>
            </div>

          </div>
        </div>
      </section>

      {/* Final Call to Action */}
      <section className="text-center max-w-3xl mx-auto px-4 space-y-6">
        <h2 className="font-editorial text-3xl sm:text-4xl font-bold text-forest-950">
          Start your job search with a smart copiloted edge.
        </h2>
        <p className="text-sm sm:text-base text-charcoal-600 max-w-xl mx-auto">
          Explore curated opportunities, test the browser automation assistant, and track your applications in one unified dashboard.
        </p>
        <div className="flex justify-center gap-4">
          <button
            onClick={handleGetStarted}
            className="flex items-center gap-2 px-6 py-3 rounded-lg bg-forest-800 hover:bg-forest-900 text-ivory-50 text-sm font-semibold transition-colors shadow-sm"
          >
            <span>{profile ? 'Open Dashboard' : 'Upload Resume'}</span>
            <ArrowRight className="w-4 h-4 text-terracotta-300" />
          </button>
          <Link
            to="/opportunities"
            className="px-6 py-3 rounded-lg border border-ivory-400 hover:bg-ivory-200 text-charcoal-800 text-sm font-semibold transition-colors"
          >
            Browse Listings
          </Link>
        </div>
      </section>

    </div>
  );
}
