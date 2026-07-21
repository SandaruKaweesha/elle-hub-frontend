import { useState } from "react";
import { 
  MapPin, 
  ArrowRight, 
  Info, 
  CalendarDays, 
  Users, 
  Trophy, 
  FileText,
  CheckCircle,
  ChevronLeft
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import api from "../../services/api";

function CreateTournament() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  // Form State mapping perfectly to the database schema
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    location: "",
    tournament_held_date: "",
    end_date: "",
    maximum_team_limit: "",
    maximum_referee_limit: "2",
    rules: "",
    prize_details: ""
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleNext = () => {
    setStep(step + 1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBack = () => {
    setStep(step - 1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    
    try {
      // Get the currently logged-in user
      const userString = localStorage.getItem('user');
      const user = userString ? JSON.parse(userString) : null;
      const organizerId = user?.userId || user?.user_id || user?.id || user?.organizer_id;

      if (!organizerId) {
        throw new Error("Organizer ID not found. Please log in again.");
      }

      // Convert snake_case to camelCase for the backend API
      const payload = {
        organizerId: organizerId,
        title: formData.title,
        description: formData.description,
        location: formData.location,
        startDate: null,
        endDate: formData.end_date,
        tournamentHeldDate: formData.tournament_held_date,
        maximumTeamLimit: parseInt(formData.maximum_team_limit, 10),
        maximumRefereeLimit: parseInt(formData.maximum_referee_limit || 2, 10),
        rules: formData.rules,
        prizeDetails: formData.prize_details
      };

      const response = await api.post('/organizer/tournament/create', payload);
      
      if (response.data && response.data.success !== false) {
        // Success
        navigate("/organizer/dashboard");
      } else {
        throw new Error(response.data.message || "Failed to create tournament.");
      }
    } catch (err) {
      console.error("Tournament creation error:", err);
      setError(err.response?.data?.message || err.message || "An error occurred while creating the tournament.");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto font-['Poppins']">
      
      {/* Breadcrumb & Header */}
      <div className="mb-10">
        <h1 className="text-3xl font-extrabold text-[#111111] mb-2 tracking-tight">Create Tournament</h1>
        <div className="flex items-center text-sm font-medium text-[#888888]">
          <Link to="/organizer" className="hover:text-[#111111] transition-colors">Tournaments</Link>
          <span className="mx-2">/</span>
          <span className="text-[#08733e]">New Creation</span>
        </div>
      </div>

      {/* Stepper */}
      <div className="flex items-center justify-between mb-12 relative max-w-2xl mx-auto">
        {/* Connecting Lines */}
        <div className="absolute top-1/2 left-0 w-full h-[2px] bg-[#e5e5e5] -translate-y-1/2 z-0"></div>
        <div 
          className="absolute top-1/2 left-0 h-[2px] bg-[#00382D] -translate-y-1/2 z-0 transition-all duration-500"
          style={{ width: `${((step - 1) / 3) * 100}%` }}
        ></div>

        {/* Steps */}
        {[
          { num: 1, label: "Basic Info" },
          { num: 2, label: "Schedule" },
          { num: 3, label: "Rewards" },
          { num: 4, label: "Review" }
        ].map((s) => (
          <div key={s.num} className="relative z-10 flex flex-col items-center gap-3 bg-[#f8f7f4] px-4">
            <div className={`
              w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold transition-colors duration-300
              ${step >= s.num ? "bg-[#00382D] text-white shadow-md" : "bg-[#e5e5e5] text-[#888888]"}
            `}>
              {step > s.num ? <CheckCircle size={20} /> : s.num}
            </div>
            <span className={`text-xs font-semibold uppercase tracking-wider ${step >= s.num ? "text-[#111111]" : "text-[#888888]"}`}>
              {s.label}
            </span>
          </div>
        ))}
      </div>

      <form onSubmit={step === 4 ? handleSubmit : (e) => { e.preventDefault(); handleNext(); }}>
        
        {error && (
          <div className="bg-red-50 text-red-700 p-4 rounded-xl text-sm mb-6 border border-red-200">
            {error}
          </div>
        )}

        {/* Step 1: Basic Info */}
        {step === 1 && (
          <div className="bg-white rounded-2xl border border-[#e5e5e5] shadow-sm p-8 md:p-10 mb-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="mb-8 border-b border-[#e5e5e5] pb-6">
              <h2 className="text-2xl font-bold text-[#111111] mb-2">Tournament Foundation</h2>
              <p className="text-[#666666] text-sm">Define the core identity of your event.</p>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-[13px] font-bold text-[#111111] mb-2">
                  Tournament Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="title"
                  required
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="e.g. Sri Lanka National Elle Championship"
                  className="w-full h-12 px-4 bg-white border border-[#d6d8d4] rounded-lg text-sm text-[#111111] focus:ring-2 focus:ring-[#00382D]/20 focus:border-[#00382D] outline-none transition-all placeholder:text-[#888888]"
                />
              </div>

              <div>
                <label className="block text-[13px] font-bold text-[#111111] mb-2">
                  Location <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <MapPin size={18} className="text-[#888888]" />
                  </div>
                  <input
                    type="text"
                    name="location"
                    required
                    value={formData.location}
                    onChange={handleChange}
                    placeholder="Venue or City name"
                    className="w-full h-12 pl-11 pr-4 bg-white border border-[#d6d8d4] rounded-lg text-sm text-[#111111] focus:ring-2 focus:ring-[#00382D]/20 focus:border-[#00382D] outline-none transition-all placeholder:text-[#888888]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[13px] font-bold text-[#111111] mb-2">
                  Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="description"
                  required
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Share the vision, history, or importance of this tournament..."
                  className="w-full min-h-[120px] p-4 bg-white border border-[#d6d8d4] rounded-lg text-sm text-[#111111] focus:ring-2 focus:ring-[#00382D]/20 focus:border-[#00382D] outline-none transition-all resize-y placeholder:text-[#888888]"
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Schedule & Teams */}
        {step === 2 && (
          <div className="bg-white rounded-2xl border border-[#e5e5e5] shadow-sm p-8 md:p-10 mb-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="mb-8 border-b border-[#e5e5e5] pb-6">
              <h2 className="text-2xl font-bold text-[#111111] mb-2">Scheduling & Logistics</h2>
              <p className="text-[#666666] text-sm">Set the timeframe and capacity for your tournament.</p>
            </div>

            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-[13px] font-bold text-[#111111] mb-2">
                    Tournament Date <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <CalendarDays size={18} className="text-[#888888]" />
                    </div>
                    <input
                      type="date"
                      name="tournament_held_date"
                      required
                      value={formData.tournament_held_date}
                      onChange={handleChange}
                      className="w-full h-12 pl-11 pr-4 bg-white border border-[#d6d8d4] rounded-lg text-sm text-[#111111] focus:ring-2 focus:ring-[#00382D]/20 focus:border-[#00382D] outline-none transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[13px] font-bold text-[#111111] mb-2">
                    Registration Deadline Date <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <CalendarDays size={18} className="text-[#888888]" />
                    </div>
                    <input
                      type="date"
                      name="end_date"
                      required
                      value={formData.end_date}
                      onChange={handleChange}
                      className="w-full h-12 pl-11 pr-4 bg-white border border-[#d6d8d4] rounded-lg text-sm text-[#111111] focus:ring-2 focus:ring-[#00382D]/20 focus:border-[#00382D] outline-none transition-all"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-[13px] font-bold text-[#111111] mb-2">
                    Maximum Team Limit <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Users size={18} className="text-[#888888]" />
                    </div>
                    <input
                      type="number"
                      name="maximum_team_limit"
                      required
                      min="2"
                      value={formData.maximum_team_limit}
                      onChange={handleChange}
                      placeholder="e.g. 16"
                      className="w-full h-12 pl-11 pr-4 bg-white border border-[#d6d8d4] rounded-lg text-sm text-[#111111] focus:ring-2 focus:ring-[#00382D]/20 focus:border-[#00382D] outline-none transition-all placeholder:text-[#888888]"
                    />
                  </div>
                  <p className="text-xs text-[#888888] mt-2 font-medium">How many teams can participate in this tournament.</p>
                </div>

                <div>
                  <label className="block text-[13px] font-bold text-[#111111] mb-2">
                    Required Referees Count <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Users size={18} className="text-[#888888]" />
                    </div>
                    <input
                      type="number"
                      name="maximum_referee_limit"
                      required
                      min="1"
                      value={formData.maximum_referee_limit}
                      onChange={handleChange}
                      placeholder="e.g. 2"
                      className="w-full h-12 pl-11 pr-4 bg-white border border-[#d6d8d4] rounded-lg text-sm text-[#111111] focus:ring-2 focus:ring-[#00382D]/20 focus:border-[#00382D] outline-none transition-all placeholder:text-[#888888]"
                    />
                  </div>
                  <p className="text-xs text-[#888888] mt-2 font-medium">How many referees are needed for this tournament.</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Rewards & Rules */}
        {step === 3 && (
          <div className="bg-white rounded-2xl border border-[#e5e5e5] shadow-sm p-8 md:p-10 mb-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="mb-8 border-b border-[#e5e5e5] pb-6">
              <h2 className="text-2xl font-bold text-[#111111] mb-2">Rewards & Regulations</h2>
              <p className="text-[#666666] text-sm">Define what is at stake and the rules of engagement.</p>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-[13px] font-bold text-[#111111] mb-2 flex items-center gap-2">
                  <Trophy size={16} className="text-[#08733e]" /> Prize Details <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="prize_details"
                  required
                  value={formData.prize_details}
                  onChange={handleChange}
                  placeholder="e.g. 1st Place: Rs. 100,000 + Trophy&#10;2nd Place: Rs. 50,000"
                  className="w-full min-h-[100px] p-4 bg-white border border-[#d6d8d4] rounded-lg text-sm text-[#111111] focus:ring-2 focus:ring-[#00382D]/20 focus:border-[#00382D] outline-none transition-all resize-y placeholder:text-[#888888]"
                />
              </div>

              <div>
                <label className="block text-[13px] font-bold text-[#111111] mb-2 flex items-center gap-2">
                  <FileText size={16} className="text-[#08733e]" /> Tournament Rules <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="rules"
                  required
                  value={formData.rules}
                  onChange={handleChange}
                  placeholder="Specify any custom rules, eligibility criteria, or formatting..."
                  className="w-full min-h-[140px] p-4 bg-white border border-[#d6d8d4] rounded-lg text-sm text-[#111111] focus:ring-2 focus:ring-[#00382D]/20 focus:border-[#00382D] outline-none transition-all resize-y placeholder:text-[#888888]"
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 4: Review */}
        {step === 4 && (
          <div className="bg-white rounded-2xl border border-[#e5e5e5] shadow-sm p-8 md:p-10 mb-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="mb-8 border-b border-[#e5e5e5] pb-6">
              <h2 className="text-2xl font-bold text-[#111111] mb-2">Review Details</h2>
              <p className="text-[#666666] text-sm">Please verify the information before submitting.</p>
            </div>

            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-xs font-bold text-[#888888] uppercase tracking-wider mb-1">Tournament Name</h3>
                  <p className="font-semibold text-[#111111]">{formData.title || '-'}</p>
                </div>
                <div>
                  <h3 className="text-xs font-bold text-[#888888] uppercase tracking-wider mb-1">Location</h3>
                  <p className="font-semibold text-[#111111]">{formData.location || '-'}</p>
                </div>
                <div>
                  <h3 className="text-xs font-bold text-[#888888] uppercase tracking-wider mb-1">Dates</h3>
                  <p className="font-semibold text-[#111111]">{formData.start_date || '-'} to {formData.end_date || '-'}</p>
                </div>
                <div>
                  <h3 className="text-xs font-bold text-[#888888] uppercase tracking-wider mb-1">Max Teams</h3>
                  <p className="font-semibold text-[#111111]">{formData.maximum_team_limit || '-'}</p>
                </div>
              </div>

              <div>
                <h3 className="text-xs font-bold text-[#888888] uppercase tracking-wider mb-1">Description</h3>
                <p className="text-sm text-[#333333] whitespace-pre-wrap bg-gray-50 p-4 rounded-lg">{formData.description || '-'}</p>
              </div>

              <div>
                <h3 className="text-xs font-bold text-[#888888] uppercase tracking-wider mb-1">Prize Details</h3>
                <p className="text-sm text-[#333333] whitespace-pre-wrap bg-gray-50 p-4 rounded-lg">{formData.prize_details || '-'}</p>
              </div>

              <div>
                <h3 className="text-xs font-bold text-[#888888] uppercase tracking-wider mb-1">Rules</h3>
                <p className="text-sm text-[#333333] whitespace-pre-wrap bg-gray-50 p-4 rounded-lg">{formData.rules || '-'}</p>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-between">
          {step > 1 ? (
            <button
              type="button"
              onClick={handleBack}
              className="flex items-center gap-2 px-6 py-3.5 border border-[#d6d8d4] text-[#555555] font-semibold rounded-xl hover:bg-gray-50 transition-colors"
            >
              <ChevronLeft size={18} />
              Previous Step
            </button>
          ) : (
            <div></div> // Empty div for spacing
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className={`flex items-center gap-2 bg-[#05140e] text-white px-8 py-3.5 rounded-xl font-medium transition-colors shadow-md ${
              isSubmitting ? "opacity-70 cursor-not-allowed" : "hover:bg-[#003326]"
            }`}
          >
            {isSubmitting ? (
              "Processing..."
            ) : step === 4 ? (
              <>Confirm & Submit <CheckCircle size={18} /></>
            ) : (
              <>Next Step <ArrowRight size={18} /></>
            )}
          </button>
        </div>
      </form>

      {/* Pro Organizer Tip */}
      <div className="mt-12 bg-[#c6f6d5] border border-[#9ae6b4] rounded-xl p-5 flex items-start gap-4">
        <div className="text-[#08733e] shrink-0 mt-0.5">
          <Info size={24} />
        </div>
        <div>
          <h4 className="font-bold text-[#08733e] text-[13px] mb-1 uppercase tracking-wider">Pro Organizer Tip</h4>
          <p className="text-sm text-[#004a25] leading-relaxed">
            Once submitted, our administration team will review the tournament details within 24 hours. 
            Ensure your rules comply with the Official Elle Federation standards to avoid delays.
          </p>
        </div>
      </div>

    </div>
  );
}

export default CreateTournament;
