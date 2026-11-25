import { ENGINE_SCRIPT } from "./engineCode.js";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Requested-With",
  "Access-Control-Max-Age": "86400"
};

const THEMES = {
  white: {
    id: "white",
    name: "Pure White Laser",
    description: "Master Silicon-Valley pure white laser beam for all black/dark theme platforms",
    coreDark: "#FFFFFF",
    coreLight: "#18181B",
    glowDark: "rgba(255, 255, 255, 0.95)",
    glowLight: "rgba(24, 24, 27, 0.85)",
    secondaryDark: "rgba(255, 255, 255, 0.85)",
    rgbDark: "255, 255, 255",
    sparks: ["#FFFFFF", "#FAFAFA", "#F4F4F5", "#E4E4E7"]
  },
  monochrome: {
    id: "monochrome",
    name: "Architectural Monochrome",
    description: "Minimalist pure white and zinc architectural HUD line",
    coreDark: "#FFFFFF",
    coreLight: "#18181B",
    glowDark: "rgba(255, 255, 255, 0.95)",
    glowLight: "rgba(24, 24, 27, 0.85)",
    secondaryDark: "rgba(255, 255, 255, 0.85)",
    rgbDark: "255, 255, 255",
    sparks: ["#FFFFFF", "#FAFAFA", "#F4F4F5", "#E4E4E7"]
  },
  engineering: {
    id: "engineering",
    name: "Engineering Mint",
    description: "ZenVQ core engineering mint with crisp precision targeting",
    coreDark: "#FFFFFF",
    coreLight: "#0F766E",
    glowDark: "#6FFFE9",
    glowLight: "rgba(15, 118, 110, 0.9)",
    secondaryDark: "#A5FFEF",
    rgbDark: "111, 255, 233",
    sparks: ["#6FFFE9", "#A5FFEF", "#FFFFFF"]
  },
  creative: {
    id: "creative",
    name: "Creative Purple",
    description: "Creative Studio aesthetic with deep violet bloom and photon bursts",
    coreDark: "#FAF5FF",
    coreLight: "#7C3AED",
    glowDark: "#A855F7",
    glowLight: "rgba(124, 58, 237, 0.9)",
    secondaryDark: "#C084FC",
    rgbDark: "168, 85, 247",
    sparks: ["#A855F7", "#C084FC", "#FFFFFF"]
  },
  luxury: {
    id: "luxury",
    name: "Luxury Gold",
    description: "High-ticket executive gold with warm amber shockwaves",
    coreDark: "#FFFBEB",
    coreLight: "#B45309",
    glowDark: "#F59E0B",
    glowLight: "rgba(180, 83, 9, 0.9)",
    secondaryDark: "#FDE68A",
    rgbDark: "245, 158, 11",
    sparks: ["#F59E0B", "#FDE68A", "#FFFFFF"]
  },
  cyberpunk: {
    id: "cyberpunk",
    name: "Cyber Neon",
    description: "Futuristic neon pink and emerald cyber bloom",
    coreDark: "#FDF4FF",
    coreLight: "#BE185D",
    glowDark: "#EC4899",
    glowLight: "rgba(190, 24, 93, 0.9)",
    secondaryDark: "#F472B6",
    rgbDark: "236, 72, 153",
    sparks: ["#EC4899", "#00E599", "#FFFFFF"]
  },
  clinical: {
    id: "clinical",
    name: "Clinical Dental Mint",
    description: "Medical-grade sterile clinical mint and emerald glow for dental platforms",
    coreDark: "#FFFFFF",
    coreLight: "#15803D",
    glowDark: "#22C55E",
    glowLight: "#16A34A",
    secondaryDark: "#86EFAC",
    rgbDark: "34, 197, 94",
    sparks: ["#22C55E", "#86EFAC", "#FFFFFF", "#4ADE80"]
  },
  botanical: {
    id: "botanical",
    name: "Botanical Cyan and White",
    description: "Pure crisp cyan on light surfaces and pure white laser on dark surfaces",
    coreDark: "#FFFFFF",
    coreLight: "#0891B2",
    glowDark: "#FFFFFF",
    glowLight: "#06B6D4",
    secondaryDark: "rgba(255, 255, 255, 0.8)",
    rgbDark: "255, 255, 255",
    sparks: ["#06B6D4", "#0891B2", "#22D3EE", "#FFFFFF"]
  },
  motion: {
    id: "motion",
    name: "Kinetic Motion Emerald",
    description: "White-hot core with electric mint in dark mode and deep emerald in light mode",
    coreDark: "#FFFFFF",
    coreLight: "#006B47",
    glowDark: "#00E599",
    glowLight: "#00B377",
    secondaryDark: "#00D2B4",
    rgbDark: "0, 229, 153",
    sparks: ["#00E599", "#00D2B4", "#FFFFFF", "#006B47"]
  }
};

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const pathname = url.pathname;

    // Handle CORS preflight
    if (request.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: CORS_HEADERS
      });
    }

    // Route 1: Deliver Edge Laser Script (GET /v1/laser.js or /laser.js)
    if (pathname === "/v1/laser.js" || pathname === "/laser.js" || pathname === "/v1/bundle.js") {
      const theme = url.searchParams.get("theme");
      const sparks = url.searchParams.get("sparks");
      const shockwaves = url.searchParams.get("shockwaves");
      const reticle = url.searchParams.get("reticle");
      const ribbon = url.searchParams.get("ribbon");
      const bloom = url.searchParams.get("bloom");
      const autoInit = url.searchParams.get("autoInit");

      let scriptBody = ENGINE_SCRIPT;

      // If custom query parameters or autoInit are provided, append dynamic initialization snippet
      const hasCustomParams = theme || sparks !== null || shockwaves !== null || reticle !== null || ribbon !== null || bloom || autoInit === "true";

      if (hasCustomParams) {
        const configObject = {};
        if (theme) configObject.theme = theme;
        if (sparks !== null) configObject.sparksEnabled = sparks !== "false";
        if (shockwaves !== null) configObject.shockwavesEnabled = shockwaves !== "false";
        if (reticle !== null) configObject.reticleEnabled = reticle !== "false";
        if (ribbon !== null) configObject.ribbonEnabled = ribbon !== "false";
        if (bloom) configObject.bloomIntensity = parseFloat(bloom) || 1.0;

        scriptBody += `\n/* Dynamically Appended Edge Configuration */
(function() {
  if (typeof window !== "undefined") {
    var opts = ${JSON.stringify(configObject)};
    function boot() {
      if (window.ZenVQLaser) {
        window.ZenVQLaser.init(opts);
      }
    }
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", boot);
    } else {
      boot();
    }
  }
})();\n`;
      }

      return new Response(scriptBody, {
        headers: {
          ...CORS_HEADERS,
          "Content-Type": "application/javascript; charset=utf-8",
          "Cache-Control": "public, max-age=86400, s-maxage=604800, stale-while-revalidate=86400",
          "Vary": "Accept-Encoding"
        }
      });
    }

    // Route 2: Presets Discovery API (GET /v1/presets)
    if (pathname === "/v1/presets") {
      return new Response(
        JSON.stringify({
          success: true,
          count: Object.keys(THEMES).length,
          presets: THEMES
        }, null, 2),
        {
          headers: {
            ...CORS_HEADERS,
            "Content-Type": "application/json; charset=utf-8",
            "Cache-Control": "public, max-age=3600"
          }
        }
      );
    }

    // Route 3: Config Schema API (GET /v1/config)
    if (pathname === "/v1/config") {
      return new Response(
        JSON.stringify({
          version: "2.0.0",
          defaults: {
            theme: "white",
            maxHistory: 24,
            sparksEnabled: true,
            shockwavesEnabled: true,
            reticleEnabled: true,
            ribbonEnabled: true,
            bloomIntensity: 1.0,
            zIndex: 999999,
            autoStyleInjection: true
          },
          supportedThemes: Object.keys(THEMES),
          cdnUrls: {
            script: "https://laser-api.zenvq.com/v1/laser.js",
            presets: "https://laser-api.zenvq.com/v1/presets"
          }
        }, null, 2),
        {
          headers: {
            ...CORS_HEADERS,
            "Content-Type": "application/json; charset=utf-8",
            "Cache-Control": "public, max-age=3600"
          }
        }
      );
    }

    // Route 4: Health Check (GET /health)
    if (pathname === "/health") {
      return new Response(
        JSON.stringify({
          status: "healthy",
          service: "ZenVQ Universal Laser Cursor Edge API",
          version: "2.0.0",
          timestamp: new Date().toISOString(),
          edgeRuntime: "Cloudflare Workers",
          sla: "99.99% Uptime"
        }, null, 2),
        {
          headers: {
            ...CORS_HEADERS,
            "Content-Type": "application/json; charset=utf-8"
          }
        }
      );
    }

    // Route 5: Interactive Visual Demo Playground (GET / or GET /demo)
    return new Response(getDemoHtml(), {
      headers: {
        ...CORS_HEADERS,
        "Content-Type": "text/html; charset=utf-8",
        "Cache-Control": "public, max-age=3600"
      }
    });
  }
};

function getDemoHtml() {
  return `<!DOCTYPE html>
<html lang="en" class="dark">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>ZenVQ Universal Laser Cursor | Silicon-Valley Edge API</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;700&display=swap" rel="stylesheet">
  <script src="https://cdn.tailwindcss.com"></script>
  <script>
    tailwind.config = {
      darkMode: 'class',
      theme: {
        extend: {
          fontFamily: {
            sans: ['"Plus Jakarta Sans"', 'sans-serif'],
            mono: ['"JetBrains Mono"', 'monospace']
          },
          colors: {
            canvas: '#09090B',
            surface: 'rgba(24, 24, 27, 0.65)',
            mint: '#6FFFE9',
            volt: '#00E599'
          }
        }
      }
    }
  </script>
  <style>
    body {
      background-color: #09090B;
      color: #FAFAFA;
      font-family: 'Plus Jakarta Sans', sans-serif;
      overflow-x: hidden;
    }
    .specular-highlight {
      background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
      height: 1px;
      width: 100%;
    }
    .grid-canvas {
      background-size: 32px 32px;
      background-image: 
        linear-gradient(to right, rgba(255, 255, 255, 0.03) 1px, transparent 1px),
        linear-gradient(to bottom, rgba(255, 255, 255, 0.03) 1px, transparent 1px);
    }
  </style>
  <!-- Load the Edge Laser Script -->
  <script src="/v1/laser.js" data-auto-laser="true" data-theme="engineering" defer></script>
</head>
<body class="min-h-screen grid-canvas relative flex flex-col justify-between selection:bg-[#00E599]/20 selection:text-white">

  <!-- Header -->
  <header class="w-full border-b border-white/[0.08] bg-zinc-950/70 backdrop-blur-xl sticky top-0 z-50">
    <div class="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
      <div class="flex items-center gap-3">
        <div class="h-8 w-8 rounded-lg bg-zinc-900 border border-white/10 flex items-center justify-center text-[#6FFFE9] font-mono text-xs font-bold shadow-[0_0_15px_rgba(111,255,233,0.3)]">
          ZV
        </div>
        <div>
          <span class="font-bold tracking-tight text-white text-base">ZenVQ</span>
          <span class="text-xs font-mono text-zinc-400 ml-1.5 px-2 py-0.5 rounded-full border border-white/[0.08] bg-zinc-900">LASER-API v2.0</span>
        </div>
      </div>
      <div class="flex items-center gap-4">
        <a href="#integration" class="text-xs font-mono uppercase tracking-wider text-zinc-400 hover:text-white transition-colors">Integration Guide</a>
        <a href="/v1/presets" target="_blank" class="text-xs font-mono uppercase tracking-wider text-[#6FFFE9] hover:underline">API Presets &rarr;</a>
      </div>
    </div>
  </header>

  <!-- Hero Section -->
  <main class="max-w-7xl mx-auto px-6 py-16 flex-1 flex flex-col items-center text-center">
    
    <div class="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-white/10 bg-zinc-900/80 backdrop-blur-md mb-8">
      <span class="h-2 w-2 rounded-full bg-[#00E599] animate-pulse"></span>
      <span class="text-xs font-mono uppercase tracking-wider text-zinc-300">Universal Silicon-Valley Laser Engine</span>
    </div>

    <h1 class="text-4xl sm:text-6xl font-bold tracking-tight text-white max-w-4xl leading-[1.12]">
      Precision Laser Beam & Micro-Sparks. <br>
      <span class="text-transparent bg-clip-text bg-gradient-to-r from-[#6FFFE9] via-white to-[#A855F7]">1 Single Script for Any Website.</span>
    </h1>

    <p class="mt-6 text-base sm:text-lg text-zinc-400 max-w-2xl leading-relaxed">
      Imported directly from ZenVQ Agency. 60-120fps hardware-accelerated canvas ribbon trailing, energetic photon micro-sparks, shockwaves and rotating HUD targeting reticle.
    </p>

    <!-- Theme Switcher Controls -->
    <div class="mt-10 p-2 rounded-2xl border border-white/[0.08] bg-zinc-900/60 backdrop-blur-xl flex flex-wrap gap-2 justify-center shadow-2xl">
      <button onclick="setLaserTheme('engineering')" class="px-4 py-2 rounded-xl text-xs font-mono uppercase tracking-wider transition-all border border-transparent hover:border-[#6FFFE9]/40 bg-zinc-800/80 text-[#6FFFE9]">
        ⚡ Engineering Mint
      </button>
      <button onclick="setLaserTheme('creative')" class="px-4 py-2 rounded-xl text-xs font-mono uppercase tracking-wider transition-all border border-transparent hover:border-[#A855F7]/40 bg-zinc-800/80 text-[#A855F7]">
        🔮 Creative Purple
      </button>
      <button onclick="setLaserTheme('luxury')" class="px-4 py-2 rounded-xl text-xs font-mono uppercase tracking-wider transition-all border border-transparent hover:border-[#F59E0B]/40 bg-zinc-800/80 text-[#F59E0B]">
        👑 Luxury Gold
      </button>
      <button onclick="setLaserTheme('cyberpunk')" class="px-4 py-2 rounded-xl text-xs font-mono uppercase tracking-wider transition-all border border-transparent hover:border-[#EC4899]/40 bg-zinc-800/80 text-[#EC4899]">
        🌸 Cyber Neon
      </button>
      <button onclick="setLaserTheme('monochrome')" class="px-4 py-2 rounded-xl text-xs font-mono uppercase tracking-wider transition-all border border-transparent hover:border-white/40 bg-zinc-800/80 text-zinc-200">
        🏛️ Architectural White
      </button>
    </div>

    <!-- Action Triggers -->
    <div class="mt-6 flex flex-wrap gap-3 justify-center">
      <button onclick="triggerLaserBurst()" class="px-5 py-2.5 rounded-xl text-xs font-mono font-medium tracking-wider bg-white/[0.06] hover:bg-white/[0.12] border border-white/10 text-white transition-all active:scale-95">
        💥 Test Spark Burst
      </button>
      <button onclick="triggerLaserPulse()" class="px-5 py-2.5 rounded-xl text-xs font-mono font-medium tracking-wider bg-white/[0.06] hover:bg-white/[0.12] border border-white/10 text-white transition-all active:scale-95">
        🌊 Test Shockwave Pulse
      </button>
    </div>

    <!-- Interactive Cards Grid to test HUD reticle -->
    <div class="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6 w-full text-left">
      
      <!-- Card 1 -->
      <div class="relative rounded-2xl border border-white/[0.08] bg-zinc-900/65 backdrop-blur-xl p-6 transition-all duration-300 hover:border-[#6FFFE9]/50 hover:-translate-y-1 group" data-laser-theme="engineering">
        <div class="specular-highlight mb-4"></div>
        <div class="flex items-center justify-between mb-3">
          <span class="text-xs font-mono text-[#6FFFE9]">[01] ENGINEERING</span>
          <span class="text-xs font-mono text-zinc-500">60-120 FPS</span>
        </div>
        <h3 class="text-lg font-semibold text-white mb-2 group-hover:text-[#6FFFE9] transition-colors">Silicon-Valley Ribbon Trail</h3>
        <p class="text-xs text-zinc-400 leading-relaxed mb-4">
          Double-pass canvas rendering with hot laser filament core and outer bloom blur. Automatically lerps reticle brackets on hover.
        </p>
        <button class="px-4 py-2 rounded-lg text-xs font-mono bg-white/[0.05] border border-white/10 hover:border-[#6FFFE9] text-zinc-200 hover:text-white transition-all">
          Interactive Target &rarr;
        </button>
      </div>

      <!-- Card 2 -->
      <div class="relative rounded-2xl border border-white/[0.08] bg-zinc-900/65 backdrop-blur-xl p-6 transition-all duration-300 hover:border-[#A855F7]/50 hover:-translate-y-1 group" data-laser-theme="creative">
        <div class="specular-highlight mb-4"></div>
        <div class="flex items-center justify-between mb-3">
          <span class="text-xs font-mono text-[#A855F7]">[02] CREATIVE</span>
          <span class="text-xs font-mono text-zinc-500">PHOTON SPARKS</span>
        </div>
        <h3 class="text-lg font-semibold text-white mb-2 group-hover:text-[#A855F7] transition-colors">Adaptive Contextual Themes</h3>
        <p class="text-xs text-zinc-400 leading-relaxed mb-4">
          Hover over elements marked with data-laser-theme="creative" and watch the laser dynamically shift colors smoothly on the fly.
        </p>
        <button class="px-4 py-2 rounded-lg text-xs font-mono bg-white/[0.05] border border-white/10 hover:border-[#A855F7] text-zinc-200 hover:text-white transition-all">
          Creative Target &rarr;
        </button>
      </div>

      <!-- Card 3 -->
      <div class="relative rounded-2xl border border-white/[0.08] bg-zinc-900/65 backdrop-blur-xl p-6 transition-all duration-300 hover:border-[#F59E0B]/50 hover:-translate-y-1 group" data-laser-theme="luxury">
        <div class="specular-highlight mb-4"></div>
        <div class="flex items-center justify-between mb-3">
          <span class="text-xs font-mono text-[#F59E0B]">[03] LUXURY GOLD</span>
          <span class="text-xs font-mono text-zinc-500">ZERO LATENCY</span>
        </div>
        <h3 class="text-lg font-semibold text-white mb-2 group-hover:text-[#F59E0B] transition-colors">Zero Dependencies & Safe</h3>
        <p class="text-xs text-zinc-400 leading-relaxed mb-4">
          Gracefully suppresses native cursor, preserves text I-beam on inputs and auto-disables on coarse touchscreen pointers.
        </p>
        <button class="px-4 py-2 rounded-lg text-xs font-mono bg-white/[0.05] border border-white/10 hover:border-[#F59E0B] text-zinc-200 hover:text-white transition-all">
          Luxury Target &rarr;
        </button>
      </div>

    </div>

    <!-- Integration Code Section -->
    <div id="integration" class="mt-20 w-full text-left">
      <div class="flex items-center gap-2 mb-4">
        <span class="text-xs font-mono uppercase tracking-wider text-[#6FFFE9]">[DEPLOYMENT MATRIX]</span>
        <h2 class="text-2xl font-bold text-white">1-Call Integration Across Any Website</h2>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        
        <!-- Option A: HTML Script Tag -->
        <div class="rounded-2xl border border-white/[0.08] bg-zinc-900/60 p-6 backdrop-blur-xl">
          <h4 class="text-sm font-semibold text-white mb-2 flex items-center justify-between">
            <span>Any HTML / Webflow / Shopify / WordPress</span>
            <span class="text-xs font-mono text-[#6FFFE9]">1 SCRIPT TAG</span>
          </h4>
          <p class="text-xs text-zinc-400 mb-4">Drop this single line before the closing &lt;/body&gt; tag:</p>
          <pre class="p-4 rounded-xl bg-zinc-950 border border-white/[0.06] text-xs font-mono text-zinc-300 overflow-x-auto"><code>&lt;!-- ZenVQ Precision Laser Effect Edge Loader --&gt;
&lt;script
  src="https://laser-api.zenvq.com/v1/laser.js"
  data-auto-laser="true"
  data-theme="auto"
  defer
&gt;&lt;/script&gt;</code></pre>
        </div>

        <!-- Option B: Next.js / React -->
        <div class="rounded-2xl border border-white/[0.08] bg-zinc-900/60 p-6 backdrop-blur-xl">
          <h4 class="text-sm font-semibold text-white mb-2 flex items-center justify-between">
            <span>Next.js App Router (app/layout.tsx)</span>
            <span class="text-xs font-mono text-[#A855F7]">1 COMPONENT</span>
          </h4>
          <p class="text-xs text-zinc-400 mb-4">Import and drop directly into root layout:</p>
          <pre class="p-4 rounded-xl bg-zinc-950 border border-white/[0.06] text-xs font-mono text-zinc-300 overflow-x-auto"><code>import { LaserCursor } from "@/components/LaserCursor";

export default function RootLayout({ children }) {
  return (
    &lt;html lang="en"&gt;
      &lt;body&gt;
        {children}
        &lt;LaserCursor theme="auto" /&gt;
      &lt;/body&gt;
    &lt;/html&gt;
  );
}</code></pre>
        </div>

      </div>
    </div>

  </main>

  <!-- Footer -->
  <footer class="w-full border-t border-white/[0.08] py-8 mt-20 text-center text-xs text-zinc-500 font-mono">
    ZenVQ Engineering & Creative Studio &bull; Precision Edge Laser Architecture &bull; 100% Halal Media & Zero Oxford Comma Enforced
  </footer>

  <script>
    function setLaserTheme(theme) {
      if (window.ZenVQLaser) {
        window.ZenVQLaser.setTheme(theme);
        window.ZenVQLaser.burst(window.innerWidth / 2, window.innerHeight / 2, 14);
      }
    }
    function triggerLaserBurst() {
      if (window.ZenVQLaser) {
        window.ZenVQLaser.burst(window.innerWidth / 2, window.innerHeight / 2, 20);
      }
    }
    function triggerLaserPulse() {
      if (window.ZenVQLaser) {
        window.ZenVQLaser.pulse(window.innerWidth / 2, window.innerHeight / 2, 60);
      }
    }
  </script>
</body>
</html>`;
}
