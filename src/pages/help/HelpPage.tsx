import { useEffect, useState } from 'react';
import { useLang } from '../../context/AppContext';
import { Accordion } from '../../components/ui/index';

export default function HelpPage() {
  const { t } = useLang();
  const [name, setName]       = useState('');
  const [phone, setPhone]     = useState('');
  const [email, setEmail]     = useState('');
  const [msg, setMsg]         = useState('');
  const [refNo, setRefNo]     = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => { document.title = 'Help — Power Distribution Monitoring Portal'; }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setTimeout(() => {
      setRefNo(`SUP-${Date.now().toString().slice(-6)}`);
      setSubmitting(false);
      setName(''); setPhone(''); setEmail(''); setMsg('');
    }, 800);
  };

  const faqs = [
    { q: 'How do I read the status colours?',
      a: <p>Status always shows an icon, a word, and a colour — never colour alone.<br /><strong style={{color:'var(--normal)'}}>✓ Normal</strong> (green) means the area is using less than 70% of its supply limit. No action needed.<br /><strong style={{color:'var(--warn)'}}>● Needs attention</strong> (amber) means 70–90% of the limit is in use. Monitor closely and consider adjusting supply.<br /><strong style={{color:'var(--urgent)'}}>⚠ Urgent</strong> (red) means more than 90% is in use. Immediate reallocation may be required.</p> },
    { q: 'What does "supply limit" mean?',
      a: <p>The supply limit is the maximum power that the distribution equipment in that area can safely handle at any time. Sending more power than the limit risks damaging equipment or causing a power cut. The "most power that can safely be given" figure also accounts for battery backup availability.</p> },
    { q: 'How do I adjust supply for an area?',
      a: <ol style={{paddingLeft:'18px',lineHeight:'1.9'}}><li>Click <strong>Adjust Supply</strong> in the main menu.</li><li>Select the area in Step 1.</li><li>Check the limits table in Step 2.</li><li>Enter the new supply amount in Step 3 — the form will not let you exceed the safe maximum.</li><li>Review the summary in Step 4 and click <strong>Confirm and submit</strong>.</li><li>You will see a request number and have 10 seconds to undo the change.</li></ol> },
    { q: 'What is the Demand Forecast?',
      a: <p>The forecast estimates how much power each area will need over the coming hours, based on past data from the State Power Board and the current scenario. It is made by the GridOps Forecast v2.1 model and has a typical error of about 3.8%. It is an estimate and not a guarantee.</p> },
    { q: 'What does Emergency Supply Boost do?',
      a: <p>The Emergency Supply Boost moves all available flexible load and spare system supply to a selected area, up to its safe maximum. It does not touch protected areas. Use it only in genuine emergencies. Every emergency boost is recorded with the reason you provide.</p> },
    { q: 'Who do I contact for urgent problems?',
      a: <p>Call the Control Room on <strong>1800-XXX-XXXX</strong> (toll-free, 24×7).<br />Email: <a href="mailto:control.room@example.gov.in">control.room@example.gov.in</a><br />For portal issues: use the "Raise a support request" form on this page.</p> },
  ];

  const guideSteps = [
    'Open the portal. The Home page shows the current status of all 12 areas at a glance.',
    'Check the "Areas at a glance" table. Urgent areas appear at the top in red.',
    'Click "View" on any area to see its detail page, including power used, supply limit, and house-level data.',
    'If an area shows Urgent, check "What should be done?" on the Home page for a suggested action.',
    'To change supply, click "Adjust Supply" in the menu or the "Adjust supply for this area" button on the detail page.',
    'All changes, notices, and recommendations are stored in Notices & Records. You can download the record as a CSV file.',
  ];

  return (
    <div>
      <div style={{ marginBottom: '20px', paddingBottom: '12px', borderBottom: '2px solid var(--blue)' }}>
        <h1 style={{ margin: 0 }}>{t('helpTitle')}</h1>
      </div>

      {/* FAQs */}
      <div className="card card-top-blue" style={{ marginBottom: '20px' }}>
        <div className="card-head">{t('faq')}</div>
        <div className="card-body">
          <Accordion items={faqs} />
        </div>
      </div>

      {/* User guide */}
      <div className="card card-top-blue" style={{ marginBottom: '20px' }}>
        <div className="card-head">{t('userGuide')}</div>
        <div className="card-body">
          <ol style={{ paddingLeft: '20px', lineHeight: '1.9', fontSize: '15px', margin: 0 }}>
            {guideSteps.map((s, i) => <li key={i} style={{ marginBottom: '8px' }}>{s}</li>)}
          </ol>
        </div>
      </div>

      {/* Contact */}
      <div className="card card-top-blue" style={{ marginBottom: '20px' }} id="contact">
        <div className="card-head">{t('contact')}</div>
        <div className="card-body">
          <div className="tbl-wrap">
            <table className="tbl" style={{ maxWidth: '480px' }}>
              <tbody>
                <tr><td style={{fontWeight:'700'}}>Control Room Helpline</td><td><a href="tel:1800XXXXXXX" style={{fontWeight:'700',fontSize:'16px'}}>1800-XXX-XXXX</a><span style={{fontSize:'13px',color:'var(--text-sec)',marginLeft:'8px'}}>(Toll-free, 24×7)</span></td></tr>
                <tr><td style={{fontWeight:'700'}}>Email</td><td><a href="mailto:control.room@example.gov.in">control.room@example.gov.in</a></td></tr>
                <tr><td style={{fontWeight:'700'}}>Portal support</td><td><a href="mailto:portal.support@example.gov.in">portal.support@example.gov.in</a></td></tr>
                <tr><td style={{fontWeight:'700'}}>Office address</td><td>Power Distribution Monitoring Centre, Vidyut Bhawan, Jyoti Nagar, Jaipur – 302 005 (placeholder)</td></tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Support request form */}
      <div className="card card-top-blue" style={{ marginBottom: '20px' }}>
        <div className="card-head">Raise a support request</div>
        <div className="card-body" style={{ maxWidth: '540px' }}>
          {refNo ? (
            <div className="confirm-box">
              <div className="confirm-box-title">✓ Request submitted</div>
              <p style={{ margin: 0 }}>Your request number is <strong>{refNo}</strong>. We will respond within 2 working days.</p>
              <button className="btn btn-secondary btn-sm" style={{ marginTop: '12px' }} onClick={() => setRefNo('')}>Raise another request</button>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div className="field"><label htmlFor="s-name">Full name <span style={{color:'var(--urgent)'}}>*</span></label><input id="s-name" type="text" className="input" value={name} onChange={e=>setName(e.target.value)} required placeholder="Your name" /></div>
              <div className="field"><label htmlFor="s-phone">Phone number</label><input id="s-phone" type="tel" className="input" value={phone} onChange={e=>setPhone(e.target.value)} placeholder="+91 XXXXX XXXXX" /></div>
              <div className="field"><label htmlFor="s-email">Email address <span style={{color:'var(--urgent)'}}>*</span></label><input id="s-email" type="email" className="input" value={email} onChange={e=>setEmail(e.target.value)} required placeholder="name@example.gov.in" /></div>
              <div className="field"><label htmlFor="s-msg">Message <span style={{color:'var(--urgent)'}}>*</span></label><textarea id="s-msg" className="textarea" value={msg} onChange={e=>setMsg(e.target.value)} required placeholder="Describe the issue you are facing…" rows={4} /></div>
              <button type="submit" className="btn btn-primary" disabled={submitting}>{submitting ? 'Submitting…' : t('submit')}</button>
            </form>
          )}
        </div>
      </div>

      {/* Accessibility statement */}
      <div className="card card-top-blue" style={{ marginBottom: '20px' }} id="access">
        <div className="card-head">{t('accessStmt')}</div>
        <div className="card-body">
          <p>This portal aims to conform to the Guidelines for Indian Government Websites (GIGW) and WCAG 2.1 Level AA. It supports keyboard navigation, screen readers, text-size adjustment, and high-contrast mode.</p>
          <h3 style={{ marginTop: '12px' }}>Keyboard navigation</h3>
          <ul style={{ paddingLeft: '18px', lineHeight: '1.9', fontSize: '14px' }}>
            <li>Use <kbd style={{background:'#F3F4F6',border:'1px solid var(--border)',borderRadius:'3px',padding:'1px 6px'}}>Tab</kbd> to move between interactive elements.</li>
            <li>Use <kbd style={{background:'#F3F4F6',border:'1px solid var(--border)',borderRadius:'3px',padding:'1px 6px'}}>Enter</kbd> or <kbd style={{background:'#F3F4F6',border:'1px solid var(--border)',borderRadius:'3px',padding:'1px 6px'}}>Space</kbd> to activate buttons.</li>
            <li>Press <kbd style={{background:'#F3F4F6',border:'1px solid var(--border)',borderRadius:'3px',padding:'1px 6px'}}>Ctrl+K</kbd> to jump to the area search box.</li>
            <li>Use the "Skip to main content" link at the top of every page to bypass the navigation bar.</li>
          </ul>
          <h3 style={{ marginTop: '12px' }}>Text size and contrast</h3>
          <p style={{ margin: 0 }}>Use the A−, A, A+ buttons in the utility bar to change text size. Click "High contrast" to switch to high-contrast mode. These settings are not saved between sessions.</p>
          <p style={{ marginTop: '8px', fontSize: '13px', color: 'var(--text-sec)' }}>Full WCAG 2.1 AA compliance requires manual testing with assistive technologies. Please contact us if you find an accessibility barrier.</p>
        </div>
      </div>
    </div>
  );
}
