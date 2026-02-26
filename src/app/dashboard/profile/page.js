'use client';
import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import FeatureLayout from '@/components/FeatureLayout';
import { useAuth } from '@/lib/AuthContext';
import { supabase } from '@/lib/supabaseClient';
import { translations } from '@/lib/translations';

function ProfileEditContent() {
    const { business } = useAuth();
    const searchParams = useSearchParams();
    const router = useRouter();
    const businessId = business?.id || searchParams.get('id') || (typeof window !== 'undefined' ? localStorage.getItem('masterkey_business_id') : null);

    const [lang, setLang] = useState('en');
    const t = translations[lang];

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState(null);

    const [formData, setFormData] = useState({
        businessName: '',
        contactName: '',
        email: '',
        whatsapp: '',
        vertical: 'local_business',
        revenueBracket: '5-20L',
        employees: '1-10',
        marketingSpend: 10000,
        opsSpend: 50000,
        contactAfter6: 'ignored'
    });

    useEffect(() => {
        if (!businessId) {
            setLoading(false);
            return;
        }

        const fetchProfile = async () => {
            try {
                const { data, error } = await supabase
                    .from('businesses')
                    .select('*')
                    .eq('id', businessId)
                    .single();

                if (error) throw error;

                if (data) {
                    // Reverse classification string "vertical::revenueBracket"
                    let v = 'local_business';
                    let r = '5-20L';
                    if (data.classification && data.classification.includes('::')) {
                        const parts = data.classification.split('::');
                        v = parts[0];
                        r = parts[1];
                    } else if (data.classification && data.classification.includes(' (')) {
                        const match = data.classification.match(/(.*) \((.*)\)/);
                        if (match) {
                            v = match[1];
                            r = match[2];
                        }
                    }

                    // Attempt to fetch loss audit to prepopulate marketing/ops spend
                    const { data: auditData } = await supabase
                        .from('loss_audit_results')
                        .select('marketing_budget, ops_overheads')
                        .eq('business_id', businessId)
                        .order('created_at', { ascending: false })
                        .limit(1)
                        .maybeSingle();

                    setFormData({
                        businessName: data.entity_name || '',
                        contactName: data.owner_name || '',
                        email: data.email || '',
                        whatsapp: data.phone || '',
                        vertical: v,
                        revenueBracket: r,
                        employees: data.scalability || '1-10',
                        marketingSpend: auditData?.marketing_budget || 10000,
                        opsSpend: auditData?.ops_overheads || 50000,
                        contactAfter6: data.digital_footprint || 'ignored'
                    });
                }
            } catch (err) {
                console.error("Error fetching profile:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, [businessId]);

    const handleChange = (e) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setMessage(null);

        if (!businessId) {
            setMessage({ type: 'error', text: 'No business ID found. Cannot save.' });
            return;
        }

        setSaving(true);
        try {
            // Update Business Table
            const { error: bizError } = await supabase
                .from('businesses')
                .update({
                    entity_name: formData.businessName,
                    owner_name: formData.contactName,
                    email: formData.email,
                    phone: formData.whatsapp,
                    classification: `${formData.vertical}::${formData.revenueBracket}`,
                    scalability: formData.employees,
                    digital_footprint: formData.contactAfter6
                })
                .eq('id', businessId);

            if (bizError) throw bizError;

            // Check if marketingSpend or opsSpend changed, update loss_audit_results
            const { data: currentAudit } = await supabase
                .from('loss_audit_results')
                .select('*')
                .eq('business_id', businessId)
                .order('created_at', { ascending: false })
                .limit(1)
                .maybeSingle();

            const newMarketingSpend = parseInt(formData.marketingSpend, 10) || 0;
            const newOpsSpend = parseInt(formData.opsSpend, 10) || 0;

            if (currentAudit) {
                if (currentAudit.marketing_budget !== newMarketingSpend || currentAudit.ops_overheads !== newOpsSpend) {
                    // Determine new waste & burn based on new inputs (Simplified update logic for the metrics)
                    // If they change ops/marketing spend, it directly affects their total burn.
                    // Re-calculate basic waste here to keep records accurate without re-running full calculateLossAudit logic

                    const newMarketingWaste = newMarketingSpend * 0.40;
                    const newOpsWaste = newOpsSpend * 0.15;
                    const newTotalBurn = currentAudit.staff_waste + newMarketingWaste + newOpsWaste;

                    const { error: auditError } = await supabase
                        .from('loss_audit_results')
                        .update({
                            marketing_budget: newMarketingSpend,
                            ops_overheads: newOpsSpend,
                            marketing_waste: newMarketingWaste,
                            ops_waste: newOpsWaste,
                            total_burn: newTotalBurn,
                            annual_burn: newTotalBurn * 12,
                            five_year_cost: newTotalBurn * 12 * 5
                        })
                        .eq('id', currentAudit.id);

                    if (auditError) {
                        console.error("Error updating loss_audit_results:", auditError);
                        throw auditError;
                    }
                }
            } else {
                // If there's no pre-existing loss audit row matching the business ID, we create one now
                const newMarketingWaste = newMarketingSpend * 0.40;
                const newOpsWaste = newOpsSpend * 0.15;
                const newTotalBurn = newMarketingWaste + newOpsWaste;

                const { error: insertError } = await supabase
                    .from('loss_audit_results')
                    .insert([{
                        business_id: businessId,
                        marketing_budget: newMarketingSpend,
                        ops_overheads: newOpsSpend,
                        marketing_waste: newMarketingWaste,
                        ops_waste: newOpsWaste,
                        staff_waste: 0,
                        total_burn: newTotalBurn,
                        annual_burn: newTotalBurn * 12,
                        five_year_cost: newTotalBurn * 12 * 5
                    }]);

                if (insertError) {
                    console.error("Error inserting initial loss_audit_results:", insertError);
                    throw insertError;
                }
            }

            setMessage({ type: 'success', text: 'Profile updated successfully!' });

            // Redirect back to dashboard after short delay
            setTimeout(() => {
                router.push(businessId ? `/dashboard?id=${businessId}` : '/dashboard');
            }, 1000);

        } catch (err) {
            console.error("Save error:", err);
            setMessage({ type: 'error', text: err.message || 'Failed to update profile.' });
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return <FeatureLayout title="Loading Profile..." backHref="/dashboard" t={t}><div className="p-10 text-white/50">Loading profile data...</div></FeatureLayout>;
    }

    return (
        <FeatureLayout
            title="Edit Business Profile"
            subtitle="Update your core identity and operational metrics"
            backHref={businessId ? `/dashboard?id=${businessId}` : '/dashboard'}
            t={t}
        >
            <div className="max-w-3xl mx-auto">
                <div className="bg-carbon border border-white/10 rounded-[2rem] p-8 md:p-10 shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-ios-blue via-ios-purple to-neon-cyan"></div>

                    {message && (
                        <div className={`p-4 rounded-xl mb-8 border ${message.type === 'error' ? 'bg-alert-orange/10 border-alert-orange/30 text-alert-orange' : 'bg-neon-green/10 border-neon-green/30 text-neon-green'}`}>
                            {message.text}
                        </div>
                    )}

                    <form onSubmit={handleSave} className="space-y-8">
                        {/* Section 1: Core Identity */}
                        <div>
                            <h3 className="text-[10px] text-ios-blue uppercase tracking-[0.2em] font-bold mb-4 border-b border-white/5 pb-2">Business Identity</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="text-[10px] text-white/40 uppercase tracking-widest block mb-2 font-bold ml-1">Business Name</label>
                                    <input type="text" name="businessName" value={formData.businessName} onChange={handleChange} required className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-ios-blue transition-all" />
                                </div>
                                <div>
                                    <label className="text-[10px] text-white/40 uppercase tracking-widest block mb-2 font-bold ml-1">Manager/Owner Name</label>
                                    <input type="text" name="contactName" value={formData.contactName} onChange={handleChange} required className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-ios-blue transition-all" />
                                </div>
                                <div>
                                    <label className="text-[10px] text-white/40 uppercase tracking-widest block mb-2 font-bold ml-1">WhatsApp Number</label>
                                    <input type="tel" name="whatsapp" value={formData.whatsapp} onChange={handleChange} required className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-ios-blue transition-all" />
                                </div>
                                <div>
                                    <label className="text-[10px] text-white/40 uppercase tracking-widest block mb-2 font-bold ml-1">Email Address</label>
                                    <input type="email" name="email" value={formData.email} onChange={handleChange} required className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-ios-blue transition-all" />
                                </div>
                            </div>
                        </div>

                        {/* Submit */}
                        <div className="pt-6 border-t border-white/5 flex gap-4">
                            <button
                                type="button"
                                onClick={() => router.push(businessId ? `/dashboard?id=${businessId}` : '/dashboard')}
                                className="px-6 py-4 rounded-xl border border-white/10 text-white/60 hover:text-white hover:bg-white/5 transition-all text-sm font-bold uppercase tracking-widest"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={saving}
                                className="flex-1 bg-ios-blue hover:bg-blue-500 text-white font-bold py-4 rounded-xl uppercase tracking-widest transition-all flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(0,122,255,0.3)] disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {saving ? (
                                    <><span className="material-symbols-outlined animate-spin">sync</span> Saving Profile...</>
                                ) : (
                                    <><span className="material-symbols-outlined">save</span> Save Changes</>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </FeatureLayout>
    );
}

export default function EditProfilePage() {
    return (
        <Suspense fallback={<div className="text-white p-10">Loading Profile Engine...</div>}>
            <ProfileEditContent />
        </Suspense>
    );
}
