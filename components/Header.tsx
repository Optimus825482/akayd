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
                        <span className="flex items-center gap-1.5">
                            <svg className="w-3.5 h-3.5 opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                            {contactContent.email}
                        </span>
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
