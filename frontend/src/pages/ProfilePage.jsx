import React, { useState } from 'react';
import { 
  User, Settings, FileText, CheckCircle2, Sparkles, 
  MapPin, Sliders, Bell, RefreshCw, Trash2, ShieldCheck,
  Save, AlertCircle
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function ProfilePage({ onOpenUpload }) {
  const { profile, setProfile, preferences, updatePreferences, addNotification } = useApp();

  // Local state for preferences
  const [categories, setCategories] = useState(preferences.preferredCategories || []);
  const [locations, setLocations] = useState(preferences.preferredLocations || []);
  const [remoteOnly, setRemoteOnly] = useState(preferences.remoteOnly || false);
  const [minMatchScore, setMinMatchScore] = useState(preferences.minMatchScore || 40);
  const [emailAlerts, setEmailAlerts] = useState(preferences.emailNotifications ?? true);

  const availableCategories = [
    'Backend', 'Frontend', 'Full-Stack', 'Data Analysis', 
    'Machine Learning', 'Cloud', 'QA Automation', 'UI Prototyping'
  ];

  const availableLocations = [
    'Remote (India)', 'Bengaluru', 'Pune', 'Hyderabad', 
    'Mumbai', 'Chennai', 'Noida', 'Kochi'
  ];

  const toggleCategory = (cat) => {
    setCategories(prev => 
      prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
    );
  };

  const toggleLocation = (loc) => {
    setLocations(prev => 
      prev.includes(loc) ? prev.filter(l => l !== loc) : [...prev, loc]
    );
  };

  const handleSavePreferences = () => {
    updatePreferences({
      preferredCategories: categories,
      preferredLocations: locations,
      remoteOnly,
      minMatchScore,
      emailNotifications: emailAlerts,
    });
  };

  const handleClearProfile = () => {
    if (window.confirm('Are you sure you want to clear your local profile data?')) {
      setProfile(null);
      addNotification('info', 'Local profile cleared. You can upload a new resume anytime.');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-ivory-300">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-terracotta-600 mb-1">
            <User className="w-3.5 h-3.5" />
            <span>Candidate Credentials & Settings</span>
          </div>
          <h1 className="font-editorial text-3xl sm:text-4xl font-bold text-forest-950">
            Profile & Match Preferences
          </h1>
          <p className="text-sm text-charcoal-600 mt-1 max-w-2xl">
            Review parsed resume information extracted by ApplyPilot and customize opportunity recommendations.
          </p>
        </div>

        <button
          onClick={onOpenUpload}
          className="flex items-center gap-1.5 px-4 py-2 rounded-md bg-forest-800 hover:bg-forest-900 text-ivory-50 text-xs font-semibold transition-colors shadow-sm shrink-0"
        >
          <RefreshCw className="w-3.5 h-3.5 text-terracotta-300" />
          <span>Re-upload Resume</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column (5 cols): Resume Credentials Card */}
        <div className="lg:col-span-5 space-y-6">
          
          <div className="bg-[#FAF6F0] p-6 rounded-xl border border-ivory-300 shadow-soft space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-ivory-300">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-full bg-forest-800 text-ivory-100 font-bold flex items-center justify-center text-sm">
                  {profile?.name ? profile.name.charAt(0) : 'S'}
                </div>
                <div>
                  <h3 className="font-editorial text-lg font-bold text-forest-950">
                    {profile?.name || 'No Profile Uploaded'}
                  </h3>
                  <p className="text-xs text-charcoal-500">
                    Database Record #{profile?.profile_id || '—'}
                  </p>
                </div>
              </div>
              <span className="text-[11px] font-semibold text-forest-800 bg-forest-100 px-2 py-0.5 rounded">
                {profile ? 'Active' : 'Unset'}
              </span>
            </div>

            {profile ? (
              <div className="space-y-4 text-xs">
                <div>
                  <span className="text-charcoal-500 block text-[11px] uppercase tracking-wider mb-0.5">
                    Email Address
                  </span>
                  <p className="font-medium text-charcoal-900">{profile.email || 'Not extracted'}</p>
                </div>

                <div>
                  <span className="text-charcoal-500 block text-[11px] uppercase tracking-wider mb-0.5">
                    Phone Number
                  </span>
                  <p className="font-medium text-charcoal-900">{profile.phone || 'Not provided'}</p>
                </div>

                <div>
                  <span className="text-charcoal-500 block text-[11px] uppercase tracking-wider mb-1">
                    Identified Technical Skills ({profile.skills?.length || 0})
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {profile.skills?.map((s, i) => (
                      <span key={i} className="px-2 py-0.5 rounded-full bg-forest-100 text-forest-800 font-medium">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <span className="text-charcoal-500 block text-[11px] uppercase tracking-wider mb-1">
                    Extracted Education Records
                  </span>
                  <div className="p-3 bg-white rounded-lg border border-ivory-200 space-y-1">
                    {profile.education?.map((line, i) => (
                      <p key={i} className="text-charcoal-800 font-medium">{line}</p>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-6 space-y-2">
                <FileText className="w-8 h-8 text-charcoal-400 mx-auto" />
                <p className="text-xs text-charcoal-600">
                  Upload a PDF resume to populate your student credentials.
                </p>
                <button
                  onClick={onOpenUpload}
                  className="px-4 py-2 rounded-md bg-forest-800 text-ivory-50 text-xs font-semibold"
                >
                  Upload Resume Now
                </button>
              </div>
            )}

            {profile && (
              <div className="pt-3 border-t border-ivory-300 flex justify-between items-center text-xs">
                <button
                  onClick={handleClearProfile}
                  className="text-terracotta-700 hover:text-terracotta-900 font-semibold flex items-center gap-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Reset Local Profile</span>
                </button>
                <span className="text-[11px] text-charcoal-400">Deterministic storage</span>
              </div>
            )}
          </div>

        </div>

        {/* Right Column (7 cols): Preferences & Recommendation Criteria */}
        <div className="lg:col-span-7 space-y-6">
          
          <div className="bg-white p-6 rounded-xl border border-ivory-300 shadow-soft space-y-6">
            <div>
              <h3 className="font-editorial text-lg font-bold text-forest-950">
                Application & Discovery Preferences
              </h3>
              <p className="text-xs text-charcoal-500">
                Tune which opportunities are prioritized in your feed and dashboard.
              </p>
            </div>

            {/* Preferred Categories */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-charcoal-700 uppercase tracking-wider">
                Preferred Opportunity Domains
              </label>
              <div className="flex flex-wrap gap-2">
                {availableCategories.map((cat) => {
                  const selected = categories.includes(cat);
                  return (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => toggleCategory(cat)}
                      className={`text-xs px-3 py-1.5 rounded-full font-medium transition-colors ${
                        selected
                          ? 'bg-forest-800 text-ivory-50 border border-forest-800'
                          : 'bg-ivory-100 text-charcoal-700 border border-ivory-300 hover:bg-ivory-200'
                      }`}
                    >
                      {cat} {selected && '✓'}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Preferred Locations */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-charcoal-700 uppercase tracking-wider">
                Preferred Job Locations
              </label>
              <div className="flex flex-wrap gap-2">
                {availableLocations.map((loc) => {
                  const selected = locations.includes(loc);
                  return (
                    <button
                      key={loc}
                      type="button"
                      onClick={() => toggleLocation(loc)}
                      className={`text-xs px-3 py-1.5 rounded-full font-medium transition-colors ${
                        selected
                          ? 'bg-forest-800 text-ivory-50 border border-forest-800'
                          : 'bg-ivory-100 text-charcoal-700 border border-ivory-300 hover:bg-ivory-200'
                      }`}
                    >
                      {loc} {selected && '✓'}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Remote Only Toggle */}
            <div className="flex items-center justify-between p-3.5 rounded-lg bg-ivory-100 border border-ivory-200">
              <div>
                <p className="text-xs font-semibold text-charcoal-900">Remote Only Positions</p>
                <p className="text-[11px] text-charcoal-500">Only recommend fully remote internships</p>
              </div>
              <input
                type="checkbox"
                checked={remoteOnly}
                onChange={(e) => setRemoteOnly(e.target.checked)}
                className="w-4 h-4 rounded text-forest-700 border-ivory-400 focus:ring-terracotta-500"
              />
            </div>

            {/* Min Match Score Slider */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="font-semibold text-charcoal-700 uppercase tracking-wider">
                  Minimum Recommended Match Score
                </span>
                <span className="font-bold text-forest-900 font-mono text-sm">{minMatchScore}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                step="5"
                value={minMatchScore}
                onChange={(e) => setMinMatchScore(Number(e.target.value))}
                className="w-full accent-forest-700 cursor-pointer"
              />
              <p className="text-[11px] text-charcoal-400">
                Roles below {minMatchScore}% match will still appear in search, but will not be highlighted in your dashboard.
              </p>
            </div>

            {/* Save Button */}
            <div className="pt-4 border-t border-ivory-200 flex justify-end">
              <button
                type="button"
                onClick={handleSavePreferences}
                className="flex items-center gap-2 px-5 py-2.5 rounded-md bg-forest-800 hover:bg-forest-900 text-ivory-50 text-xs font-semibold transition-colors shadow-sm"
              >
                <Save className="w-4 h-4 text-terracotta-300" />
                <span>Save Match Preferences</span>
              </button>
            </div>

          </div>

        </div>

      </div>

    </div>
  );
}
