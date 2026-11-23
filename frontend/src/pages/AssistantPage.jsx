import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Send, Terminal, CheckCircle2, Clock, ShieldAlert, 
  ExternalLink, Copy, Check, Sparkles, AlertCircle, 
  ArrowRight, RefreshCw, User, Briefcase, FileText, Loader2
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useApp } from '../context/AppContext';
import { StatusBadge, EligibilityBadge } from '../components/StatusBadge';
import { api } from '../api/client';

export default function AssistantPage({ onOpenUpload }) {
  const { 
    profile, opportunities, applications, selectedApplicationId, 
    setSelectedApplicationId, fetchApplications, addNotification 
  } = useApp();
  const navigate = useNavigate();

  // Active application object
  const activeApp = useMemo(() => {
    if (!applications || applications.length === 0) return null;
    if (selectedApplicationId) {
      const found = applications.find(a => a.id === selectedApplicationId);
      if (found) return found;
    }
    // Default to first application
    return applications[0];
  }, [applications, selectedApplicationId]);

  // Active opportunity object
  const activeOpp = useMemo(() => {
    if (!activeApp) return null;
    return opportunities.find(o => o.id === activeApp.opportunity_id);
  }, [activeApp, opportunities]);

  // Automation state
  const [isAutofilling, setIsAutofilling] = useState(false);
  const [autofillProgress, setAutofillProgress] = useState(0);
  const [autofillSteps, setAutofillSteps] = useState([]);
  const [demoPrepData, setDemoPrepData] = useState(null);
  const [copiedCmd, setCopiedCmd] = useState(false);

  // Form review & editable fields
  const [formFields, setFormFields] = useState({
    name: '',
    email: '',
    phone: '',
    skills: '',
    education: '',
  });
  const [fieldsFilled, setFieldsFilled] = useState({
    name: false,
    email: false,
    phone: false,
    skills: false,
    education: false,
  });

  // User explicit authorization checkbox
  const [userApproved, setUserApproved] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionSuccess, setSubmissionSuccess] = useState(false);

  // Initialize fields from profile whenever profile or activeApp changes
  useEffect(() => {
    if (profile) {
      setFormFields({
        name: profile.name || '',
        email: profile.email || '',
        phone: profile.phone || '',
        skills: (profile.skills || []).join(', '),
        education: (profile.education || []).join('\n'),
      });
    }
    // If the application is already submitted, reset success state
    if (activeApp?.status === 'Submitted') {
      setSubmissionSuccess(true);
      setFieldsFilled({
        name: true,
        email: true,
        phone: true,
        skills: true,
        education: true,
      });
    } else {
      setSubmissionSuccess(false);
      setUserApproved(false);
    }
  }, [profile, activeApp]);

  // Run the Autofill Simulation & Backend Demo Preparation
  const handleStartAutofill = async () => {
    if (!activeApp) return;

    setIsAutofilling(true);
    setAutofillProgress(10);
    setAutofillSteps([
      'Contacting backend demo prepare endpoint...',
    ]);

    try {
      // 1. Call backend prepare API
      const prep = await api.prepareDemo(activeApp.id);
      setDemoPrepData(prep);
      setAutofillProgress(30);

      // 2. Step through automated field filling with realistic visual feedback
      await new Promise(r => setTimeout(r, 400));
      setAutofillSteps(prev => [
        ...prev,
        'Application status updated to "Ready for Review"',
        'Extracting candidate parameters from profile...',
      ]);
      setFieldsFilled(prev => ({ ...prev, name: true, email: true }));
      setAutofillProgress(55);

      await new Promise(r => setTimeout(r, 450));
      setAutofillSteps(prev => [
        ...prev,
        'Normalizing skill aliases and formatting education records...',
      ]);
      setFieldsFilled(prev => ({ ...prev, phone: true, skills: true }));
      setAutofillProgress(80);

      await new Promise(r => setTimeout(r, 450));
      setAutofillSteps(prev => [
        ...prev,
        'Form fields populated successfully. Awaiting explicit user confirmation.',
      ]);
      setFieldsFilled(prev => ({ ...prev, education: true }));
      setAutofillProgress(100);

      // Refresh applications from backend
      if (profile?.profile_id) {
        await fetchApplications(profile.profile_id);
      }

      addNotification('success', 'Form fields autofilled! Please review and approve.');
    } catch (err) {
      console.error('Autofill error:', err);
      addNotification('error', err.message || 'Failed to prepare demo application.');
    } finally {
      setIsAutofilling(false);
    }
  };

  // Submit the application with explicit user consent
  const handleSubmitFinal = async () => {
    if (!userApproved) {
      addNotification('error', 'Please check the explicit approval box before submitting.');
      return;
    }
    if (!activeApp) return;

    setIsSubmitting(true);
    try {
      // Fetch the token from demo form if needed or call demo form directly
      // In FastAPI: GET /demo/applications/{id} contains the hidden token
      const demoFormHtml = await fetch(`http://127.0.0.1:8000/demo/applications/${activeApp.id}`).then(r => r.text());
      const tokenMatch = demoFormHtml.match(/name="token"\s+value="([^"]+)"/);
      const token = tokenMatch ? tokenMatch[1] : '';

      if (!token) {
        throw new Error('Could not retrieve security token from demo form. Ensure application is prepared.');
      }

      // Submit form
      await api.submitDemo(activeApp.id, {
        token,
        name: formFields.name,
        email: formFields.email,
        phone: formFields.phone,
        skills: formFields.skills,
        education: formFields.education,
      });

      // Refresh applications list
      if (profile?.profile_id) {
        await fetchApplications(profile.profile_id);
      }

      setSubmissionSuccess(true);
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 },
      });
      addNotification('success', 'Application submitted and verified successfully!');
    } catch (err) {
      console.error('Submission error:', err);
      addNotification('error', err.message || 'Submission failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopyCliCommand = () => {
    const cmd = demoPrepData?.command || `python -m app.browser_agent --application-id ${activeApp?.id}`;
    navigator.clipboard.writeText(cmd);
    setCopiedCmd(true);
    addNotification('info', 'Command copied to clipboard!');
    setTimeout(() => setCopiedCmd(false), 2000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-ivory-300">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-terracotta-600 mb-1">
            <Send className="w-3.5 h-3.5" />
            <span>Autonomous Application Assistant</span>
          </div>
          <h1 className="font-editorial text-3xl sm:text-4xl font-bold text-forest-950">
            Browser Automation & Form Autofill
          </h1>
          <p className="text-sm text-charcoal-600 mt-1 max-w-2xl">
            Inspect pre-filled parameters, execute the local Playwright browser agent, and review 
            fields before authorizing final submission.
          </p>
        </div>

        {/* Application Selector */}
        {applications.length > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-charcoal-600">Active Application:</span>
            <select
              value={activeApp?.id || ''}
              onChange={(e) => setSelectedApplicationId(Number(e.target.value))}
              className="px-3 py-1.5 rounded-lg border border-ivory-300 bg-white text-xs font-semibold text-charcoal-900 focus:border-terracotta-500 shadow-sm"
            >
              {applications.map(app => {
                const opp = opportunities.find(o => o.id === app.opportunity_id);
                return (
                  <option key={app.id} value={app.id}>
                    #{app.id} • {opp ? opp.role : app.opportunity_id} ({app.status})
                  </option>
                );
              })}
            </select>
          </div>
        )}
      </div>

      {/* No Applications State */}
      {(!applications || applications.length === 0) ? (
        <div className="text-center py-16 bg-[#FAF6F0] rounded-xl border border-ivory-300 p-8 space-y-4">
          <div className="w-12 h-12 rounded-full bg-ivory-200 text-charcoal-500 flex items-center justify-center mx-auto">
            <Briefcase className="w-6 h-6" />
          </div>
          <h2 className="font-editorial text-2xl font-bold text-forest-950">
            No applications in your queue
          </h2>
          <p className="text-xs sm:text-sm text-charcoal-600 max-w-md mx-auto">
            To use the Application Assistant, select an opportunity from the catalog and click 
            "Apply with Assistant" to create an application draft.
          </p>
          <div className="flex justify-center gap-3 pt-2">
            <Link
              to="/opportunities"
              className="flex items-center gap-2 px-5 py-2.5 rounded-md bg-forest-800 text-ivory-50 text-xs font-semibold hover:bg-forest-900 transition-colors shadow-sm"
            >
              <span>Explore Opportunities</span>
              <ArrowRight className="w-4 h-4 text-terracotta-300" />
            </Link>
          </div>
        </div>
      ) : (
        /* Main Assistant Interface */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column (5 cols): Opportunity & Applicant Card */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Target Opportunity Details */}
            <div className="bg-[#FAF6F0] p-5 rounded-xl border border-ivory-300 space-y-4 shadow-soft">
              <div className="flex items-center justify-between pb-2 border-b border-ivory-300">
                <span className="text-xs font-semibold uppercase tracking-wider text-charcoal-600">
                  Target Opportunity
                </span>
                <StatusBadge status={activeApp?.status} size="xs" />
              </div>

              {activeOpp ? (
                <div className="space-y-3">
                  <div>
                    <h3 className="font-editorial text-xl font-bold text-forest-950">
                      {activeOpp.role}
                    </h3>
                    <p className="text-xs font-medium text-charcoal-600">
                      {activeOpp.company} • {activeOpp.location}
                    </p>
                  </div>

                  <div className="p-3 bg-white rounded-lg border border-ivory-200 text-xs space-y-1.5">
                    <p className="flex justify-between">
                      <span className="text-charcoal-500">Deadline:</span>
                      <span className="font-semibold text-charcoal-800">{activeOpp.deadline}</span>
                    </p>
                    <p className="flex justify-between">
                      <span className="text-charcoal-500">Allowed Degrees:</span>
                      <span className="font-semibold text-forest-900 uppercase">
                        {activeOpp.eligibility_requirements?.allowed_degrees?.join(', ')}
                      </span>
                    </p>
                  </div>

                  <div>
                    <span className="text-[11px] font-semibold text-charcoal-600 block mb-1">
                      Required Skills:
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {activeOpp.required_skills?.map((s, i) => (
                        <span key={i} className="text-[11px] px-2 py-0.5 rounded bg-forest-100 text-forest-800 font-medium">
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-charcoal-600">Opportunity details unavailable.</p>
              )}
            </div>

            {/* Extracted Applicant Information */}
            <div className="bg-white p-5 rounded-xl border border-ivory-300 space-y-4 shadow-soft">
              <div className="flex items-center justify-between pb-2 border-b border-ivory-200">
                <span className="text-xs font-semibold uppercase tracking-wider text-charcoal-600">
                  Applicant Profile (Extracted)
                </span>
                <span className="text-[11px] text-forest-700 font-semibold bg-forest-100 px-2 py-0.5 rounded">
                  ID: #{profile?.profile_id || activeApp?.profile_id}
                </span>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <span className="text-charcoal-500 block text-[11px]">Full Name</span>
                  <p className="font-bold text-charcoal-900">{profile?.name || formFields.name || 'Alex Example'}</p>
                </div>
                <div>
                  <span className="text-charcoal-500 block text-[11px]">Email</span>
                  <p className="font-medium text-charcoal-900">{profile?.email || formFields.email || 'alex@example.com'}</p>
                </div>
                <div>
                  <span className="text-charcoal-500 block text-[11px]">Phone</span>
                  <p className="font-medium text-charcoal-900">{profile?.phone || formFields.phone || '+91 98765 43210'}</p>
                </div>
                <div>
                  <span className="text-charcoal-500 block text-[11px]">Skills Extracted</span>
                  <p className="text-charcoal-700">{formFields.skills || 'None'}</p>
                </div>
                <div>
                  <span className="text-charcoal-500 block text-[11px]">Education Records</span>
                  <pre className="text-charcoal-700 whitespace-pre-wrap font-sans text-xs bg-ivory-100 p-2 rounded">
                    {formFields.education || 'B.Tech in Computer Science'}
                  </pre>
                </div>
              </div>
            </div>

            {/* CLI Command Box for Technical Evaluators */}
            <div className="bg-charcoal-950 text-ivory-100 p-4 rounded-xl border border-charcoal-800 space-y-2 font-mono text-xs">
              <div className="flex items-center justify-between text-terracotta-300 text-[11px]">
                <span className="flex items-center gap-1.5">
                  <Terminal className="w-3.5 h-3.5" />
                  Operator Playwright CLI
                </span>
                <button
                  onClick={handleCopyCliCommand}
                  className="hover:text-white flex items-center gap-1 text-[11px]"
                >
                  {copiedCmd ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedCmd ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
              <p className="text-charcoal-300 text-[11px] select-all bg-charcoal-900 p-2 rounded">
                python -m app.browser_agent --application-id {activeApp?.id}
              </p>
              <p className="text-[10px] text-charcoal-400">
                You can also run Playwright directly in PowerShell to watch Chromium autofill the form.
              </p>
            </div>

          </div>

          {/* Right Column (7 cols): Autofill Execution, Review & Submit */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Assistant Action Header & Autofill Button */}
            <div className="bg-[#FAF6F0] p-6 rounded-xl border border-ivory-300 shadow-soft space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="font-editorial text-lg font-bold text-forest-950">
                    Application Assistant
                  </h3>
                  <p className="text-xs text-charcoal-600">
                    Automates repetitive field inputs while maintaining complete human review.
                  </p>
                </div>

                {activeApp?.status !== 'Submitted' ? (
                  <button
                    disabled={isAutofilling}
                    onClick={handleStartAutofill}
                    className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-md bg-forest-800 hover:bg-forest-900 disabled:opacity-50 text-ivory-50 text-xs font-semibold transition-colors shadow-sm shrink-0"
                  >
                    {isAutofilling ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin text-terracotta-300" />
                        <span>Autofilling Form...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 text-terracotta-300" />
                        <span>Autofill Application</span>
                      </>
                    )}
                  </button>
                ) : (
                  <span className="flex items-center gap-1.5 text-xs font-bold text-[#1D5E43] bg-[#E8F3EE] px-3 py-1.5 rounded-md border border-[#CDE5D8]">
                    <CheckCircle2 className="w-4 h-4" />
                    Application Submitted
                  </span>
                )}
              </div>

              {/* Automation Progress Bar & Step Log */}
              {isAutofilling && (
                <div className="space-y-2 pt-2">
                  <div className="w-full h-1.5 bg-ivory-300 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-terracotta-500 transition-all duration-300"
                      style={{ width: `${autofillProgress}%` }}
                    />
                  </div>
                  <div className="p-3 bg-white rounded-lg border border-ivory-200 font-mono text-[11px] text-charcoal-700 space-y-1">
                    {autofillSteps.map((step, idx) => (
                      <p key={idx} className="flex items-center gap-1.5">
                        <span className="text-forest-700">&gt;</span> {step}
                      </p>
                    ))}
                  </div>
                </div>
              )}

              {/* Field Population Checklist */}
              <div className="p-3.5 bg-white rounded-lg border border-ivory-200">
                <span className="text-xs font-semibold text-charcoal-700 block mb-2">
                  Automation Field Status:
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-[11px]">
                  {['name', 'email', 'phone', 'skills', 'education'].map((f) => {
                    const filled = fieldsFilled[f];
                    return (
                      <div
                        key={f}
                        className={`flex items-center gap-1.5 p-1.5 rounded border transition-colors ${
                          filled
                            ? 'bg-[#E8F3EE] border-[#CDE5D8] text-[#1D5E43] font-semibold'
                            : 'bg-ivory-100 border-ivory-300 text-charcoal-500'
                        }`}
                      >
                        {filled ? (
                          <CheckCircle2 className="w-3.5 h-3.5 text-[#1D5E43] shrink-0" />
                        ) : (
                          <Clock className="w-3.5 h-3.5 text-charcoal-400 shrink-0" />
                        )}
                        <span className="capitalize">{f}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Application Review Form */}
            <div className="bg-white p-6 rounded-xl border border-ivory-300 shadow-soft space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-ivory-200">
                <div>
                  <h4 className="font-editorial text-base font-bold text-forest-950">
                    Review Application Form
                  </h4>
                  <p className="text-xs text-charcoal-500">
                    You can edit any field before submitting to the demo system.
                  </p>
                </div>
                
                {/* Direct link to open HTML demo page */}
                <a
                  href={`http://127.0.0.1:8000/demo/applications/${activeApp?.id}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1 text-xs font-semibold text-terracotta-700 hover:text-terracotta-800 underline"
                >
                  <span>Open Local HTML Form</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>

              <div className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-charcoal-700 uppercase tracking-wider mb-1">
                      Applicant Name *
                    </label>
                    <input
                      type="text"
                      disabled={activeApp?.status === 'Submitted'}
                      value={formFields.name}
                      onChange={(e) => setFormFields({ ...formFields, name: e.target.value })}
                      className="w-full px-3 py-2 rounded-md border border-ivory-300 bg-[#FCFBF9] text-xs text-charcoal-900 focus:border-terracotta-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-charcoal-700 uppercase tracking-wider mb-1">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      disabled={activeApp?.status === 'Submitted'}
                      value={formFields.email}
                      onChange={(e) => setFormFields({ ...formFields, email: e.target.value })}
                      className="w-full px-3 py-2 rounded-md border border-ivory-300 bg-[#FCFBF9] text-xs text-charcoal-900 focus:border-terracotta-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-charcoal-700 uppercase tracking-wider mb-1">
                    Phone Number
                  </label>
                  <input
                    type="text"
                    disabled={activeApp?.status === 'Submitted'}
                    value={formFields.phone}
                    onChange={(e) => setFormFields({ ...formFields, phone: e.target.value })}
                    className="w-full px-3 py-2 rounded-md border border-ivory-300 bg-[#FCFBF9] text-xs text-charcoal-900 focus:border-terracotta-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-charcoal-700 uppercase tracking-wider mb-1">
                    Technical Skills (Formatted)
                  </label>
                  <input
                    type="text"
                    disabled={activeApp?.status === 'Submitted'}
                    value={formFields.skills}
                    onChange={(e) => setFormFields({ ...formFields, skills: e.target.value })}
                    className="w-full px-3 py-2 rounded-md border border-ivory-300 bg-[#FCFBF9] text-xs text-charcoal-900 focus:border-terracotta-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-charcoal-700 uppercase tracking-wider mb-1">
                    Education & Graduation Evidence
                  </label>
                  <textarea
                    rows={3}
                    disabled={activeApp?.status === 'Submitted'}
                    value={formFields.education}
                    onChange={(e) => setFormFields({ ...formFields, education: e.target.value })}
                    className="w-full px-3 py-2 rounded-md border border-ivory-300 bg-[#FCFBF9] text-xs text-charcoal-900 focus:border-terracotta-500"
                  />
                </div>
              </div>

              {/* Explicit Human Approval Requirement Box */}
              {activeApp?.status !== 'Submitted' ? (
                <div className="pt-4 border-t border-ivory-200 space-y-4">
                  <div className="p-3.5 rounded-lg bg-[#FAF5F2] border border-[#EACEC5] flex items-start gap-3">
                    <ShieldAlert className="w-5 h-5 text-terracotta-600 shrink-0 mt-0.5" />
                    <div className="space-y-1">
                      <p className="text-xs font-bold text-[#7E3523]">
                        Explicit Human Confirmation Required
                      </p>
                      <p className="text-[11px] text-[#7E3523]/80 leading-relaxed">
                        ApplyPilot adheres to ethical agent rules: we never automatically submit applications 
                        without your explicit review and sign-off.
                      </p>
                    </div>
                  </div>

                  <label className="flex items-start gap-2.5 cursor-pointer text-xs text-charcoal-800">
                    <input
                      type="checkbox"
                      checked={userApproved}
                      onChange={(e) => setUserApproved(e.target.checked)}
                      className="mt-0.5 rounded border-ivory-400 text-forest-700 focus:ring-terracotta-500"
                    />
                    <span>
                      I have reviewed the information above and explicitly authorize ApplyPilot to submit this application.
                    </span>
                  </label>

                  <div className="flex items-center justify-end gap-3 pt-2">
                    <button
                      type="button"
                      disabled={!userApproved || isSubmitting}
                      onClick={handleSubmitFinal}
                      className="flex items-center gap-2 px-6 py-2.5 rounded-md bg-forest-800 hover:bg-forest-900 disabled:opacity-50 text-ivory-50 text-xs font-semibold transition-colors shadow-sm"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Recording Submission...</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="w-4 h-4 text-terracotta-300" />
                          <span>Approve & Submit Application</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="pt-4 border-t border-ivory-200 p-4 rounded-lg bg-[#E8F3EE] border border-[#CDE5D8] flex items-center justify-between">
                  <div className="flex items-center gap-2.5 text-[#1D5E43]">
                    <CheckCircle2 className="w-5 h-5" />
                    <div>
                      <p className="text-xs font-bold">Submission Confirmed</p>
                      <p className="text-[11px] text-[#1D5E43]/80">This application is recorded in SQLite and tracked.</p>
                    </div>
                  </div>
                  <Link
                    to="/tracker"
                    className="text-xs font-semibold text-[#1D5E43] hover:underline flex items-center gap-1"
                  >
                    <span>View in Tracker</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              )}

            </div>

          </div>

        </div>
      )}

    </div>
  );
}
