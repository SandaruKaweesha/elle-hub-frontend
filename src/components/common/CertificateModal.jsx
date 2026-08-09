import React, { useState } from 'react';
import { X, Award, Download, Building2, MapPin, Calendar, ShieldCheck, Trophy, Loader2 } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import html2canvas from 'html2canvas';

export default function CertificateModal({ certificate, onClose }) {
  const [downloading, setDownloading] = useState(false);

  if (!certificate) return null;

  const token = certificate.verification_token || certificate.qr_code || 'CERT-ELE-2026';
  const issueDate = certificate.issue_date || new Date().toISOString().split('T')[0];
  const recipient = certificate.recipient_name || 'Participating Team';
  const certType = certificate.certificate_type || 'PARTICIPATION';
  const tournamentTitle = certificate.tournament_title || 'ELLE HUB TOURNAMENT';

  // Rich formatted text payload so ANY phone camera displays details directly on screen when scanned
  const qrTextPayload = `🏆 OFFICIAL ELLE HUB E-CERTIFICATE
================================
Recipient: ${recipient}
Award: ${certType} AWARD
Tournament: ${tournamentTitle}
Issued Date: ${issueDate}
Verification Token: ${token}
================================
Status: 100% Genuine & Verified by Elle Hub`;

  const handleDownload = async () => {
    const certElement = document.getElementById('certificate-card-container');
    if (!certElement) return;
    try {
      setDownloading(true);
      const canvas = await html2canvas(certElement, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#FFFFFF',
        logging: false
      });
      const dataUrl = canvas.toDataURL('image/png');
      const downloadLink = document.createElement('a');
      downloadLink.download = `ElleHub_Certificate_${recipient.replace(/\s+/g, '_')}.png`;
      downloadLink.href = dataUrl;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
    } catch (err) {
      console.error("Error downloading certificate:", err);
      window.print();
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-3xl w-full border border-gray-200 shadow-2xl overflow-hidden my-auto space-y-4 p-6 md:p-8 relative">
        
        {/* Top Action Bar */}
        <div className="flex items-center justify-between border-b border-gray-100 pb-4 print:hidden">
          <div className="flex items-center gap-2 text-[#08733e] font-extrabold text-sm">
            <ShieldCheck size={18} /> Official Elle Hub E-Certificate
          </div>
          
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleDownload}
              disabled={downloading}
              className="px-4 py-2 bg-[#08733e] hover:bg-[#065b31] text-white rounded-xl text-xs font-extrabold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs disabled:opacity-50"
            >
              {downloading ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />} 
              {downloading ? "Generating PNG..." : "Download E-Certificate"}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-700 rounded-xl hover:bg-slate-100 transition-all cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Certificate Card Content */}
        <div id="certificate-card-container" className="bg-white rounded-2xl border-8 border-amber-400 p-6 md:p-10 shadow-lg space-y-6 relative overflow-hidden text-center print:border-4 print:p-4">

          
          {/* Background Watermark */}
          <div className="absolute inset-0 pointer-events-none opacity-[0.03] flex items-center justify-center">
            <Trophy size={300} />
          </div>

          {/* Certificate Header */}
          <div className="space-y-1 relative z-10">
            <div className="w-14 h-14 bg-amber-100 text-amber-700 rounded-full flex items-center justify-center mx-auto shadow-inner border border-amber-300 mb-1">
              <Award size={30} />
            </div>
            <span className="text-[10px] font-black uppercase tracking-[0.25em] text-amber-800 bg-amber-50 px-3 py-0.5 rounded-full border border-amber-200">
              Official Certificate of Achievement
            </span>
            <h2 className="text-xl md:text-3xl font-serif font-bold text-gray-900 tracking-wide pt-1">
              {tournamentTitle}
            </h2>
          </div>

          {/* Recipient */}
          <div className="py-3 border-y border-amber-100 space-y-2 relative z-10">
            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">This Certificate is Proudly Awarded To</p>
            <h3 className="text-2xl md:text-4xl font-black text-[#08733e] capitalize">
              {recipient}
            </h3>
            <div>
              <span className="px-3.5 py-1 bg-amber-100 text-amber-900 border border-amber-300 rounded-full text-[11px] font-black uppercase">
                🏆 {certType} AWARD
              </span>
            </div>
          </div>

          {/* Footer Metadata & Embedded QR Code */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center relative z-10 pt-2 text-left">
            <div className="space-y-1 text-[11px] text-gray-600 font-semibold text-center md:text-left">
              <p className="text-gray-900 font-bold flex items-center justify-center md:justify-start gap-1">
                <Building2 size={12} className="text-[#08733e]" /> Elle Hub League
              </p>
              <p className="flex items-center justify-center md:justify-start gap-1">
                <Calendar size={12} className="text-[#08733e]" /> Date: {issueDate}
              </p>
            </div>

            {/* Embedded Live QR Code */}
            <div className="flex flex-col items-center justify-center space-y-1">
              <div className="p-2 bg-white border border-amber-300 rounded-xl shadow-xs">
                <QRCodeSVG 
                  value={qrTextPayload} 
                  size={105} 
                  bgColor={"#FFFFFF"} 
                  fgColor={"#08733e"} 
                  level={"M"} 
                />
              </div>
              <span className="text-[9px] font-mono text-gray-400 font-bold">Scan with Phone Camera</span>
            </div>

            <div className="text-center md:text-right text-[10px] text-gray-400 font-mono">
              <p className="font-bold text-gray-700">Token ID</p>
              <p className="bg-slate-100 px-2 py-0.5 rounded text-gray-800 font-bold inline-block">{token}</p>
            </div>
          </div>


        </div>

      </div>
    </div>
  );
}
