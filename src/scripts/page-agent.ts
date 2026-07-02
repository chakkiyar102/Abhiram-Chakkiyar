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
      instructions?: {
        system?: string;
        getPageInstructions?: (url: string) => string | undefined;
      };
      options?: Record<string, unknown>;
    };
  }
}

const DEFAULT_SYSTEM_INSTRUCTIONS = `You are Ask AI for Abhiram's personal website.
Operate as a page-aware content assistant, not a blind web automation bot.

Rules:
- Prefer answering from the current page content first.
- Do NOT click, type, navigate, or scroll unless the user explicitly asks for an action (e.g. click/open/go/navigate/scroll/fill/select).
- If the request is ambiguous or subjective (for example "best/worst"), ask one clarifying question before deciding.
- If required information is not present on the current page, clearly say that and ask whether you should navigate.
- Avoid unnecessary retries and avoid repeating the same action loop.
- Keep final answers concise and practical.`;

const DEFAULT_INSTRUCTIONS = {
  system: DEFAULT_SYSTEM_INSTRUCTIONS,
  getPageInstructions: (url: string) => {
    if (url.includes("/writing")) {
      return "This is the writing index page. Focus on titles, dates, tags, and metadata shown here.";
    }

    if (url.includes("/posts/")) {
      return "This is a single post page. Focus on article content, headings, and visible metadata on this page.";
    }

    if (url.includes("/tags")) {
      return "This is the tags page. Focus on listing and grouping visible tags only.";
    }

    return undefined;
  },
};

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
    instructions: config.instructions || DEFAULT_INSTRUCTIONS,
    promptForNextTask: false,
    customTools: {
      click_element_by_index: null,
      input_text: null,
      select_dropdown_option: null,
      scroll: null,
      scroll_horizontally: null,
      execute_javascript: null,
    },
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
