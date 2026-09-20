import React, { useState, useEffect, useRef } from "react";
import {
  MapPin, Palette, Mic, Volume2, CheckCircle2, Clock, Leaf,
  Star, Shield, ShieldCheck, BookOpen, Feather, Layers, User, Loader2,
  ChevronDown, ChevronUp, Play, Square, ArrowLeft, X
} from "lucide-react";
import { api, getMediaUrl } from "../lib/api-client";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface PassportData {
  id: string;
  passportId: string;
  productId: string;
  craftName: string;
  imageUrl: string | null;
  description: string | null;
  speciality: string | null;
  craftTradition: string | null;
  technique: string | null;
  originState: string | null;
  originCity: string | null;
  originRegion: string | null;
  materials: string[];
  artisanName: string | null;
  artisanId: string | null;
  artisanStoryOriginal: string | null;
  artisanStoryLang: string;
  artisanStoryTranslated: string | null;
  timeTaken: string | null;
  verificationStatus: "PENDING" | "VERIFIED" | "REJECTED";
  verifiedAt: string | null;
  createdAt: string;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function SectionHeader({ icon, title, subtitle }: { icon: React.ReactNode; title: string; subtitle?: string }) {
  return (
    <div className="flex items-start gap-3 mb-4">
      <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-[#FFF2C9] text-[#9C0000]">
        {icon}
      </div>
      <div>
        <p className="text-[10px] font-bold uppercase tracking-[.16em] text-[#A07F6A]">{title}</p>
        {subtitle && <p className="text-xs text-[#927568] mt-0.5">{subtitle}</p>}
      </div>
    </div>
  );
}

function VerificationBadge({ status }: { status: PassportData["verificationStatus"] }) {
  if (status === "VERIFIED") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-[#E3F3E8] px-3 py-1.5 text-xs font-semibold text-[#27724D]">
        <ShieldCheck size={12} />
        KalaSetu Verified
      </span>
    );
  }
  if (status === "PENDING") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-[#FBE8D9] px-3 py-1.5 text-xs font-semibold text-[#A6572B]">
        <Shield size={12} />
        Pending Verification
      </span>
    );
  }
  return null;
}

// ─── Voice Readback Validation (Artisan view) ─────────────────────────────────

function VoiceValidationPanel({
  productId,
  onVerified,
}: {
  productId: string;
  onVerified: () => void;
}) {
  const [step, setStep] = useState<"idle" | "loading" | "ready" | "speaking" | "confirmed" | "error">("idle");
  const [script, setScript] = useState<string>("");
  const [error, setError] = useState<string>("");
  const synthRef = useRef<SpeechSynthesisUtterance | null>(null);

  const fetchAndSpeak = async () => {
    setStep("loading");
    setError("");
    try {
      const data = await api.passport.getReadbackScript(productId);
      setScript(data.script);
      setStep("ready");
    } catch {
      setError("Could not load the readback script. Please try again.");
      setStep("error");
    }
  };

  const speakScript = () => {
    if (!script || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utter = new SpeechSynthesisUtterance(script);
    utter.lang = "en-IN";
    utter.rate = 0.9;
    utter.onstart = () => setStep("speaking");
    utter.onend = () => setStep("confirmed");
    utter.onerror = () => { setStep("ready"); };
    synthRef.current = utter;
    window.speechSynthesis.speak(utter);
  };

  const stopSpeaking = () => {
    window.speechSynthesis.cancel();
    setStep("ready");
  };

  const confirmPassport = async () => {
    try {
      await api.passport.verify(productId);
      onVerified();
    } catch {
      setError("Verification failed. Please try again.");
    }
  };

  return (
    <div className="mt-4 rounded-2xl border border-[#DEC987] bg-[#FFFAF0] p-4">
      <div className="flex items-center gap-2 mb-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#FFF2C9] text-[#9C0000]">
          <Mic size={15} />
        </div>
        <div>
          <p className="text-xs font-bold text-[#4C0000]">Voice Validation</p>
          <p className="text-[10px] text-[#927568]">Listen to your passport and confirm it is accurate</p>
        </div>
      </div>

      {step === "idle" && (
        <button
          onClick={fetchAndSpeak}
          className="gold-btn text-xs w-full justify-center py-2.5"
        >
          <Volume2 size={14} />
          Generate &amp; Read My Passport
        </button>
      )}

      {step === "loading" && (
        <div className="flex items-center justify-center gap-2 py-3 text-[#9C0000]">
          <Loader2 size={16} className="animate-spin" />
          <span className="text-xs">Preparing your passport readback…</span>
        </div>
      )}

      {step === "ready" && (
        <div className="space-y-3">
          <div className="rounded-xl border border-[#E3D7B8] bg-white p-3">
            <p className="text-[11px] leading-relaxed text-[#5D4534] italic">"{script}"</p>
          </div>
          <button onClick={speakScript} className="gold-btn text-xs w-full justify-center py-2.5">
            <Play size={14} />
            Play Readback Aloud
          </button>
        </div>
      )}

      {step === "speaking" && (
        <div className="space-y-3">
          <div className="flex items-center justify-center gap-2 py-2 text-[#9C0000]">
            {[1,2,3,4,5].map(i => (
              <div key={i} className="wave-bar" style={{ height: `${10 + i * 4}px`, animationDelay: `${i * 0.12}s` }} />
            ))}
          </div>
          <p className="text-center text-xs text-[#927568] italic">Reading your passport aloud…</p>
          <button onClick={stopSpeaking} className="small-btn w-full justify-center text-xs">
            <Square size={12} />
            Stop
          </button>
        </div>
      )}

      {(step === "confirmed" || step === "ready") && script && (
        <div className="mt-3 space-y-2">
          <p className="text-[11px] text-center text-[#5D4534]">Does this sound correct?</p>
          <div className="flex gap-2">
            <button
              onClick={confirmPassport}
              className="gold-btn flex-1 justify-center text-xs py-2"
            >
              <CheckCircle2 size={13} />
              Yes, This Is Correct
            </button>
            <button
              onClick={() => { setScript(""); setStep("idle"); }}
              className="small-btn flex-1 justify-center text-xs"
            >
              <X size={12} />
              Something's Off
            </button>
          </div>
        </div>
      )}

      {error && (
        <p className="mt-2 text-center text-[11px] text-red-600">{error}</p>
      )}
    </div>
  );
}

// ─── Main Passport Card ────────────────────────────────────────────────────────

export interface DigitalCraftPassportProps {
  productId: string;
  /** If true, shows the artisan voice-validation panel */
  showArtisanValidation?: boolean;
  onBack?: () => void;
}

export function DigitalCraftPassport({ productId, showArtisanValidation = false, onBack }: DigitalCraftPassportProps) {
  const [passport, setPassport] = useState<PassportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  const [showOriginalStory, setShowOriginalStory] = useState(false);

  const fetchPassport = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await api.passport.getForProduct(productId);
      setPassport(data.passport as PassportData);
    } catch (e: any) {
      setError(e.message || "Could not load passport");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPassport();
  }, [productId]);

  const toggle = (key: string) => setExpandedSection(prev => prev === key ? null : key);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <div className="ai-spinner" style={{ animation: "spin 1s linear infinite" }}>
          <Feather size={24} />
        </div>
        <p className="text-sm text-[#927568]">Loading Craft Passport…</p>
      </div>
    );
  }

  if (error || !passport) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-3">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#FBE8D9] text-[#A6572B]">
          <BookOpen size={26} />
        </div>
        <p className="text-sm font-semibold text-[#4C0000]">Passport not available</p>
        <p className="text-xs text-[#927568] text-center max-w-xs">{error || "This craft does not have a passport yet."}</p>
      </div>
    );
  }

  const imgUrl = getMediaUrl(passport.imageUrl);
  const isVerified = passport.verificationStatus === "VERIFIED";

  return (
    <div className="space-y-4 pb-8">
      {/* Back button */}
      {onBack && (
        <button onClick={onBack} className="small-btn">
          <ArrowLeft size={14} />
          Back
        </button>
      )}

      {/* ─── Hero card ──────────────────────────────────────────────────── */}
      <div className="relative overflow-hidden rounded-3xl border border-[#E9DDBA] bg-[#FFFDF8] shadow-[0_12px_40px_rgba(81,42,13,.07)]">
        {/* Decorative paisley bg */}
        <div className="absolute inset-0 paisley-bg opacity-[0.035] pointer-events-none" />

        {/* Product image */}
        {imgUrl ? (
          <div className="relative h-52 w-full overflow-hidden">
            <img src={imgUrl} alt={passport.craftName} className="h-full w-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#4C0000]/60 to-transparent" />
            <div className="absolute bottom-4 left-4 right-4">
              <h2 className="font-serif text-xl font-semibold text-white leading-tight">{passport.craftName}</h2>
              {passport.craftTradition && (
                <p className="text-xs text-[#FFE7A6] mt-1">{passport.craftTradition}</p>
              )}
            </div>
          </div>
        ) : (
          <div className="flex h-40 items-center justify-center bg-gradient-to-br from-[#FFF8DF] to-[#FFF2C9]">
            <Palette size={48} className="text-[#D4AF37] opacity-30" />
          </div>
        )}

        <div className="p-5">
          {/* Passport ID + badge */}
          <div className="flex items-center justify-between flex-wrap gap-2 mb-4">
            <div>
              <p className="text-[9px] font-bold uppercase tracking-[.2em] text-[#A07F6A]">Passport ID</p>
              <p className="font-mono text-sm font-bold text-[#4C0000]">{passport.passportId}</p>
            </div>
            <VerificationBadge status={passport.verificationStatus} />
          </div>

          {/* Location pill */}
          {(passport.originCity || passport.originState) && (
            <div className="mb-4 inline-flex items-center gap-1.5 rounded-full border border-[#DEC987] bg-[#FFF8DF] px-3 py-1.5">
              <MapPin size={11} className="text-[#9C0000]" />
              <span className="text-xs font-semibold text-[#745A18]">
                {[passport.originCity, passport.originState].filter(Boolean).join(", ")}
              </span>
            </div>
          )}

          {/* Description */}
          {passport.description && (
            <p className="text-sm leading-relaxed text-[#5D4534]">{passport.description}</p>
          )}
        </div>
      </div>

      {/* ─── Section 1: About This Craft ────────────────────────────────── */}
      <div className="soft-card overflow-hidden">
        <button
          onClick={() => toggle("about")}
          className="flex w-full items-center justify-between p-5 text-left"
        >
          <SectionHeader icon={<BookOpen size={16} />} title="About This Craft" />
          {expandedSection === "about" ? <ChevronUp size={16} className="text-[#9C0000] flex-shrink-0" /> : <ChevronDown size={16} className="text-[#A07F6A] flex-shrink-0" />}
        </button>
        {expandedSection === "about" && (
          <div className="border-t border-[#F0E8D0] px-5 pb-5 space-y-3">
            {passport.craftTradition && (
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-[#A07F6A]">Craft Tradition</p>
                <p className="mt-1 text-sm text-[#4C0000] font-medium">{passport.craftTradition}</p>
              </div>
            )}
            {passport.technique && (
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-[#A07F6A]">Technique</p>
                <p className="mt-1 text-sm text-[#5D4534]">{passport.technique}</p>
              </div>
            )}
            {passport.timeTaken && (
              <div className="flex items-center gap-2 rounded-xl bg-[#FFF8DF] px-3 py-2.5">
                <Clock size={13} className="text-[#9C0000]" />
                <p className="text-xs text-[#745A18]">{passport.timeTaken}</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ─── Section 2: What Makes It Special ───────────────────────────── */}
      {passport.speciality && (
        <div className="soft-card overflow-hidden">
          <button
            onClick={() => toggle("speciality")}
            className="flex w-full items-center justify-between p-5 text-left"
          >
            <SectionHeader icon={<Star size={16} />} title="What Makes It Special" />
            {expandedSection === "speciality" ? <ChevronUp size={16} className="text-[#9C0000] flex-shrink-0" /> : <ChevronDown size={16} className="text-[#A07F6A] flex-shrink-0" />}
          </button>
          {expandedSection === "speciality" && (
            <div className="border-t border-[#F0E8D0] px-5 pb-5">
              <p className="text-sm leading-relaxed text-[#5D4534]">{passport.speciality}</p>
            </div>
          )}
        </div>
      )}

      {/* ─── Section 3: Craft Origin & Tradition ────────────────────────── */}
      <div className="soft-card overflow-hidden">
        <button
          onClick={() => toggle("origin")}
          className="flex w-full items-center justify-between p-5 text-left"
        >
          <SectionHeader icon={<MapPin size={16} />} title="Craft Origin & Tradition" />
          {expandedSection === "origin" ? <ChevronUp size={16} className="text-[#9C0000] flex-shrink-0" /> : <ChevronDown size={16} className="text-[#A07F6A] flex-shrink-0" />}
        </button>
        {expandedSection === "origin" && (
          <div className="border-t border-[#F0E8D0] px-5 pb-5 space-y-3">
            <div className="grid grid-cols-2 gap-3">
              {passport.originCity && (
                <div className="rounded-xl bg-[#FFF8DF] p-3">
                  <p className="text-[9px] uppercase tracking-widest font-bold text-[#A07F6A]">City / Region</p>
                  <p className="mt-1 text-sm font-semibold text-[#4C0000]">{passport.originCity}</p>
                </div>
              )}
              {passport.originState && (
                <div className="rounded-xl bg-[#FFF8DF] p-3">
                  <p className="text-[9px] uppercase tracking-widest font-bold text-[#A07F6A]">State</p>
                  <p className="mt-1 text-sm font-semibold text-[#4C0000]">{passport.originState}</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ─── Section 4: Artisan Story ────────────────────────────────────── */}
      {(passport.artisanStoryTranslated || passport.artisanStoryOriginal) && (
        <div className="soft-card overflow-hidden">
          <button
            onClick={() => toggle("story")}
            className="flex w-full items-center justify-between p-5 text-left"
          >
            <SectionHeader icon={<Feather size={16} />} title="Artisan Story" subtitle={passport.artisanName ?? undefined} />
            {expandedSection === "story" ? <ChevronUp size={16} className="text-[#9C0000] flex-shrink-0" /> : <ChevronDown size={16} className="text-[#A07F6A] flex-shrink-0" />}
          </button>
          {expandedSection === "story" && (
            <div className="border-t border-[#F0E8D0] px-5 pb-5 space-y-3">
              {/* Artisan name */}
              {passport.artisanName && (
                <div className="flex items-center gap-2">
                  <div className="avatar text-[11px]">{passport.artisanName.slice(0, 2).toUpperCase()}</div>
                  <div>
                    <p className="text-sm font-semibold text-[#4C0000]">{passport.artisanName}</p>
                    <p className="text-[10px] text-[#A07F6A]">{passport.craftTradition ?? "Artisan"}</p>
                  </div>
                </div>
              )}

              {/* English story */}
              {passport.artisanStoryTranslated && (
                <blockquote className="border-l-2 border-[#D4AF37] pl-4">
                  <p className="text-sm leading-relaxed text-[#5D4534] italic">"{passport.artisanStoryTranslated}"</p>
                </blockquote>
              )}

              {/* Original language toggle */}
              {passport.artisanStoryOriginal && passport.artisanStoryOriginal !== passport.artisanStoryTranslated && (
                <button
                  onClick={() => setShowOriginalStory(prev => !prev)}
                  className="small-btn text-[10px]"
                >
                  {showOriginalStory ? "Hide original" : `Show original (${passport.artisanStoryLang.toUpperCase()})`}
                </button>
              )}
              {showOriginalStory && passport.artisanStoryOriginal && (
                <p className="text-xs leading-relaxed text-[#765C51] bg-[#FFF8DF] rounded-xl p-3">{passport.artisanStoryOriginal}</p>
              )}
            </div>
          )}
        </div>
      )}

      {/* ─── Section 5: Craft Details ────────────────────────────────────── */}
      <div className="soft-card overflow-hidden">
        <button
          onClick={() => toggle("details")}
          className="flex w-full items-center justify-between p-5 text-left"
        >
          <SectionHeader icon={<Layers size={16} />} title="Craft Details" />
          {expandedSection === "details" ? <ChevronUp size={16} className="text-[#9C0000] flex-shrink-0" /> : <ChevronDown size={16} className="text-[#A07F6A] flex-shrink-0" />}
        </button>
        {expandedSection === "details" && (
          <div className="border-t border-[#F0E8D0] px-5 pb-5 space-y-3">
            {passport.materials.length > 0 && (
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-[#A07F6A] mb-2">Materials Used</p>
                <div className="flex flex-wrap gap-2">
                  {passport.materials.map((m, i) => (
                    <span key={i} className="tag">
                      <Leaf size={10} className="inline mr-1 text-[#5C7A3E]" />
                      {m}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {passport.artisanId && (
              <div className="flex items-center gap-2 rounded-xl bg-[#FFF8DF] px-3 py-2.5">
                <User size={13} className="text-[#9C0000]" />
                <div>
                  <p className="text-[9px] uppercase tracking-widest font-bold text-[#A07F6A]">Artisan ID</p>
                  <p className="font-mono text-xs text-[#4C0000]">{passport.artisanId}</p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ─── Artisan Voice Validation (shown only in artisan view) ──────── */}
      {showArtisanValidation && !isVerified && (
        <VoiceValidationPanel
          productId={productId}
          onVerified={fetchPassport}
        />
      )}

      {/* ─── Verification footer ─────────────────────────────────────────── */}
      <div className="rounded-2xl border border-[#E9DDBA] bg-[#FFFDF8] p-4 flex items-center gap-3">
        {isVerified ? (
          <>
            <ShieldCheck size={20} className="text-[#27724D] flex-shrink-0" />
            <div>
              <p className="text-xs font-bold text-[#27724D]">KalaSetu Verified Craft</p>
              <p className="text-[10px] text-[#5D8B6C]">Artisan identity and craft origin confirmed</p>
            </div>
          </>
        ) : (
          <>
            <Shield size={20} className="text-[#A6572B] flex-shrink-0" />
            <div>
              <p className="text-xs font-bold text-[#A6572B]">Awaiting Artisan Confirmation</p>
              <p className="text-[10px] text-[#927568]">This passport is pending voice validation by the artisan</p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ─── Passport List Card (for product grid in artisan dashboard) ───────────────

export function PassportListCard({ passport, onClick }: { passport: PassportData; onClick?: () => void }) {
  const imgUrl = getMediaUrl(passport.imageUrl);
  return (
    <button
      onClick={onClick}
      className="market-row flex-col items-start text-left w-full"
    >
      <div className="flex items-center gap-3 w-full">
        {imgUrl ? (
          <img src={imgUrl} alt={passport.craftName} className="h-12 w-12 rounded-xl object-cover flex-shrink-0" />
        ) : (
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#FFF2C9] text-[#9C0000] flex-shrink-0">
            <Palette size={20} />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-[#4C0000] truncate">{passport.craftName}</p>
          {passport.craftTradition && <p className="text-[10px] text-[#A07F6A] truncate">{passport.craftTradition}</p>}
        </div>
        <VerificationBadge status={passport.verificationStatus} />
      </div>
      <p className="font-mono text-[10px] text-[#927568] mt-1">{passport.passportId}</p>
    </button>
  );
}
