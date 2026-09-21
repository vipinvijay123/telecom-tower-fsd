import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Signal, Radio, Shield, ChevronRight, Wifi, Activity } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import './Landing.css';

const Landing = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoEnded, setVideoEnded] = useState(false);
  const [videoError, setVideoError] = useState(false);
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    // Auto-show content after 500ms if video errors or skipped
    const timer = setTimeout(() => {
      if (!videoRef.current || videoError) {
        setShowContent(true);
      }
    }, 600);
    return () => clearTimeout(timer);
  }, [videoError]);

  const handleVideoEnd = () => {
    setVideoEnded(true);
    setTimeout(() => setShowContent(true), 300);
  };

  const handleVideoError = () => {
    setVideoError(true);
    setShowContent(true);
  };

  const handleSkip = () => {
    if (videoRef.current) {
      videoRef.current.pause();
    }
    setVideoEnded(true);
    setShowContent(true);
  };

  return (
    <div className="landing">
      {/* ─── Intro Video ─────────────────────────────────────────────────────── */}
      {!videoError && (
        <div className={`video-container ${videoEnded ? 'fade-out' : ''}`}>
          <video
            ref={videoRef}
            className="intro-video"
            autoPlay
            muted
            playsInline
            onEnded={handleVideoEnd}
            onError={handleVideoError}
          >
            <source src="/videos/telecom-intro.mp4" type="video/mp4" />
          </video>

          {/* Skip button */}
          {!videoEnded && (
            <button className="skip-btn" onClick={handleSkip}>
              Skip Intro <ChevronRight size={14} />
            </button>
          )}
        </div>
      )}

      {/* ─── Landing Content ─────────────────────────────────────────────────── */}
      <div className={`landing-content grid-bg ${showContent ? 'visible' : ''}`}>
        {/* Animated background elements */}
        <div className="bg-glow bg-glow-1" />
        <div className="bg-glow bg-glow-2" />
        <div className="signal-rings">
          <div className="ring ring-1" />
          <div className="ring ring-2" />
          <div className="ring ring-3" />
        </div>

        {/* Header */}
        <header className="landing-header">
          <div className="landing-logo">
            <Signal size={22} color="var(--color-accent-blue)" />
            <span>TowerOps</span>
          </div>
          <div className="landing-header-right">
            <span className="header-live">
              <span className="live-dot" />
              LIVE MONITORING
            </span>
          </div>
        </header>

        {/* Hero */}
        <main className="landing-hero">
          <div className="hero-badge">
            <Wifi size={12} />
            TELECOM INFRASTRUCTURE MANAGEMENT
          </div>

          <h1 className="hero-title">
            Telecom Tower
            <span className="hero-title-accent"> Management</span>
            <br />
            System
          </h1>

          <p className="hero-description">
            Centralized monitoring of tower assets, power systems, batteries,
            site inspections, maintenance schedules, and outage reporting to
            ensure uninterrupted network services.
          </p>

          <div className="hero-stats">
            {[
              { icon: Radio, label: 'Tower Assets', value: 'Full Lifecycle' },
              { icon: Activity, label: 'Live Monitoring', value: '24/7 Ops Center' },
              { icon: Shield, label: 'Secure Access', value: 'Role-Based Auth' },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} className="hero-stat">
                <Icon size={18} color="var(--color-accent-blue)" />
                <div>
                  <div className="stat-value">{value}</div>
                  <div className="stat-label">{label}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="hero-cta">
            <button
              className="btn btn-primary btn-lg"
              onClick={() => navigate('/login')}
              id="get-started-btn"
            >
              Get Started
              <ChevronRight size={18} />
            </button>
            <p className="cta-note">Secure access • Role-based permissions</p>
          </div>
        </main>

        {/* Footer */}
        <footer className="landing-footer">
          <span>Telecom Tower Management System</span>
          <span className="footer-divider">|</span>
          <span>Operations Center</span>
        </footer>
      </div>
    </div>
  );
};

export default Landing;
