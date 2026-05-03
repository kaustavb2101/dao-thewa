'use client';

import React, { useState, useRef, useCallback, DragEvent, ChangeEvent } from 'react';

// ─── Types ────────────────────────────────────────────────────────

interface ZoneReading {
  observationThai: string;
  score: number;
  quality: 'auspicious' | 'neutral' | 'challenging';
}

interface FaceReading {
  dominantElement: string;
  elementNameThai: string;
  elementSymbol: string;
  elementColor: string;
  overallScore: number;
  overallQualityThai: string;
  headline: string;
  summaryThai: string;
  faceShapeObservation: string;
  zones: {
    forehead: ZoneReading;
    brows:    ZoneReading;
    eyes:     ZoneReading;
    nose:     ZoneReading;
    mouth:    ZoneReading;
  };
  strengthsThai: string[];
  challengesThai: string[];
  luckyColorThai: string;
  luckyColorHex: string;
  luckyNumber: number;
  luckyDirectionThai: string;
  compatibleElementsThai: string[];
  careerAdviceThai: string;
  wealthAdviceThai: string;
  healthAdviceThai: string;
}

// ─── Styles (inline — no external CSS deps) ───────────────────────

const css = {
  page: {
    minHeight: '100vh',
    background: 'linear-gradient(160deg, #0A0B1E 0%, #111230 50%, #0A0B1E 100%)',
    padding: '24px 16px',
    boxSizing: 'border-box' as const,
  },
  container: {
    maxWidth: 680,
    margin: '0 auto',
  },
  header: {
    textAlign: 'center' as const,
    marginBottom: 32,
  },
  heroEmoji: { fontSize: 52, display: 'block', marginBottom: 8 },
  title: { fontSize: 32, fontWeight: 800, color: '#F5C842', letterSpacing: 3, margin: 0 },
  subtitle: { fontSize: 13, color: 'rgba(255,255,255,0.4)', marginTop: 6 },

  uploadZone: (dragging: boolean) => ({
    border: `2px dashed ${dragging ? '#F5C842' : 'rgba(245,200,66,0.3)'}`,
    borderRadius: 16,
    padding: '40px 20px',
    textAlign: 'center' as const,
    cursor: 'pointer',
    background: dragging ? 'rgba(245,200,66,0.05)' : 'rgba(255,255,255,0.02)',
    transition: 'all 0.2s',
    marginBottom: 16,
  }),
  uploadIcon: { fontSize: 40, marginBottom: 12 },
  uploadText: { color: 'rgba(255,255,255,0.6)', fontSize: 14, marginBottom: 8 },
  uploadHint: { color: 'rgba(255,255,255,0.3)', fontSize: 12 },

  previewWrap: {
    position: 'relative' as const,
    display: 'inline-block',
    marginBottom: 16,
  },
  preview: {
    maxWidth: '100%',
    maxHeight: 320,
    borderRadius: 12,
    border: '1px solid rgba(245,200,66,0.3)',
    display: 'block',
    margin: '0 auto',
  },
  clearBtn: {
    position: 'absolute' as const,
    top: 8,
    right: 8,
    background: 'rgba(0,0,0,0.6)',
    border: 'none',
    borderRadius: '50%',
    width: 28,
    height: 28,
    color: '#fff',
    cursor: 'pointer',
    fontSize: 14,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },

  analyzeBtn: (disabled: boolean) => ({
    width: '100%',
    padding: '14px 0',
    borderRadius: 24,
    border: '1px solid rgba(245,200,66,0.4)',
    background: disabled ? 'rgba(245,200,66,0.04)' : 'rgba(245,200,66,0.12)',
    color: disabled ? 'rgba(245,200,66,0.3)' : '#F5C842',
    fontSize: 16,
    fontWeight: 700,
    cursor: disabled ? 'not-allowed' : 'pointer',
    letterSpacing: 1,
    marginBottom: 24,
    transition: 'all 0.2s',
  }),

  resultHeader: (color: string) => ({
    border: `1px solid ${color}`,
    borderRadius: 16,
    padding: '24px 20px',
    textAlign: 'center' as const,
    background: `${color}10`,
    marginBottom: 16,
  }),
  elementSymbol: { fontSize: 52, display: 'block', marginBottom: 8 },
  resultHeadline: (color: string) => ({
    fontSize: 20,
    fontWeight: 700,
    color,
    marginBottom: 12,
  }),
  scoreRow: { display: 'flex', alignItems: 'baseline', justifyContent: 'center', gap: 6 },
  scoreNum: (score: number) => ({
    fontSize: 42,
    fontWeight: 800,
    color: score >= 70 ? '#4CAF50' : score >= 50 ? '#FFC107' : '#EF5350',
  }),
  scoreMax: { fontSize: 14, color: 'rgba(255,255,255,0.4)' },
  qualityBadge: (score: number) => ({
    fontSize: 14,
    fontWeight: 600,
    color: score >= 70 ? '#4CAF50' : score >= 50 ? '#FFC107' : '#EF5350',
    marginLeft: 8,
  }),

  card: {
    background: '#111230',
    border: '1px solid rgba(255,255,255,0.06)',
    borderRadius: 12,
    padding: '16px',
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.4)',
    letterSpacing: 2,
    textTransform: 'uppercase' as const,
    marginBottom: 12,
    margin: '0 0 12px 0',
  },

  summaryText: { fontSize: 14, color: 'rgba(255,255,255,0.7)', lineHeight: 1.7, margin: 0 },

  zonesGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
    gap: 10,
  },
  zoneCard: (quality: string) => ({
    background: 'rgba(255,255,255,0.02)',
    border: `1px solid ${quality === 'auspicious' ? 'rgba(76,175,80,0.3)' : quality === 'challenging' ? 'rgba(239,83,80,0.3)' : 'rgba(255,193,7,0.2)'}`,
    borderRadius: 10,
    padding: 12,
  }),
  zoneName: { fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.6)', marginBottom: 4 },
  zoneObs: { fontSize: 12, color: 'rgba(255,255,255,0.5)', lineHeight: 1.5 },
  zoneScore: (quality: string) => ({
    fontSize: 18,
    fontWeight: 700,
    color: quality === 'auspicious' ? '#4CAF50' : quality === 'challenging' ? '#EF5350' : '#FFC107',
    marginTop: 6,
  }),

  pillList: { display: 'flex', flexWrap: 'wrap' as const, gap: 8, padding: 0, margin: 0, listStyle: 'none' },
  pill: (bg: string, color: string) => ({
    padding: '4px 12px',
    borderRadius: 20,
    background: bg,
    color,
    fontSize: 12,
    fontWeight: 600,
  }),

  luckyGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 10, textAlign: 'center' as const },
  luckyItem: { display: 'flex', flexDirection: 'column' as const, alignItems: 'center', gap: 4 },
  luckyValue: { fontSize: 20, fontWeight: 700, color: '#F5C842' },
  luckyLabel: { fontSize: 10, color: 'rgba(255,255,255,0.4)' },
  luckyColorDot: (hex: string) => ({
    width: 24,
    height: 24,
    borderRadius: '50%',
    background: hex,
    border: '1px solid rgba(255,255,255,0.2)',
  }),

  adviceRow: { display: 'flex', flexDirection: 'column' as const, gap: 10 },
  adviceItem: { display: 'flex', gap: 10, alignItems: 'flex-start' },
  adviceEmoji: { fontSize: 18, flexShrink: 0, marginTop: 1 },
  adviceText: { fontSize: 13, color: 'rgba(255,255,255,0.65)', lineHeight: 1.6 },

  divider: {
    border: 'none',
    borderTop: '1px solid rgba(245,200,66,0.12)',
    margin: '20px 0',
  },

  resetBtn: {
    width: '100%',
    padding: '12px 0',
    borderRadius: 24,
    border: '1px solid rgba(255,255,255,0.1)',
    background: 'transparent',
    color: 'rgba(255,255,255,0.4)',
    fontSize: 14,
    cursor: 'pointer',
    marginTop: 8,
    marginBottom: 32,
  },

  loadingWrap: { textAlign: 'center' as const, padding: '48px 0' },
  spinner: {
    width: 40,
    height: 40,
    border: '3px solid rgba(245,200,66,0.15)',
    borderTop: '3px solid #F5C842',
    borderRadius: '50%',
    margin: '0 auto 16px',
    animation: 'spin 0.8s linear infinite',
  },
  loadingText: { color: 'rgba(255,255,255,0.5)', fontSize: 14 },

  errorBox: {
    background: 'rgba(239,83,80,0.1)',
    border: '1px solid rgba(239,83,80,0.3)',
    borderRadius: 10,
    padding: 14,
    color: '#EF5350',
    fontSize: 13,
    marginBottom: 16,
  },

  disclaimer: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.2)',
    textAlign: 'center' as const,
    marginTop: 24,
    lineHeight: 1.6,
  },
};

const ZONE_LABELS: Record<string, { name: string; symbol: string }> = {
  forehead: { name: 'หน้าผาก', symbol: '🔥' },
  brows:    { name: 'คิ้ว',    symbol: '🌿' },
  eyes:     { name: 'ตา',     symbol: '⚜️' },
  nose:     { name: 'จมูก',   symbol: '🌍' },
  mouth:    { name: 'ปาก/คาง', symbol: '💧' },
};

export default function Home() {
  const [dragging, setDragging]   = useState(false);
  const [preview, setPreview]     = useState<string | null>(null);
  const [imgBase64, setImgBase64] = useState<string | null>(null);
  const [mediaType, setMediaType] = useState<string>('image/jpeg');
  const [loading, setLoading]     = useState(false);
  const [reading, setReading]     = useState<FaceReading | null>(null);
  const [error, setError]         = useState<string | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);

  const loadFile = useCallback((file: File) => {
    if (!file.type.startsWith('image/')) {
      setError('กรุณาอัปโหลดไฟล์รูปภาพ (JPEG, PNG, WEBP)');
      return;
    }
    setMediaType(file.type);
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      setPreview(dataUrl);
      setImgBase64(dataUrl.split(',')[1]);
      setReading(null);
      setError(null);
    };
    reader.readAsDataURL(file);
  }, []);

  const handleDrop = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) loadFile(file);
  }, [loadFile]);

  const handleChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) loadFile(file);
  }, [loadFile]);

  const handleAnalyze = useCallback(async () => {
    if (!imgBase64) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageBase64: imgBase64, mediaType }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'วิเคราะห์ไม่สำเร็จ');
      setReading(data.reading);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'เกิดข้อผิดพลาด');
    } finally {
      setLoading(false);
    }
  }, [imgBase64, mediaType]);

  const handleReset = useCallback(() => {
    setPreview(null);
    setImgBase64(null);
    setReading(null);
    setError(null);
    if (inputRef.current) inputRef.current.value = '';
  }, []);

  return (
    <div style={css.page}>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <div style={css.container}>
        <div style={css.header}>
          <span style={css.heroEmoji}>🔮</span>
          <h1 style={css.title}>โหงวเฮ้ง</h1>
          <p style={css.subtitle}>Five Elements Face Reading · ดาวเทวา · Powered by Claude AI</p>
        </div>

        {!preview && (
          <div
            style={css.uploadZone(dragging)}
            onClick={() => inputRef.current?.click()}
            onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={handleDrop}
          >
            <div style={css.uploadIcon}>📷</div>
            <p style={css.uploadText}>คลิกหรือลากรูปภาพมาวางที่นี่</p>
            <p style={css.uploadHint}>JPEG · PNG · WEBP · สูงสุด 10 MB</p>
            <input
              ref={inputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              style={{ display: 'none' }}
              onChange={handleChange}
            />
          </div>
        )}

        {preview && (
          <div style={{ textAlign: 'center', marginBottom: 16 }}>
            <div style={css.previewWrap}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={preview} alt="face preview" style={css.preview} />
              <button style={css.clearBtn} onClick={handleReset} title="ลบรูป">✕</button>
            </div>
          </div>
        )}

        {error && <div style={css.errorBox}>⚠ {error}</div>}

        {preview && !reading && !loading && (
          <button
            style={css.analyzeBtn(!imgBase64)}
            onClick={handleAnalyze}
            disabled={!imgBase64}
          >
            🔮 วิเคราะห์โหงวเฮ้ง (AutoX)
          </button>
        )}

        {loading && (
          <div style={css.loadingWrap}>
            <div style={css.spinner} />
            <p style={css.loadingText}>AutoX กำลังวิเคราะห์ธาตุทั้ง 5...</p>
          </div>
        )}

        {reading && !loading && (
          <>
            <div style={css.resultHeader(reading.elementColor)}>
              <span style={css.elementSymbol}>{reading.elementSymbol}</span>
              <h2 style={css.resultHeadline(reading.elementColor)}>{reading.headline}</h2>
              <div style={css.scoreRow}>
                <span style={css.scoreNum(reading.overallScore)}>{reading.overallScore}</span>
                <span style={css.scoreMax}>/100</span>
                <span style={css.qualityBadge(reading.overallScore)}>{reading.overallQualityThai}</span>
              </div>
            </div>

            <div style={css.card}>
              <p style={css.cardTitle}>สรุปดวงชะตา</p>
              <p style={css.summaryText}>{reading.summaryThai}</p>
            </div>

            <div style={css.card}>
              <p style={css.cardTitle}>รูปทรงใบหน้า</p>
              <p style={css.summaryText}>{reading.faceShapeObservation}</p>
            </div>

            <hr style={css.divider} />

            <div style={css.card}>
              <p style={css.cardTitle}>ผลประเมิน 5 โซน</p>
              <div style={css.zonesGrid}>
                {(Object.entries(reading.zones) as [string, ZoneReading][]).map(([key, z]) => (
                  <div key={key} style={css.zoneCard(z.quality)}>
                    <div style={css.zoneName}>{ZONE_LABELS[key]?.symbol} {ZONE_LABELS[key]?.name}</div>
                    <div style={css.zoneObs}>{z.observationThai}</div>
                    <div style={css.zoneScore(z.quality)}>{z.score * 10}%</div>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 12 }}>
              <div style={{ ...css.card, marginBottom: 0, borderColor: 'rgba(76,175,80,0.3)' }}>
                <p style={{ ...css.cardTitle, color: '#4CAF50' }}>จุดแข็ง</p>
                <ul style={css.pillList}>
                  {reading.strengthsThai.map(s => (
                    <li key={s} style={css.pill('rgba(76,175,80,0.12)', '#4CAF50')}>✦ {s}</li>
                  ))}
                </ul>
              </div>
              <div style={{ ...css.card, marginBottom: 0, borderColor: 'rgba(255,193,7,0.3)' }}>
                <p style={{ ...css.cardTitle, color: '#FFC107' }}>ใส่ใจ</p>
                <ul style={css.pillList}>
                  {reading.challengesThai.map(c => (
                    <li key={c} style={css.pill('rgba(255,193,7,0.12)', '#FFC107')}>⚠ {c}</li>
                  ))}
                </ul>
              </div>
            </div>

            <div style={css.card}>
              <p style={css.cardTitle}>มงคล</p>
              <div style={css.luckyGrid}>
                <div style={css.luckyItem}>
                  <div style={css.luckyColorDot(reading.luckyColorHex)} />
                  <span style={css.luckyLabel}>{reading.luckyColorThai}</span>
                </div>
                <div style={css.luckyItem}>
                  <span style={css.luckyValue}>{reading.luckyNumber}</span>
                  <span style={css.luckyLabel}>เลขมงคล</span>
                </div>
                <div style={css.luckyItem}>
                  <span style={{ fontSize: 18 }}>🧭</span>
                  <span style={css.luckyLabel}>{reading.luckyDirectionThai}</span>
                </div>
                <div style={css.luckyItem}>
                  {reading.compatibleElementsThai.slice(0, 1).map(el => (
                    <span key={el} style={{ ...css.luckyValue, fontSize: 12 }}>{el}</span>
                  ))}
                  <span style={css.luckyLabel}>ธาตุเสริม</span>
                </div>
              </div>
            </div>

            <div style={css.card}>
              <p style={css.cardTitle}>คำแนะนำ</p>
              <div style={css.adviceRow}>
                <div style={css.adviceItem}>
                  <span style={css.adviceEmoji}>💼</span>
                  <span style={css.adviceText}>{reading.careerAdviceThai}</span>
                </div>
                <div style={css.adviceItem}>
                  <span style={css.adviceEmoji}>💰</span>
                  <span style={css.adviceText}>{reading.wealthAdviceThai}</span>
                </div>
                <div style={css.adviceItem}>
                  <span style={css.adviceEmoji}>🌿</span>
                  <span style={css.adviceText}>{reading.healthAdviceThai}</span>
                </div>
              </div>
            </div>

            <button style={css.resetBtn} onClick={handleReset}>🔄 วิเคราะห์ใหม่</button>
          </>
        )}

        <p style={css.disclaimer}>
          โหงวเฮ้งเป็นศาสตร์โบราณเพื่อการศึกษาและความบันเทิง<br />
          ผลการวิเคราะห์โดย Claude AI · ดาวเทวา © 2026
        </p>
      </div>
    </div>
  );
}
