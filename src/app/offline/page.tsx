'use client'

export default function OfflinePage() {
  return (
    <html lang="es">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>Sin conexión - Espacio Desafíos</title>
        <style>{`
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
            background: #F8F7FF;
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 24px;
          }
          
          .container {
            text-align: center;
            max-width: 400px;
          }
          
          .logo {
            width: 80px;
            height: 80px;
            border-radius: 20px;
            margin: 0 auto 24px;
            box-shadow: 0 4px 20px rgba(163, 142, 195, 0.3);
          }
          
          .icon {
            width: 64px;
            height: 64px;
            margin: 0 auto 24px;
            color: #A38EC3;
          }
          
          h1 {
            color: #2D2A32;
            font-size: 24px;
            font-weight: 700;
            margin-bottom: 12px;
          }
          
          p {
            color: #6B6570;
            font-size: 16px;
            line-height: 1.5;
            margin-bottom: 32px;
          }
          
          button {
            background: #A38EC3;
            color: white;
            border: none;
            padding: 14px 32px;
            border-radius: 12px;
            font-size: 16px;
            font-weight: 600;
            cursor: pointer;
            transition: background 0.2s;
          }
          
          button:hover {
            background: #8A75AA;
          }
          
          button:active {
            background: #735BA0;
          }
        `}</style>
      </head>
      <body>
        <div className="container">
          <img 
            src="/logo.jpg" 
            alt="Espacio Desafíos" 
            className="logo"
          />
          
          <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="1" y1="1" x2="23" y2="23"></line>
            <path d="M16.72 11.06A10.94 10.94 0 0 1 19 12.55"></path>
            <path d="M5 12.55a10.94 10.94 0 0 1 5.17-2.39"></path>
            <path d="M10.71 5.05A16 16 0 0 1 22.58 9"></path>
            <path d="M1.42 9a15.91 15.91 0 0 1 4.7-2.88"></path>
            <path d="M8.53 16.11a6 6 0 0 1 6.95 0"></path>
            <line x1="12" y1="20" x2="12.01" y2="20"></line>
          </svg>
          
          <h1>Sin conexión a internet</h1>
          
          <p>
            Parece que no tienes conexión a internet. 
            Verifica tu conexión e intenta de nuevo.
          </p>
          
          <button onClick={() => window.location.reload()}>
            Reintentar
          </button>
        </div>
      </body>
    </html>
  )
}
