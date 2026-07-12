import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { User, Shield, Bell, Save, CheckCircle } from "lucide-react";

function OrganizerSettings() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTab = searchParams.get("tab") || "profile";
  const [activeTab, setActiveTab] = useState(initialTab);
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab) {
      setActiveTab(tab);
    }
  }, [searchParams]);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setSearchParams({ tab });
  };

  const handleSave = (e) => {
    e.preventDefault();
    setIsSaving(true);
    // Simulate API call
    setTimeout(() => {
      setIsSaving(false);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    }, 1000);
  };

  return (
    <div className="max-w-5xl mx-auto font-['Poppins']">
      
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-[28px] font-bold text-[#111111] tracking-tight">Account Settings</h1>
          <p className="text-[#666666] text-sm mt-1">Manage your organizer profile, security, and preferences.</p>
        </div>
        {showSuccess && (
          <div className="flex items-center gap-2 bg-green-50 text-green-700 px-4 py-2 rounded-lg text-sm font-medium animate-in fade-in slide-in-from-top-2 border border-green-200">
            <CheckCircle size={16} /> Changes saved successfully!
          </div>
        )}
      </div>

      {/* Horizontal Tabs */}
      <div className="bg-white rounded-2xl border border-[#e5e5e5] shadow-sm mb-6 flex overflow-x-auto no-scrollbar">
        <button
          onClick={() => handleTabChange('profile')}
          className={`flex-1 min-w-[200px] flex items-center justify-center gap-2 px-6 py-4 text-sm font-semibold transition-colors border-b-2 ${
            activeTab === 'profile' 
              ? 'border-[#00382D] text-[#00382D] bg-[#00382D]/5' 
              : 'border-transparent text-[#666666] hover:text-[#111111] hover:bg-gray-50'
          }`}
        >
          <User size={18} strokeWidth={activeTab === 'profile' ? 2 : 1.5} /> Profile Details
        </button>
        <div className="w-[1px] bg-[#e5e5e5] shrink-0"></div>
        <button
          onClick={() => handleTabChange('security')}
          className={`flex-1 min-w-[200px] flex items-center justify-center gap-2 px-6 py-4 text-sm font-semibold transition-colors border-b-2 ${
            activeTab === 'security' 
              ? 'border-[#00382D] text-[#00382D] bg-[#00382D]/5' 
              : 'border-transparent text-[#666666] hover:text-[#111111] hover:bg-gray-50'
          }`}
        >
          <Shield size={18} strokeWidth={activeTab === 'security' ? 2 : 1.5} /> Security & Password
        </button>
        <div className="w-[1px] bg-[#e5e5e5] shrink-0"></div>
        <button
          onClick={() => handleTabChange('notifications')}
          className={`flex-1 min-w-[200px] flex items-center justify-center gap-2 px-6 py-4 text-sm font-semibold transition-colors border-b-2 ${
            activeTab === 'notifications' 
              ? 'border-[#00382D] text-[#00382D] bg-[#00382D]/5' 
              : 'border-transparent text-[#666666] hover:text-[#111111] hover:bg-gray-50'
          }`}
        >
          <Bell size={18} strokeWidth={activeTab === 'notifications' ? 2 : 1.5} /> Notification Preferences
        </button>
      </div>

      {/* Settings Content */}
      <div className="bg-white rounded-2xl border border-[#e5e5e5] shadow-sm p-6 md:p-8">
          
          {activeTab === 'profile' && (
            <div className="animate-in fade-in duration-300">
              <h2 className="text-xl font-bold text-[#111111] mb-6">Profile Details</h2>
              <form onSubmit={handleSave} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-[13px] font-bold text-[#333333] mb-2">First Name</label>
                    <input type="text" defaultValue="John" className="w-full h-11 px-4 bg-white border border-[#d6d8d4] rounded-lg text-sm text-[#111111] focus:ring-2 focus:ring-[#00382D]/20 focus:border-[#00382D] outline-none transition-all" />
                  </div>
                  <div>
                    <label className="block text-[13px] font-bold text-[#333333] mb-2">Last Name</label>
                    <input type="text" defaultValue="Doe" className="w-full h-11 px-4 bg-white border border-[#d6d8d4] rounded-lg text-sm text-[#111111] focus:ring-2 focus:ring-[#00382D]/20 focus:border-[#00382D] outline-none transition-all" />
                  </div>
                </div>
                <div>
                  <label className="block text-[13px] font-bold text-[#333333] mb-2">Email Address</label>
                  <input type="email" defaultValue="organizer@example.com" disabled className="w-full h-11 px-4 bg-gray-50 border border-[#d6d8d4] rounded-lg text-sm text-[#888888] cursor-not-allowed" />
                  <p className="text-xs text-[#888888] mt-1.5 font-medium">Email address cannot be changed. Contact support if needed.</p>
                </div>
                <div>
                  <label className="block text-[13px] font-bold text-[#333333] mb-2">Organization Name</label>
                  <input type="text" defaultValue="National Sports Council" className="w-full h-11 px-4 bg-white border border-[#d6d8d4] rounded-lg text-sm text-[#111111] focus:ring-2 focus:ring-[#00382D]/20 focus:border-[#00382D] outline-none transition-all" />
                </div>
                <div>
                  <label className="block text-[13px] font-bold text-[#333333] mb-2">Phone Number</label>
                  <input type="tel" defaultValue="+94 77 123 4567" className="w-full h-11 px-4 bg-white border border-[#d6d8d4] rounded-lg text-sm text-[#111111] focus:ring-2 focus:ring-[#00382D]/20 focus:border-[#00382D] outline-none transition-all" />
                </div>
                <div className="pt-4 border-t border-[#e5e5e5] flex justify-end">
                  <button type="submit" disabled={isSaving} className="flex items-center gap-2 bg-[#00382D] text-white px-6 py-2.5 rounded-lg font-semibold hover:bg-[#002a22] transition-colors disabled:opacity-70">
                    {isSaving ? "Saving..." : <><Save size={18} /> Save Changes</>}
                  </button>
                </div>
              </form>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="animate-in fade-in duration-300">
              <h2 className="text-xl font-bold text-[#111111] mb-6">Security & Password</h2>
              <form onSubmit={handleSave} className="space-y-6">
                <div>
                  <label className="block text-[13px] font-bold text-[#333333] mb-2">Current Password</label>
                  <input type="password" required className="w-full h-11 px-4 bg-white border border-[#d6d8d4] rounded-lg text-sm text-[#111111] focus:ring-2 focus:ring-[#00382D]/20 focus:border-[#00382D] outline-none transition-all" />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-[13px] font-bold text-[#333333] mb-2">New Password</label>
                    <input type="password" required className="w-full h-11 px-4 bg-white border border-[#d6d8d4] rounded-lg text-sm text-[#111111] focus:ring-2 focus:ring-[#00382D]/20 focus:border-[#00382D] outline-none transition-all" />
                  </div>
                  <div>
                    <label className="block text-[13px] font-bold text-[#333333] mb-2">Confirm New Password</label>
                    <input type="password" required className="w-full h-11 px-4 bg-white border border-[#d6d8d4] rounded-lg text-sm text-[#111111] focus:ring-2 focus:ring-[#00382D]/20 focus:border-[#00382D] outline-none transition-all" />
                  </div>
                </div>
                <div className="pt-4 border-t border-[#e5e5e5] flex justify-end">
                  <button type="submit" disabled={isSaving} className="flex items-center gap-2 bg-[#00382D] text-white px-6 py-2.5 rounded-lg font-semibold hover:bg-[#002a22] transition-colors disabled:opacity-70">
                    {isSaving ? "Updating..." : <><Shield size={18} /> Update Password</>}
                  </button>
                </div>
              </form>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="animate-in fade-in duration-300">
              <h2 className="text-xl font-bold text-[#111111] mb-6">Notification Preferences</h2>
              <form onSubmit={handleSave} className="space-y-6">
                
                <div className="space-y-4">
                  <h3 className="text-[13px] font-bold text-[#888888] uppercase tracking-wider">Email Notifications</h3>
                  
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-[#e5e5e5]">
                    <div>
                      <p className="text-sm font-semibold text-[#111111]">Tournament Updates</p>
                      <p className="text-xs text-[#666666] mt-0.5">Receive emails when your tournament status changes.</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" defaultChecked className="sr-only peer" />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#00382D]"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-[#e5e5e5]">
                    <div>
                      <p className="text-sm font-semibold text-[#111111]">New Registrations</p>
                      <p className="text-xs text-[#666666] mt-0.5">Receive emails when a new team registers for your event.</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" defaultChecked className="sr-only peer" />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#00382D]"></div>
                    </label>
                  </div>
                </div>

                <div className="space-y-4 pt-4">
                  <h3 className="text-[13px] font-bold text-[#888888] uppercase tracking-wider">System Alerts</h3>
                  
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-[#e5e5e5]">
                    <div>
                      <p className="text-sm font-semibold text-[#111111]">Security Alerts</p>
                      <p className="text-xs text-[#666666] mt-0.5">Critical notifications about your account security.</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-not-allowed">
                      <input type="checkbox" checked disabled className="sr-only peer" />
                      <div className="w-11 h-6 bg-[#00382D] opacity-60 rounded-full peer after:content-[''] after:absolute after:top-[2px] after:left-[22px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5"></div>
                    </label>
                  </div>
                </div>

                <div className="pt-6 border-t border-[#e5e5e5] flex justify-end">
                  <button type="submit" disabled={isSaving} className="flex items-center gap-2 bg-[#00382D] text-white px-6 py-2.5 rounded-lg font-semibold hover:bg-[#002a22] transition-colors disabled:opacity-70">
                    {isSaving ? "Saving..." : <><Save size={18} /> Save Preferences</>}
                  </button>
                </div>
              </form>
            </div>
          )}

      </div>
    </div>
  );
}

export default OrganizerSettings;
