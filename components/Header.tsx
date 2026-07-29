import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import type { ContactPageContent } from '../types';

const NavItem: React.FC<{ to: string; children: React.ReactNode; onClick?: () => void }> = ({ to, children, onClick }) => (
    <NavLink
        to={to}
        onClick={onClick}
        className={({ isActive }) =>
            `relative px-3 py-2 text-sm font-medium rounded-btn transition-colors duration-150 ${
                isActive
                    ? 'text-accent bg-accent-bg'
                    : 'text-ink-2 hover:text-ink hover:bg-paper-2'
            }`
        }
    >
        {children}
    </NavLink>
);

interface HeaderProps { contactContent: ContactPageContent; }

const Header: React.FC<HeaderProps> = ({ contactContent }) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <header className="sticky top-0 z-50 bg-paper/90 backdrop-blur-md border-b border-rule">
            {/* Top bar — desktop */}
            <div className="hidden lg:block bg-accent text-white py-1.5 text-xs font-medium">
                <div className="container flex justify-between items-center">
                    <div className="flex items-center gap-5">
                        <span className="flex items-center gap-1.5">
                            <svg className="w-3.5 h-3.5 opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                            </svg>
                            {contactContent.phone}
                        </span>
                        {contactContent.whatsapp_phone && (
                            <a href={`https://wa.me/${contactContent.whatsapp_phone.replace(/[^\d]/g, '')}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 hover:opacity-80 transition-opacity">
                                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347"/></svg>
                                WhatsApp
                            </a>
                        )}
                    </div>
                    <span className="opacity-80">
                        {contactContent.address.split(',').slice(-2).join(',').trim()}
                    </span>
                </div>
            </div>

            {/* Main nav */}
            <div className="container flex items-center justify-between h-16">
                {/* Logo */}
                <NavLink to="/" className="flex items-center gap-2.5 group shrink-0">
                    <img
                        src="/akaylogo.png"
                        alt="Akaydın Tarım"
                        className="w-9 h-9 object-contain group-hover:scale-105 transition-transform duration-200"
                    />
                    <div className="hidden sm:block">
                        <span className="text-base font-bold font-[family-name:var(--font-display)] text-ink tracking-tight">
                            Akaydın Tarım
                        </span>
                        <p className="text-xs text-ink-3 font-medium">Fındık Uzmanı</p>
                    </div>
                </NavLink>

                {/* Desktop nav */}
                <nav className="hidden lg:flex items-center gap-1">
                    <NavItem to="/">Ana Sayfa</NavItem>
                    <NavItem to="/hakkimizda">Hakkımızda</NavItem>
                    <NavItem to="/findik-isleme">Fındık İşleme</NavItem>
                    <NavItem to="/hizmetlerimiz">Hizmetler</NavItem>
                    <NavItem to="/urunler">Ürünler</NavItem>
                    <NavItem to="/blog">Blog</NavItem>
                    <NavItem to="/iletisim">İletişim</NavItem>
                </nav>

                {/* Mobile hamburger */}
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="lg:hidden p-2 rounded-btn text-ink-2 hover:bg-paper-2 transition-colors"
                    aria-label="Menü"
                >
                    {isOpen ? (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    ) : (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                        </svg>
                    )}
                </button>
            </div>

            {/* Mobile menu */}
            {isOpen && (
                <nav className="lg:hidden border-t border-rule bg-surface">
                    <div className="container py-3 flex flex-col gap-1">
                        {[
                            ['/', 'Ana Sayfa'],
                            ['/hakkimizda', 'Hakkımızda'],
                            ['/findik-isleme', 'Fındık İşleme'],
                            ['/hizmetlerimiz', 'Hizmetler'],
                            ['/urunler', 'Ürünler'],
                            ['/blog', 'Blog'],
                            ['/iletisim', 'İletişim'],
                        ].map(([to, label]) => (
                            <NavLink
                                key={to}
                                to={to}
                                onClick={() => setIsOpen(false)}
                                className={({ isActive }) =>
                                    `px-4 py-2.5 rounded-btn text-sm font-medium transition-colors duration-150 ${
                                        isActive
                                            ? 'text-accent bg-accent-bg'
                                            : 'text-ink-2 hover:text-ink hover:bg-paper-2'
                                    }`
                                }
                            >
                                {label}
                            </NavLink>
                        ))}
                    </div>
                </nav>
            )}
        </header>
    );
};

export default Header;
