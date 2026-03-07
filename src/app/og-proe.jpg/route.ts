import { ImageResponse } from 'next/og'
import React from 'react'
export const runtime = 'edge'
export async function GET(req: Request) {
  const width = 1200
  const height = 630
  const url = new URL(req.url)
  const base = `${url.protocol}//${url.host}`
  const sweet = `${base}/images/sweetpotato.png`
  const rootStyle: React.CSSProperties = {
    width,
    height,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundImage: 'linear-gradient(135deg, #10B981 0%, #F59E0B 100%)',
    fontFamily: 'sans-serif',
    position: 'relative',
  }
  const overlay: React.CSSProperties = {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0,0,0,0.12)',
  }
  const row: React.CSSProperties = {
    width: '100%',
    height: '100%',
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '60px 80px',
  }
  const col: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: 20,
    color: '#fff',
  }
  const title: React.CSSProperties = { fontSize: 68, fontWeight: 800, lineHeight: 1.1 }
  const subtitle: React.CSSProperties = { fontSize: 36, fontWeight: 600 }
  const badgeRow: React.CSSProperties = { marginTop: 8, fontSize: 28, display: 'flex', alignItems: 'center', gap: 12 as any }
  const logo: React.CSSProperties = { marginTop: 40, fontSize: 26, fontWeight: 700, opacity: 0.9 }
  const imgWrap: React.CSSProperties = { position: 'relative', width: 420, height: 420, display: 'flex', alignItems: 'center', justifyContent: 'center' }
  const imgStyle: React.CSSProperties = { borderRadius: 24, boxShadow: '0 12px 60px rgba(0,0,0,0.25)', objectFit: 'cover' as any }
  return new ImageResponse(React.createElement(
    'div',
    { style: rootStyle },
    React.createElement('div', { style: overlay }),
    React.createElement(
      'div',
      { style: row },
      React.createElement(
        'div',
        { style: col },
        React.createElement('div', { style: title }, '𝐊𝐞𝐢𝐭𝐭𝐲 𝐎𝐥𝐢𝐯𝐞𝐢𝐫𝐚 𝐍𝐮𝐭𝐫𝐢'),
        React.createElement('div', { style: subtitle }, 'Método PROE - Dieta + Treino + Streaks'),
        React.createElement(
          'div',
          { style: badgeRow },
          React.createElement('div', { style: { fontSize: 42 } }, '💪'),
          React.createElement('div', null, 'Streaks em alta performance'),
        ),
        React.createElement('div', { style: logo }, 'PROE'),
      ),
      React.createElement(
        'div',
        { style: imgWrap },
        React.createElement('img', { src: sweet, width: 420, height: 420, style: imgStyle } as any),
      )
    )
  ), { width, height })
}
