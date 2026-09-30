import { useState } from 'react';
import { User, Phone, Mail, MapPin, Calendar, CheckCircle2, ShieldCheck } from 'lucide-react';
import { useAuth } from '../lib/auth';
import { useAppData } from '../lib/AppContext';
import { VerificationBadge } from '../components/StatusBadge';

export default function Profile() {
  const { user } = useAuth();
  const { updateProfile } = useAppData();

  const [fullName, setFullName] = useState(user?.full_name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [email, setEmail] = useState(user?.email || '');
  const [address, setAddress] = useState(user?.address || '');
  const [birthdate, setBirthdate] = useState(user?.birthdate || '');
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);
    setTimeout(() => {
      updateProfile(user.id, {
        full_name: fullName,
        phone,
        email,
        address,
        birthdate,
      });
      setLoading(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    }, 400);
  };

  if (!user) return null;

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 md:py-12">
      <div className="mb-8 pb-6 border-b border-white/5">
        <h1 className="font-display text-3xl md:text-4xl text-foreground tracking-wide mb-2">Customer Profile</h1>
        <p className="text-sm text-muted-foreground font-light">
          Manage your personal information, contact number, and default delivery address.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        {/* Profile Card / Summary */}
        <div className="bg-card border border-white/5 rounded-xl p-6 h-fit text-center space-y-4 shadow-lg">
          <div className="w-20 h-20 rounded-full bg-primary/10 border border-primary/20 text-primary flex items-center justify-center mx-auto text-2xl font-display">
            {fullName ? fullName.charAt(0).toUpperCase() : 'U'}
          </div>
          <div>
            <h2 className="font-display text-xl text-foreground">{fullName || 'Customer'}</h2>
            <p className="text-xs text-muted-foreground mt-0.5">{email}</p>
          </div>

          <div className="pt-2 border-t border-white/5 flex flex-col items-center gap-1.5">
            <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Account Status</span>
            <VerificationBadge status={user.verification_status} />
          </div>

          <div className="text-left bg-background/50 rounded-lg p-3 text-xs space-y-2 text-muted-foreground border border-white/5">
            <div className="flex items-center gap-2">
              <ShieldCheck size={14} className="text-primary shrink-0" />
              <span>18+ Age Verified</span>
            </div>
            {address && (
              <div className="flex items-start gap-2">
                <MapPin size={14} className="text-primary shrink-0 mt-0.5" />
                <span className="line-clamp-2">{address}</span>
              </div>
            )}
          </div>
        </div>

        {/* Edit Form */}
        <div className="md:col-span-2">
          <form onSubmit={handleSave} className="bg-card border border-white/5 rounded-xl p-6 md:p-8 space-y-6 shadow-xl">
            <h3 className="font-display text-xl text-foreground pb-3 border-b border-white/5">
              Edit Account Information
            </h3>

            {saved && (
              <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-4 py-3 rounded-lg text-sm">
                <CheckCircle2 size={16} />
                <span>Customer information saved successfully!</span>
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-sans text-muted-foreground tracking-wide mb-2 flex items-center gap-1.5">
                  <User size={13} className="text-primary" /> Full Name
                </label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="premium-input"
                  placeholder="Enter full name"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-sans text-muted-foreground tracking-wide mb-2 flex items-center gap-1.5">
                    <Phone size={13} className="text-primary" /> Contact Number
                  </label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="premium-input"
                    placeholder="e.g. 09171234567"
                  />
                </div>

                <div>
                  <label className="block text-xs font-sans text-muted-foreground tracking-wide mb-2 flex items-center gap-1.5">
                    <Mail size={13} className="text-primary" /> Email Address
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="premium-input"
                    placeholder="name@domain.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-sans text-muted-foreground tracking-wide mb-2 flex items-center gap-1.5">
                  <Calendar size={13} className="text-primary" /> Date of Birth
                </label>
                <input
                  type="date"
                  value={birthdate}
                  onChange={(e) => setBirthdate(e.target.value)}
                  className="premium-input"
                  style={{ colorScheme: 'dark' }}
                />
              </div>

              <div>
                <label className="block text-xs font-sans text-muted-foreground tracking-wide mb-2 flex items-center gap-1.5">
                  <MapPin size={13} className="text-primary" /> Default Delivery Address
                </label>
                <textarea
                  rows={3}
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="House/Unit #, Street, Barangay, City, Province, Postal Code"
                  className="premium-input resize-none"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-white/5 flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className="btn-premium px-8 py-3 text-sm font-medium"
              >
                {loading ? 'Saving...' : 'Save Profile Changes'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
