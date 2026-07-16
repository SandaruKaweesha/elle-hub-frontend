import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Trophy, Mail, Phone, Users, ShieldCheck, ArrowLeft, CheckCircle2 } from 'lucide-react';

function JoinTournamentRequest() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [formData, setFormData] = useState({
    teamName: '',
    contactNumber: '',
    email: '',
    message: ''
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setShowConfirm(true);
  };

  const confirmSubmit = () => {
    setShowConfirm(false);
    // Here it would typically send API request to backend
    // api.post('/tournament/request', { ...formData, tournamentId: id })
    console.log("Submitting join request", formData);
    setIsSubmitted(true);
    
    // Redirect back to dashboard after 3 seconds
    setTimeout(() => {
      navigate('/team');
    }, 3000);
  };

  // Mock tournament data based on ID
  const tournamentName = id === '1' ? 'Elite Cup 2024' : id === '2' ? 'Summer Nationals' : 'Colombo City Clash';

  if (isSubmitted) {
    return (
      <div className="max-w-2xl mx-auto mt-10">
        <div className="bg-white rounded-2xl p-10 shadow-sm border border-[#e5e5e5] text-center flex flex-col items-center">
          <div className="w-20 h-20 bg-[#eaf1ec] rounded-full flex items-center justify-center mb-6">
            <CheckCircle2 size={40} className="text-[#08733e]" />
          </div>
          <h2 className="text-3xl font-black text-[#111111] mb-4">Request Sent Successfully!</h2>
          <p className="text-[#666666] mb-8">
            Your request to join <span className="font-bold text-[#111111]">{tournamentName}</span> has been submitted to the tournament organizers. You will be notified once they review it.
          </p>
          <div className="w-full bg-[#f8f7f4] rounded-lg h-1.5 overflow-hidden">
            <div className="bg-[#08733e] h-full w-full animate-[shrink_3s_linear_forwards]"></div>
          </div>
          <p className="text-xs text-[#888888] mt-4 uppercase font-bold tracking-wider">Returning to Dashboard...</p>
          
          <style>{`
            @keyframes shrink {
              from { width: 100%; }
              to { width: 0%; }
            }
          `}</style>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto pb-10">
      
      {/* Confirmation Modal */}
      {showConfirm && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-lg">
            <h3 className="text-xl font-bold text-[#111111] mb-3">Confirm Request</h3>
            <p className="text-[#666666] mb-8 text-sm leading-relaxed">
              Are you sure you want to send this join request to the organizer of <span className="font-bold text-[#111111]">{tournamentName}</span>?
            </p>
            <div className="flex gap-4">
              <button 
                onClick={() => setShowConfirm(false)}
                className="flex-1 px-4 py-3 border border-[#e5e5e5] text-[#111111] font-semibold rounded-xl hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={confirmSubmit}
                className="flex-1 px-4 py-3 bg-[#08733e] text-white font-semibold rounded-xl hover:bg-[#065b31] transition-colors shadow-sm"
              >
                Confirm & Send
              </button>
            </div>
          </div>
        </div>
      )}

      <button 
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-[#666666] hover:text-[#111111] font-semibold text-sm mb-6 transition-colors"
      >
        <ArrowLeft size={16} /> Back
      </button>

      <div className="bg-white rounded-2xl shadow-sm border border-[#e5e5e5] overflow-hidden flex flex-col md:flex-row">
        
        {/* Left Side: Info & Guidelines */}
        <div className="w-full md:w-[40%] bg-[#002c21] p-8 md:p-10 text-white flex flex-col relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
            <Trophy size={160} />
          </div>
          
          <div className="relative z-10">
            <span className="inline-block bg-[#98F5E1] text-[#002c21] text-[10px] font-black px-3 py-1.5 rounded-full uppercase tracking-wider mb-6">
              Official Request
            </span>
            <h2 className="text-3xl font-black mb-2">Join {tournamentName}</h2>
            <p className="text-[#8eb7a7] text-sm leading-relaxed mb-10">
              Submit your team's official application to participate in this tournament. Organizers will review your request and get back to you shortly.
            </p>
            
            <div className="space-y-6 mt-auto">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center shrink-0">
                  <ShieldCheck size={20} className="text-[#98F5E1]" />
                </div>
                <div>
                  <h4 className="font-bold text-sm">Eligibility Checked</h4>
                  <p className="text-xs text-[#8eb7a7] mt-1">Ensure your team meets all the tournament criteria before applying.</p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center shrink-0">
                  <Users size={20} className="text-[#98F5E1]" />
                </div>
                <div>
                  <h4 className="font-bold text-sm">Team Roster</h4>
                  <p className="text-xs text-[#8eb7a7] mt-1">Your registered active roster will be submitted with this request.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Form */}
        <div className="w-full md:w-[60%] p-8 md:p-10 bg-white">
          <h3 className="text-xl font-bold text-[#111111] mb-6 tracking-tight">Application Form</h3>
          
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-[#333333] mb-2 uppercase tracking-wide">
                Team Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                  <Users size={18} />
                </div>
                <input 
                  type="text" 
                  name="teamName"
                  value={formData.teamName}
                  onChange={handleChange}
                  required
                  placeholder="Enter your team name"
                  className="w-full pl-10 pr-4 py-3 bg-[#f8f7f4] border border-[#e5e5e5] rounded-xl text-sm focus:outline-none focus:border-[#08733e] focus:ring-1 focus:ring-[#08733e] transition-all font-medium"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-bold text-[#333333] mb-2 uppercase tracking-wide">
                  Contact Number
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                    <Phone size={18} />
                  </div>
                  <input 
                    type="tel" 
                    name="contactNumber"
                    value={formData.contactNumber}
                    onChange={handleChange}
                    required
                    placeholder="+94 7X XXX XXXX"
                    className="w-full pl-10 pr-4 py-3 bg-[#f8f7f4] border border-[#e5e5e5] rounded-xl text-sm focus:outline-none focus:border-[#08733e] focus:ring-1 focus:ring-[#08733e] transition-all font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#333333] mb-2 uppercase tracking-wide">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                    <Mail size={18} />
                  </div>
                  <input 
                    type="email" 
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    placeholder="example@gmail.com"
                    className="w-full pl-10 pr-4 py-3 bg-[#f8f7f4] border border-[#e5e5e5] rounded-xl text-sm focus:outline-none focus:border-[#08733e] focus:ring-1 focus:ring-[#08733e] transition-all font-medium"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#333333] mb-2 uppercase tracking-wide">
                Message to Organizer (Optional)
              </label>
              <textarea 
                name="message"
                value={formData.message}
                onChange={handleChange}
                placeholder="Any special notes or requests regarding your participation..."
                rows="4"
                className="w-full p-4 bg-[#f8f7f4] border border-[#e5e5e5] rounded-xl text-sm focus:outline-none focus:border-[#08733e] focus:ring-1 focus:ring-[#08733e] transition-all font-medium resize-none"
              ></textarea>
            </div>
            
            <div className="pt-4 flex gap-4">
              <button 
                type="button"
                onClick={() => navigate(-1)}
                className="flex-1 px-4 py-3.5 border border-[#e5e5e5] text-gray-700 hover:bg-gray-50 font-bold rounded-xl text-[15px] transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button 
                type="submit"
                className="flex-1 bg-[#08733e] text-white py-3.5 rounded-xl text-[15px] font-bold hover:bg-[#065b31] transition-colors shadow-sm flex justify-center items-center gap-2 cursor-pointer"
              >
                Submit Join Request
              </button>
            </div>
          </form>
        </div>
      </div>

    </div>
  );
}

export default JoinTournamentRequest;
