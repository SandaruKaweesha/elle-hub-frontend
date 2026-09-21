import { useState } from "react";
import { Link } from "react-router-dom";
import { 
  Mail, 
  Phone, 
  MapPin, 
  Send, 
  MessageSquare, 
  HelpCircle, 
  CheckCircle2, 
  ShieldCheck, 
  Clock, 
  Sparkles,
  Headphones
} from "lucide-react";
import Navbar from "../components/common/Navbar";
import Footer from "../components/common/Footer";

function Contact() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "Forgot Password / Account Access",
    phone: "",
    message: ""
  });

  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const teamMembers = [
    {
      name: "Sanjana Peiris",
      role: "Lead Support & Public Relations Manager",
      gender: "female",
      phone: "+94 77 892 4510",
      email: "sanjana.peiris@ellehub.lk",
      badge: "Public Relations & User Support",
      avatarBg: "bg-emerald-100 text-emerald-800 border-emerald-300"
    },
    {
      name: "Sandaru Kaweesha",
      role: "System Administrator & Lead Developer",
      gender: "male",
      phone: "+94 71 452 9831",
      email: "sandaru.kaweesha@ellehub.lk",
      badge: "System & Core Dev Support",
      avatarBg: "bg-amber-100 text-amber-800 border-amber-300"
    },
    {
      name: "Isuru Rajitha",
      role: "Technical Lead & Tournament Operations",
      gender: "male",
      phone: "+94 76 312 8745",
      email: "isuru.rajitha@ellehub.lk",
      badge: "Tournament & Match Fixtures",
      avatarBg: "bg-blue-100 text-blue-800 border-blue-300"
    },
    {
      name: "Nishindu De Silva",
      role: "Event Coordinator & Media Relations",
      gender: "male",
      phone: "+94 70 654 3219",
      email: "nishindu.desilva@ellehub.lk",
      badge: "Sponsors & Playgrounds",
      avatarBg: "bg-purple-100 text-purple-800 border-purple-300"
    }
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
    }, 1000);
  };

  return (
    <div className="min-h-screen flex flex-col font-['Poppins'] bg-[#f8f7f4] text-[#111111]">
      <Navbar />

      {/* Hero Header */}
      <section className="bg-[#003326] text-white py-14 px-4 md:px-[60px] relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 opacity-10 pointer-events-none">
          <Headphones size={320} />
        </div>
        <div className="max-w-[1400px] mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 bg-[#004d39] text-[#ffd65a] px-4 py-1.5 rounded-full text-xs font-semibold tracking-wider uppercase mb-4 border border-[#00664c]">
            <Sparkles size={14} /> Official Support Portal
          </div>
          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-4">
            Contact The Elle Hub Team
          </h1>
          <p className="text-[#a5c4b9] max-w-[700px] mx-auto text-sm md:text-base leading-relaxed">
            Need help recovering your account, requesting password resets, or managing tournaments? 
            Our dedicated team members are available to assist you.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <main className="flex-1 max-w-[1400px] w-full mx-auto px-4 md:px-[60px] py-12 space-y-12">

        {/* Team Contact Cards */}
        <section>
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-[#002c21]">
                Our Support Officers
              </h2>
              <p className="text-sm text-[#626965] mt-1">
                Direct contacts for administrative, technical, and tournament inquiries.
              </p>
            </div>
            <span className="hidden sm:inline-flex items-center gap-1.5 text-xs font-semibold bg-[#e8efe9] text-[#003326] px-3 py-1.5 rounded-md">
              <Clock size={14} /> 24/7 Hotline Support
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {teamMembers.map((member, idx) => (
              <div 
                key={idx}
                className="bg-white rounded-xl border border-[#d8ddd9] p-6 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div className="w-12 h-12 rounded-full bg-[#003326] text-white flex items-center justify-center font-bold text-lg shadow-sm">
                      {member.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full border ${member.avatarBg}`}>
                      {member.badge}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-[#111513]">{member.name}</h3>
                  <p className="text-xs font-medium text-[#00783f] mb-4">{member.role}</p>

                  <div className="space-y-2.5 text-xs text-[#555555] border-t border-[#f0f0f0] pt-4">
                    <a 
                      href={`tel:${member.phone.replace(/\s+/g, '')}`} 
                      className="flex items-center gap-2.5 hover:text-[#003326] transition-colors font-medium text-[#222222]"
                    >
                      <div className="w-7 h-7 rounded-md bg-[#f0f5f2] flex items-center justify-center text-[#003326]">
                        <Phone size={14} />
                      </div>
                      <span>{member.phone}</span>
                    </a>
                    
                    <a 
                      href={`mailto:${member.email}`} 
                      className="flex items-center gap-2.5 hover:text-[#003326] transition-colors"
                    >
                      <div className="w-7 h-7 rounded-md bg-[#f0f5f2] flex items-center justify-center text-[#003326]">
                        <Mail size={14} />
                      </div>
                      <span className="truncate">{member.email}</span>
                    </a>
                  </div>
                </div>

                <div className="mt-6 pt-3 border-t border-[#f5f5f5] flex items-center justify-between text-[11px] text-[#777777]">
                  <span className="flex items-center gap-1 text-emerald-600 font-medium">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    Direct Line Active
                  </span>
                  <span>Sri Lanka (+94)</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Contact Form & Office Info */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

          {/* Form */}
          <div className="lg:col-span-7 bg-white rounded-xl border border-[#d8ddd9] p-8 shadow-sm">
            <div className="mb-6">
              <h3 className="text-xl font-bold text-[#111111] flex items-center gap-2">
                <MessageSquare className="text-[#003326]" size={22} />
                Send Us a Direct Message
              </h3>
              <p className="text-xs text-[#666666] mt-1">
                Fill out the form below to request account recovery, password resets, or general support.
              </p>
            </div>

            {submitted ? (
              <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-6 text-center space-y-3 my-6">
                <CheckCircle2 className="mx-auto text-emerald-600" size={48} />
                <h4 className="text-lg font-bold text-emerald-900">Message Delivered Successfully!</h4>
                <p className="text-xs text-emerald-700 max-w-[400px] mx-auto">
                  Thank you! Our support team has received your inquiry regarding <span className="font-semibold">{formData.subject}</span>. An officer will respond shortly.
                </p>
                <button
                  onClick={() => { setSubmitted(false); setFormData({ name: "", email: "", subject: "Forgot Password / Account Access", phone: "", message: "" }); }}
                  className="mt-4 px-5 py-2 bg-[#003326] text-white rounded-md text-xs font-semibold hover:bg-[#004d39] transition-colors"
                >
                  Send Another Message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#333333] mb-1.5">
                      Your Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g. Kasun Fernando"
                      className="w-full px-3.5 py-2.5 border border-[#d0d0d0] rounded-md text-xs focus:ring-1 focus:ring-[#003326] focus:border-[#003326] outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#333333] mb-1.5">
                      Your Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="e.g. player@ellehub.lk"
                      className="w-full px-3.5 py-2.5 border border-[#d0d0d0] rounded-md text-xs focus:ring-1 focus:ring-[#003326] focus:border-[#003326] outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#333333] mb-1.5">
                      Contact Phone (Optional)
                    </label>
                    <input
                      type="text"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="+94 77 123 4567"
                      className="w-full px-3.5 py-2.5 border border-[#d0d0d0] rounded-md text-xs focus:ring-1 focus:ring-[#003326] focus:border-[#003326] outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#333333] mb-1.5">
                      Inquiry Subject *
                    </label>
                    <select
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      className="w-full px-3.5 py-2.5 border border-[#d0d0d0] rounded-md text-xs focus:ring-1 focus:ring-[#003326] focus:border-[#003326] outline-none bg-white"
                    >
                      <option value="Forgot Password / Account Access">Forgot Password / Password Reset</option>
                      <option value="Tournament Registration Help">Tournament Registration Inquiry</option>
                      <option value="Technical Bug / Issue">Technical Issue / Bug Report</option>
                      <option value="Sponsorship & Venue Inquiry">Sponsorship or Venue Inquiry</option>
                      <option value="General Support">General Support</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#333333] mb-1.5">
                    Your Message *
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="Provide details about your inquiry or password reset request..."
                    className="w-full px-3.5 py-2.5 border border-[#d0d0d0] rounded-md text-xs focus:ring-1 focus:ring-[#003326] focus:border-[#003326] outline-none resize-none"
                  ></textarea>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full sm:w-auto px-8 py-3 bg-[#C99C4E] hover:bg-[#b88c42] text-white font-bold text-xs rounded-md transition-colors flex items-center justify-center gap-2 shadow-sm disabled:opacity-70"
                >
                  <Send size={15} />
                  {loading ? "Sending..." : "Submit Message"}
                </button>
              </form>
            )}
          </div>

          {/* Office Details Card */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-[#003326] text-white rounded-xl p-8 shadow-sm space-y-6">
              <h3 className="text-xl font-bold flex items-center gap-2 text-[#ffd65a]">
                <ShieldCheck size={22} />
                Headquarters Secretariat
              </h3>

              <p className="text-xs text-[#a5c4b9] leading-relaxed">
                The Elle Hub is Sri Lanka’s premier digital administration system for Elle sports championships and tournament organization.
              </p>

              <div className="space-y-4 text-xs text-[#e0ece7]">
                <div className="flex items-start gap-3">
                  <MapPin className="text-[#ffd65a] shrink-0 mt-0.5" size={18} />
                  <div>
                    <span className="font-semibold text-white block">Official Address:</span>
                    Independence Avenue, Sports Complex Building, Colombo 07, Sri Lanka.
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Phone className="text-[#ffd65a] shrink-0 mt-0.5" size={18} />
                  <div>
                    <span className="font-semibold text-white block">General Hotline:</span>
                    +94 11 268 9000 / +94 77 100 2000
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Mail className="text-[#ffd65a] shrink-0 mt-0.5" size={18} />
                  <div>
                    <span className="font-semibold text-white block">Official Email:</span>
                    support@ellehub.lk / info@ellehub.lk
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-[#004d39] flex items-center justify-between text-[11px] text-[#90b8ab]">
                <span>Working Hours: Mon - Sat (8:30 AM - 5:30 PM)</span>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-[#d8ddd9] p-6 shadow-sm text-xs space-y-3">
              <h4 className="font-bold text-[#111111] flex items-center gap-2">
                <HelpCircle className="text-[#00783f]" size={16} />
                Forgot Password Help?
              </h4>
              <p className="text-[#666666] leading-relaxed">
                If you cannot access your account, please submit your registered email address via the form above or call officer <span className="font-semibold text-[#111111]">Sanjana Peiris (+94 77 892 4510)</span> or <span className="font-semibold text-[#111111]">Sandaru Kaweesha (+94 71 452 9831)</span> for immediate verification.
              </p>
              <div className="pt-2">
                <Link to="/login" className="text-[#00783f] font-bold hover:underline">
                  &larr; Return to Login Page
                </Link>
              </div>
            </div>
          </div>

        </section>

      </main>

      <Footer />
    </div>
  );
}

export default Contact;
