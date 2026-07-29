import React from 'react';
import { Link } from 'react-router-dom';
import { FaFacebookF, FaInstagram, FaTwitter, FaLinkedinIn, FaYoutube, FaPhone, FaWhatsapp, FaEnvelope, FaMapMarkerAlt } from 'react-icons/fa';
import type { ContactPageContent } from '../types';

interface FooterProps { content: ContactPageContent; }

const Footer: React.FC<FooterProps> = ({ content }) => {
    const socialLinks = [
        { name: 'Facebook', icon: FaFacebookF, href: content.facebook_url, color: 'hover:text-[#1877f2]' },
        { name: 'Instagram', icon: FaInstagram, href: content.instagram_url, color: 'hover:text-[#e4405f]' },
        { name: 'Twitter', icon: FaTwitter, href: content.twitter_url, color: 'hover:text-[#1da1f2]' },
        { name: 'LinkedIn', icon: FaLinkedinIn, href: content.linkedin_url, color: 'hover:text-[#0a66c2]' },
        { name: 'YouTube', icon: FaYoutube, href: content.youtube_url, color: 'hover:text-[#ff0000]' },
    ].filter(s => s.href);

    return (
        <footer className="text-white" style={{background:'linear-gradient(180deg, #0f1f10 0%, #0a150a 100%)'}}>
            <div className="container py-16 md:py-20">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-10 mb-12">
                    {/* Brand */}
                    <div className="col-span-2 md:col-span-1 space-y-4">
                        <Link to="/" className="flex items-center gap-3">
                            <img src="/akaylogo.png" alt="Logo" className="w-11 h-11 object-contain brightness-200" />
                            <span className="text-xl font-bold font-[family-name:var(--font-display)] text-white">Akaydın Tarım</span>
                        </Link>
                        <p className="text-sm leading-relaxed max-w-52" style={{color:'rgba(255,255,255,0.5)'}}>
                            Fındık ve tarım sektöründe yenilikçi çözümlerle geleceğin tarımını bugünden inşa ediyoruz.
                        </p>
                    </div>

                    {/* Quick links */}
                    <div>
                        <h4 className="text-xs font-semibold tracking-[0.15em] uppercase mb-5" style={{color:'rgba(255,255,255,0.35)'}}>Hızlı Erişim</h4>
                        <ul className="space-y-3">
                            {[['/hakkimizda','Hakkımızda'],['/findik-isleme','Fındık İşleme'],['/hizmetlerimiz','Hizmetlerimiz'],['/urunler','Ürünler'],['/blog','Blog']].map(([to,label]) => (
                                <li key={to}><Link to={to} className="text-sm transition-colors duration-150 hover:text-white" style={{color:'rgba(255,255,255,0.6)'}}>{label}</Link></li>
                            ))}
                        </ul>
                    </div>

                    {/* Contact */}
                    <div>
                        <h4 className="text-xs font-semibold tracking-[0.15em] uppercase mb-5" style={{color:'rgba(255,255,255,0.35)'}}>İletişim</h4>
                        <ul className="space-y-3 text-sm" style={{color:'rgba(255,255,255,0.6)'}}>
                            <li className="flex items-start gap-3">
                                <FaMapMarkerAlt className="w-4 h-4 mt-0.5 shrink-0" style={{color:'#3da35e'}} />
                                <span>{content.address}</span>
                            </li>
                            <li className="flex items-center gap-3">
                                <FaPhone className="w-4 h-4 shrink-0" style={{color:'#3da35e'}} />
                                <a href={`tel:${content.phone}`} className="hover:text-white transition-colors">{content.phone}</a>
                            </li>
                            {content.whatsapp_phone && (
                                <li className="flex items-center gap-3">
                                    <FaWhatsapp className="w-4 h-4 shrink-0" style={{color:'#3da35e'}} />
                                    <a href={`https://wa.me/${content.whatsapp_phone.replace(/[^\d]/g, '')}`} target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">WhatsApp</a>
                                </li>
                            )}
                            <li className="flex items-center gap-3">
                                <FaEnvelope className="w-4 h-4 shrink-0" style={{color:'#3da35e'}} />
                                <a href={`mailto:${content.email}`} className="hover:text-white break-all transition-colors">{content.email}</a>
                            </li>
                        </ul>
                    </div>

                    {/* Social */}
                    <div>
                        <h4 className="text-xs font-semibold tracking-[0.15em] uppercase mb-5" style={{color:'rgba(255,255,255,0.35)'}}>Bizi Takip Edin</h4>
                        {socialLinks.length > 0 ? (
                            <div className="flex flex-wrap gap-2.5">
                                {socialLinks.map(s => (
                                    <a key={s.name} href={s.href} target="_blank" rel="noopener noreferrer"
                                        className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200 hover:scale-110 ${s.color}`}
                                        style={{background:'rgba(255,255,255,0.08)', color:'rgba(255,255,255,0.5)'}}
                                        title={s.name}>
                                        <s.icon className="w-4 h-4" />
                                    </a>
                                ))}
                            </div>
                        ) : (
                            <p className="text-xs" style={{color:'rgba(255,255,255,0.25)'}}>Admin panelinden ekleyin</p>
                        )}
                    </div>
                </div>

                <div className="pt-8 border-t text-center text-xs" style={{borderColor:'rgba(255,255,255,0.08)', color:'rgba(255,255,255,0.25)'}}>
                    &copy; {new Date().getFullYear()} Akaydın Tarım. Tüm hakları saklıdır.
                </div>
            </div>
        </footer>
    );
};

export default Footer;
