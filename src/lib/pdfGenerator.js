import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export const generateDiagnosticPDF = (data) => {
    const { business, threatResult, lossResult, exportResult, nightResult, visibilityResult } = data;
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();

    // Helper functions
    const formatINR = (n) => {
        if (!n) return 'N/A';
        return `RS. ${n.toLocaleString('en-IN')}`;
    };

    // --- Page 1: Title & Branding ---
    doc.setFillColor(2, 6, 23); // Dark background
    doc.rect(0, 0, pageWidth, 50, 'F');

    doc.setTextColor(0, 229, 255); // Primary color
    doc.setFontSize(28);
    doc.setFont('helvetica', 'bold');
    doc.text('MASTERKEY LABS', pageWidth / 2, 25, { align: 'center' });

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(14);
    doc.text('BUSINESS DIAGNOSTIC REPORT', pageWidth / 2, 38, { align: 'center' });

    // Business Info Section
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(12);
    doc.text('BUSINESS PROFILE:', 20, 65);
    doc.setFont('helvetica', 'normal');
    doc.text(`Entity Name: ${business?.entity_name || 'N/A'}`, 25, 75);
    doc.text(`Contact Owner: ${business?.owner_name || 'N/A'}`, 25, 82);
    doc.text(`Email: ${business?.email || 'N/A'}`, 25, 89);
    doc.text(`Phone: ${business?.phone || 'N/A'}`, 25, 96);
    doc.text(`Location: ${business?.location || 'N/A'}`, 25, 103);

    // AI Threat Summary
    doc.setFillColor(245, 245, 245);
    doc.rect(15, 115, pageWidth - 30, 40, 'F');
    doc.setTextColor(0, 0, 0);
    doc.setFont('helvetica', 'bold');
    doc.text('AI THREAT ASSESSMENT', 20, 125);

    if (threatResult) {
        const threatLevel = threatResult.threat_level || 'N/A';
        const threatColor = threatLevel === 'KHATRA' ? [255, 49, 49] : threatLevel === 'SAVDHAN' ? [255, 94, 0] : [57, 255, 20];
        doc.setTextColor(...threatColor);
        doc.text(`THREAT LEVEL: ${threatLevel}`, 20, 135);
        doc.setTextColor(0, 0, 0);
        doc.setFont('helvetica', 'normal');
        doc.text(`Score: ${threatResult.score}/100`, 20, 142);
        doc.text(`Estimated Survival: ${threatResult.years_left} years`, 20, 149);
    } else {
        doc.text('Assessment Pending', 20, 135);
    }

    // Operational Waste Breakdown
    doc.setTextColor(0, 0, 0);
    doc.setFont('helvetica', 'bold');
    doc.text('OPERATIONAL WASTE AUDIT', 20, 170);

    const wasteData = [
        ['Section', 'Monthly Waste', 'Annual Projection'],
        ['Staff Efficiency', formatINR(lossResult?.staff_waste), formatINR(lossResult?.staff_waste * 12)],
        ['Marketing Spend', formatINR(lossResult?.marketing_waste), formatINR(lossResult?.marketing_waste * 12)],
        ['Operations Leak', formatINR(lossResult?.ops_waste), formatINR(lossResult?.ops_waste * 12)],
        ['Total Monthly Loss', formatINR(lossResult?.total_burn), formatINR(lossResult?.total_burn * 12)]
    ];

    autoTable(doc, {
        startY: 175,
        head: [wasteData[0]],
        body: wasteData.slice(1),
        theme: 'striped',
        headStyles: { fillColor: [2, 6, 23], textColor: [255, 255, 255] }
    });

    // --- Page 2: Growth Opportunities & Services ---
    doc.addPage();
    doc.setFillColor(2, 6, 23);
    doc.rect(0, 0, pageWidth, 25, 'F');
    doc.setTextColor(0, 229, 255);
    doc.setFontSize(16);
    doc.text('GROWTH OPPORTUNITIES', 20, 16);

    doc.setTextColor(0, 0, 0);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('UNRECLAIMED CAPITAL:', 20, 40);

    const opportunityData = [
        ['Feature', 'Diagnostic Finding'],
        ['Night Loss', nightResult ? `Losing ${formatINR(nightResult.monthly_loss)}/mo from ${nightResult.night_inquiries} missed leads.` : 'Data not captured.'],
        ['Global Expansion', exportResult ? `Your products can sell for ${exportResult.multiplier}x more in ${exportResult.destination}. ROI: ${exportResult.roi_percent}%` : 'Data not captured.'],
        ['Digital Visibility', visibilityResult ? `Current Visibility: ${visibilityResult.percent}%. Approx ${visibilityResult.missed_customers} customers missed monthly.` : 'Data not captured.']
    ];

    autoTable(doc, {
        startY: 45,
        head: [opportunityData[0]],
        body: opportunityData.slice(1),
        theme: 'grid',
        headStyles: { fillColor: [0, 229, 255], textColor: [0, 0, 0] }
    });

    // Services Section
    const serviceY = doc.lastAutoTable.finalY + 15;
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('HOW WE FUTURE-PROOF YOUR BUSINESS', 20, serviceY);

    doc.setFontSize(10);
    const services = [
        {
            title: '1. Premium Brand & Identity Architecture',
            desc: 'In the AI era, trust is the only currency. Hum aapki aisi visual aur strategic identity build karte hain jo premium positioning establish kare. This ensures customers choose you over low-cost automated competitors.'
        },
        {
            title: '2. Custom AI Systems & Workflow Automation',
            desc: 'Stop wasting human potential on repetitive tasks. We build custom ERPs, CRMs, and AI agents that handle your operations, data entry, and sorting, reducing human error to zero and cutting operational costs by up to 40%.'
        },
        {
            title: '3. Data-Driven Growth & Lead Engineering',
            desc: 'Generic ads are dead. We engineer precision-targeted lead generation funnels that identify high-intent buyers using predictive analytics. Aapki marketing spend waste nahi hogi, it will be an investment with trackable ROI.'
        },
        {
            title: '4. AI Transformation & Strategy Roadmap',
            desc: 'AI is moving fast. We provide a 12-month technical roadmap to integrate Large Language Models (LLMs) and computer vision into your core product, ensuring you remain the "Master" of your industry.'
        }
    ];

    let currentY = serviceY + 10;
    services.forEach(service => {
        if (currentY > 260) { doc.addPage(); currentY = 20; }
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(0, 229, 255);
        doc.text(service.title, 20, currentY);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(0, 0, 0);
        const lines = doc.splitTextToSize(service.desc, pageWidth - 40);
        doc.text(lines, 25, currentY + 7);
        currentY += (lines.length * 6) + 10;
    });

    // --- Page 3: AI Transformation Roadmap ---
    if (currentY > 200) { doc.addPage(); currentY = 20; } else { currentY += 10; }

    doc.setFillColor(0, 229, 255);
    doc.rect(20, currentY, 5, 5, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text('YOUR 30-DAY ACTION PLAN', 30, currentY + 4);

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    const roadmap = [
        ['Phase', 'Objective', 'Outcome'],
        ['Week 1', 'Efficiency Audit', 'Identify top 3 waste nodes'],
        ['Week 2', 'Prototype Integration', 'Deploy first AI automation agent'],
        ['Week 3', 'Identity Overhaul', 'Sync branding with premium output'],
        ['Week 4', 'Scale & Optimize', '10x growth in digital footprint']
    ];

    autoTable(doc, {
        startY: currentY + 10,
        head: [roadmap[0]],
        body: roadmap.slice(1),
        theme: 'grid',
        headStyles: { fillColor: [2, 6, 23], textColor: [255, 255, 255] }
    });

    // Contact Support Footer
    const finalY = doc.lastAutoTable.finalY + 15;
    doc.setFillColor(245, 245, 245);
    doc.rect(15, finalY, pageWidth - 30, 25, 'F');
    doc.setTextColor(0, 0, 0);
    doc.setFont('helvetica', 'bold');
    doc.text('READY TO FUTURE-PROOF?', pageWidth / 2, finalY + 10, { align: 'center' });
    doc.setFont('helvetica', 'normal');
    doc.text('Contact your AI Strategist on WhatsApp: +91 79009 00007', pageWidth / 2, finalY + 14, { align: 'center' });
    doc.text('Email: support@masterkeylabs.in', pageWidth / 2, finalY + 20, { align: 'center' });

    // Footer on last page
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text('CONFIDENTIAL | MASTERKEY LABS (c) 2024', pageWidth / 2, 285, { align: 'center' });

    return doc;
};
