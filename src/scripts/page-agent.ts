declare global {
  interface Window {
    PageAgent?: new (config: Record<string, unknown>) => {
      panel?: {
        show?: () => void;
        hide?: () => void;
      };
      execute?: (task: string) => Promise<unknown>;
      dispose?: () => void;
    };
    pageAgent?: {
      PageAgent?: new (config: Record<string, unknown>) => {
        panel?: {
          show?: () => void;
          hide?: () => void;
        };
        execute?: (task: string) => Promise<unknown>;
        dispose?: () => void;
      };
    };
    kfPageAgent?: {
      init: () => Promise<unknown>;
      show: () => Promise<void>;
      execute: (task: string) => Promise<unknown>;
      reset: () => void;
    };
    __ABHIRAM_PAGE_AGENT__?: {
      enabled?: boolean;
      sdkUrl?: string;
      baseURL?: string;
      model?: string;
      language?: string;
      instructions?: Record<string, unknown>;
      options?: Record<string, unknown>;
    };
  }
}

const DEFAULT_CONFIG = {
  enabled: true,
  sdkUrl:
    "https://cdn.jsdelivr.net/npm/page-agent@1.10.0/dist/iife/page-agent.demo.js?autoInit=false",
  baseURL: "/api/v1",
  model: "gpt-5.4-mini",
  language: "en-US",
};

let pageAgentScriptPromise: Promise<void> | null = null;
let pageAgentInstance: {
  panel?: {
    show?: () => void;
    hide?: () => void;
  };
  execute?: (task: string) => Promise<unknown>;
  dispose?: () => void;
} | null = null;
let triggerBound = false;

function getConfig() {
  return {
    ...DEFAULT_CONFIG,
    ...(window.__ABHIRAM_PAGE_AGENT__ || {}),
  };
}

function getPageAgentClass() {
  if (window.PageAgent) return window.PageAgent;
  if (window.pageAgent?.PageAgent) return window.pageAgent.PageAgent;
  return null;
}

function loadPageAgentScript(src: string) {
  if (pageAgentScriptPromise) return pageAgentScriptPromise;

  pageAgentScriptPromise = new Promise((resolve, reject) => {
    const existing = document.querySelector(`script[data-page-agent='${src}']`);

    if (existing) {
      resolve();
      return;
    }

    const script = document.createElement("script");
    script.src = src;
    script.async = true;
    script.dataset.pageAgent = src;
    script.onload = () => resolve();
    script.onerror = () =>
      reject(new Error(`Unable to load PageAgent SDK from ${src}`));

    document.body.appendChild(script);
  }).catch(() => {
    pageAgentScriptPromise = null;
    throw new Error("PageAgent script load failed");
  });

  return pageAgentScriptPromise;
}

async function initPageAgent() {
  if (pageAgentInstance) return pageAgentInstance;

  const config = getConfig();

  if (!config.enabled) return null;

  await loadPageAgentScript(config.sdkUrl);

  const PageAgent = getPageAgentClass();

  if (!PageAgent) {
    return null;
  }

  pageAgentInstance = new PageAgent({
    baseURL: config.baseURL,
    model: config.model,
    language: config.language,
    instructions: config.instructions,
    ...(config.options || {}),
  });

  return pageAgentInstance;
}

async function showPageAgent() {
  // PageAgent may dispose itself after a run; always reopen with a fresh instance.
  resetPageAgent();

  const agent = await initPageAgent();
  agent?.panel?.show?.();
}

async function executePageAgent(task: string) {
  const agent = await initPageAgent();
  if (!agent?.execute) return null;
  return agent.execute(task);
}

function resetPageAgent() {
  pageAgentInstance?.dispose?.();
  pageAgentInstance = null;
}

function maybeOpenFromQuery() {
  const query = new URLSearchParams(window.location.search);
  if (query.get("ask") === "1") {
    void showPageAgent();
  }
}

function handleTriggerClick(event: Event) {
  const target = event.target as HTMLElement | null;
  if (!target) return;

  const trigger = target.closest("#page-agent-trigger");
  if (!trigger) return;

  event.preventDefault();
  void showPageAgent();
}

function bindPageAgentTrigger() {
  if (triggerBound) return;

  document.addEventListener("click", handleTriggerClick);
  triggerBound = true;
}

function bootstrapPageAgent() {
  window.kfPageAgent = {
    init: initPageAgent,
    show: showPageAgent,
    execute: executePageAgent,
    reset: resetPageAgent,
  };

  bindPageAgentTrigger();
  maybeOpenFromQuery();
}

bootstrapPageAgent();

document.addEventListener("astro:before-swap", () => {
  resetPageAgent();
});

document.addEventListener("astro:after-swap", () => {
  maybeOpenFromQuery();
});

export {};
