import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { User, Shield, Bell, Save, CheckCircle } from "lucide-react";

function TeamSettings() {
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
      <div className="mb-8 flex items-start sm:items-center justify-between flex-col sm:flex-row gap-4">
        <div>
          <h1 className="text-[28px] font-bold text-[#111111] tracking-tight">Account Settings</h1>
          <p className="text-[#666666] text-sm mt-1">Manage your team profile, security, and preferences.</p>
        </div>
        {showSuccess && (
          <div className="flex items-center gap-2 bg-[#eaf1ec] text-[#08733e] px-4 py-2 rounded-lg text-sm font-bold animate-in fade-in slide-in-from-top-2 border border-[#08733e]/20">
            <CheckCircle size={16} /> Changes saved successfully!
          </div>
        )}
      </div>

      {/* Horizontal Tabs */}
      <div className="bg-white rounded-2xl border border-[#e5e5e5] shadow-sm mb-6 flex overflow-x-auto hide-scrollbar">
        <button
          onClick={() => handleTabChange('profile')}
          className={`flex-1 min-w-[200px] flex items-center justify-center gap-2 px-6 py-4 text-sm font-semibold transition-colors border-b-2 ${
            activeTab === 'profile' 
              ? 'border-[#002c21] text-[#002c21] bg-[#002c21]/5' 
              : 'border-transparent text-[#666666] hover:text-[#111111] hover:bg-gray-50'
          }`}
        >
          <User size={18} strokeWidth={activeTab === 'profile' ? 2.5 : 1.5} /> Profile Details
        </button>
        <div className="w-[1px] bg-[#e5e5e5] shrink-0"></div>
        <button
          onClick={() => handleTabChange('security')}
          className={`flex-1 min-w-[200px] flex items-center justify-center gap-2 px-6 py-4 text-sm font-semibold transition-colors border-b-2 ${
            activeTab === 'security' 
              ? 'border-[#002c21] text-[#002c21] bg-[#002c21]/5' 
              : 'border-transparent text-[#666666] hover:text-[#111111] hover:bg-gray-50'
          }`}
        >
          <Shield size={18} strokeWidth={activeTab === 'security' ? 2.5 : 1.5} /> Security & Password
        </button>
        <div className="w-[1px] bg-[#e5e5e5] shrink-0"></div>
        <button
          onClick={() => handleTabChange('notifications')}
          className={`flex-1 min-w-[200px] flex items-center justify-center gap-2 px-6 py-4 text-sm font-semibold transition-colors border-b-2 ${
            activeTab === 'notifications' 
              ? 'border-[#002c21] text-[#002c21] bg-[#002c21]/5' 
              : 'border-transparent text-[#666666] hover:text-[#111111] hover:bg-gray-50'
          }`}
        >
          <Bell size={18} strokeWidth={activeTab === 'notifications' ? 2.5 : 1.5} /> Notification Preferences
        </button>
      </div>

      {/* Settings Content */}
      <div className="bg-white rounded-2xl border border-[#e5e5e5] shadow-sm p-6 md:p-8">
          
          {activeTab === 'profile' && (
            <div className="animate-in fade-in duration-300">
              <h2 className="text-xl font-bold text-[#111111] mb-6">Profile Details</h2>
              <form onSubmit={handleSave} className="space-y-6">
                <div className="grid grid-cols-1 gap-6">
                  <div>
                    <label className="block text-[13px] font-bold text-[#333333] mb-2 uppercase tracking-wide">Team Name</label>
                    <input type="text" defaultValue="Elite Strikers FC" className="w-full h-11 px-4 bg-[#f8f7f4] border border-[#e5e5e5] rounded-xl text-sm font-medium focus:ring-1 focus:ring-[#08733e] focus:border-[#08733e] outline-none transition-all" />
                  </div>
                  <div>
                    <label className="block text-[13px] font-bold text-[#333333] mb-2 uppercase tracking-wide">Email Address</label>
                    <input type="email" defaultValue="team@elitestrikers.com" className="w-full h-11 px-4 bg-[#f8f7f4] border border-[#e5e5e5] rounded-xl text-sm font-medium focus:ring-1 focus:ring-[#08733e] focus:border-[#08733e] outline-none transition-all" />
                  </div>
                </div>
                <div>
                  <label className="block text-[13px] font-bold text-[#333333] mb-2 uppercase tracking-wide">Team Description</label>
                  <textarea rows="4" defaultValue="We are a competitive team aiming for the championships." className="w-full p-4 bg-[#f8f7f4] border border-[#e5e5e5] rounded-xl text-sm font-medium focus:ring-1 focus:ring-[#08733e] focus:border-[#08733e] outline-none transition-all resize-none"></textarea>
                </div>
                <div className="pt-4 border-t border-[#e5e5e5] flex justify-end">
                  <button type="submit" disabled={isSaving} className="flex items-center gap-2 bg-[#08733e] text-white px-6 py-2.5 rounded-lg text-sm font-semibold hover:bg-[#065b31] transition-colors shadow-sm disabled:opacity-70">
                    {isSaving ? "Saving..." : <><Save size={16} /> Save Changes</>}
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
                  <label className="block text-[13px] font-bold text-[#333333] mb-2 uppercase tracking-wide">Current Password</label>
                  <input type="password" placeholder="••••••••" className="w-full h-11 px-4 bg-[#f8f7f4] border border-[#e5e5e5] rounded-xl text-sm font-medium focus:ring-1 focus:ring-[#08733e] focus:border-[#08733e] outline-none transition-all" />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-[13px] font-bold text-[#333333] mb-2 uppercase tracking-wide">New Password</label>
                    <input type="password" placeholder="••••••••" className="w-full h-11 px-4 bg-[#f8f7f4] border border-[#e5e5e5] rounded-xl text-sm font-medium focus:ring-1 focus:ring-[#08733e] focus:border-[#08733e] outline-none transition-all" />
                  </div>
                  <div>
                    <label className="block text-[13px] font-bold text-[#333333] mb-2 uppercase tracking-wide">Confirm New Password</label>
                    <input type="password" placeholder="••••••••" className="w-full h-11 px-4 bg-[#f8f7f4] border border-[#e5e5e5] rounded-xl text-sm font-medium focus:ring-1 focus:ring-[#08733e] focus:border-[#08733e] outline-none transition-all" />
                  </div>
                </div>
                <div className="pt-4 border-t border-[#e5e5e5] flex justify-end">
                  <button type="submit" disabled={isSaving} className="flex items-center gap-2 bg-[#08733e] text-white px-6 py-2.5 rounded-lg text-sm font-semibold hover:bg-[#065b31] transition-colors shadow-sm disabled:opacity-70">
                    {isSaving ? "Updating..." : <><Save size={16} /> Update Password</>}
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
                  <div className="flex items-center justify-between p-4 border border-[#e5e5e5] rounded-xl bg-[#f8f7f4]">
                    <div>
                      <h4 className="font-bold text-[#111111] text-sm">Tournament Updates</h4>
                      <p className="text-xs text-[#666666] mt-1">Receive notifications when your tournament applications are approved or updated.</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" defaultChecked />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#08733e]"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between p-4 border border-[#e5e5e5] rounded-xl bg-[#f8f7f4]">
                    <div>
                      <h4 className="font-bold text-[#111111] text-sm">Match Reminders</h4>
                      <p className="text-xs text-[#666666] mt-1">Get alerts 24 hours before your scheduled matches.</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" defaultChecked />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#08733e]"></div>
                    </label>
                  </div>
                </div>

                <div className="pt-4 border-t border-[#e5e5e5] flex justify-end">
                  <button type="submit" disabled={isSaving} className="flex items-center gap-2 bg-[#08733e] text-white px-6 py-2.5 rounded-lg text-sm font-semibold hover:bg-[#065b31] transition-colors shadow-sm disabled:opacity-70">
                    {isSaving ? "Saving..." : <><Save size={16} /> Save Preferences</>}
                  </button>
                </div>
              </form>
            </div>
          )}

      </div>
    </div>
  );
}

export default TeamSettings;
