// ═══════════════════════════════════════════════
// CONFIGURAÇÃO DO DASHBOARD — edite aqui
// ═══════════════════════════════════════════════

const CONFIG = {
  // Intervalo de troca de slide (segundos)
  ROTATE_SEC: 15,

  // Intervalo de atualização dos dados (minutos)
  REFRESH_MIN: 5,

  // Slides — adicione ou remova conforme necessário
  SLIDES: [
    { id: 'slide-0', title: 'Meta Geral — Corretora' },
    { id: 'slide-1', title: 'Comercial — SMJ' },
    // { id: 'slide-2', title: 'SLA Operacional' },  // futuro
  ],

  // URLs das planilhas (CSV publicado do Google Sheets)
  CSV_META:      'https://docs.google.com/spreadsheets/d/e/2PACX-1vS0NPp-ymZjFPn9rz3E1sTOrpK4uWJOcLDbs2l43Ypw-xgUxOZB3NNgZbU8ux3wg2hooXbFgfXbh-tM/pub?gid=89854617&single=true&output=csv',
  CSV_COMERCIAL: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQx7mdgyvFAQzKAIkviNVzyHvJQRWl2IT5pgT5Z7A6CYY7jhOCWAF0DK3xp1YF-8DENRKaXNYZhuEtf/pub?gid=759908653&single=true&output=csv',

  // Proxies em ordem de prioridade (tenta o próximo se falhar)
  PROXIES: [
    'https://corsproxy.io/?',
    'https://api.allorigins.win/raw?url=',
    'https://api.codetabs.com/v1/proxy?quest=',
  ],
};
