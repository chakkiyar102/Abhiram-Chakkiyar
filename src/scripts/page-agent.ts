type AgentMode = "assistant" | "action";

type PageAgentInstructions = {
  system?: string;
  getPageInstructions?: (url: string) => string | undefined;
};

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
      getMode: () => AgentMode;
      setMode: (mode: AgentMode) => AgentMode;
      toggleMode: () => AgentMode;
    };
    __ABHIRAM_PAGE_AGENT__?: {
      enabled?: boolean;
      sdkUrl?: string;
      baseURL?: string;
      model?: string;
      language?: string;
      mode?: AgentMode;
      instructions?: PageAgentInstructions;
      options?: Record<string, unknown>;
    };
  }
}

const MODE_STORAGE_KEY = "abhiram_page_agent_mode";
const DEFAULT_MODE: AgentMode = "assistant";

const ASSISTANT_SYSTEM_INSTRUCTIONS = `You are Ask AI for Abhiram's personal website.
Operate as a page-aware content assistant, not a blind web automation bot.

Rules:
- Prefer answering from the current page content first.
- Do NOT click, type, navigate, or scroll unless the user explicitly asks for an action (e.g. click/open/go/navigate/scroll/fill/select).
- If the request is ambiguous or subjective (for example "best/worst"), ask one clarifying question before deciding.
- If required information is not present on the current page, clearly say that and ask whether you should navigate.
- Avoid unnecessary retries and avoid repeating the same action loop.
- Keep final answers concise and practical.`;

const ACTION_SYSTEM_INSTRUCTIONS = `You are Ask AI for Abhiram's personal website.
Operate as a practical browser assistant.

Rules:
- Prefer answering from visible page content first.
- You may click, type, navigate, and scroll when needed to complete user requests.
- Avoid destructive actions (submit, purchase, delete, publish, checkout, send) unless the user explicitly asks.
- Avoid loops and repeated retries; if blocked, explain why and ask for clarification.
- Keep final answers concise and practical.`;

const SHARED_PAGE_INSTRUCTIONS = (url: string) => {
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
};

const ASSISTANT_INSTRUCTIONS: PageAgentInstructions = {
  system: ASSISTANT_SYSTEM_INSTRUCTIONS,
  getPageInstructions: SHARED_PAGE_INSTRUCTIONS,
};

const ACTION_INSTRUCTIONS: PageAgentInstructions = {
  system: ACTION_SYSTEM_INSTRUCTIONS,
  getPageInstructions: SHARED_PAGE_INSTRUCTIONS,
};

const ASSISTANT_CUSTOM_TOOLS = {
  click_element_by_index: null,
  input_text: null,
  select_dropdown_option: null,
  scroll: null,
  scroll_horizontally: null,
  execute_javascript: null,
};

const ACTION_CUSTOM_TOOLS = {
  execute_javascript: null,
};

const DEFAULT_CONFIG = {
  enabled: true,
  sdkUrl:
    "https://cdn.jsdelivr.net/npm/page-agent@1.10.0/dist/iife/page-agent.demo.js?autoInit=false",
  baseURL: "/api/v1",
  model: "gpt-5.4-mini",
  language: "en-US",
  mode: DEFAULT_MODE as AgentMode,
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
let clickHandlerBound = false;
let currentMode: AgentMode = DEFAULT_MODE;

function isValidMode(mode: unknown): mode is AgentMode {
  return mode === "assistant" || mode === "action";
}

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

function getModeLabel(mode: AgentMode) {
  return mode === "assistant" ? "AI: Assist" : "AI: Action";
}

function readStoredMode(): AgentMode | null {
  try {
    const stored = localStorage.getItem(MODE_STORAGE_KEY);
    return isValidMode(stored) ? stored : null;
  } catch {
    return null;
  }
}

function persistMode(mode: AgentMode) {
  try {
    localStorage.setItem(MODE_STORAGE_KEY, mode);
  } catch {
    // Ignore storage errors (private mode / disabled storage).
  }
}

function getModeToggleButton() {
  return document.getElementById("page-agent-mode-toggle");
}

function renderModeToggle() {
  const button = getModeToggleButton();
  if (!button) return;

  button.textContent = getModeLabel(currentMode);
  button.setAttribute(
    "aria-label",
    currentMode === "assistant"
      ? "Ask AI mode: assistant"
      : "Ask AI mode: action"
  );
  button.setAttribute(
    "title",
    currentMode === "assistant"
      ? "Assistant mode: answer from visible page content"
      : "Action mode: allow navigation and interactions"
  );
  button.dataset.mode = currentMode;
}

function resolveInstructions(config: ReturnType<typeof getConfig>, mode: AgentMode) {
  const defaults = mode === "assistant" ? ASSISTANT_INSTRUCTIONS : ACTION_INSTRUCTIONS;
  const incoming = config.instructions;

  if (!incoming) return defaults;

  return {
    system: incoming.system ?? defaults.system,
    getPageInstructions:
      incoming.getPageInstructions ?? defaults.getPageInstructions,
  };
}

function resolveCustomTools(
  config: ReturnType<typeof getConfig>,
  mode: AgentMode
) {
  const modeTools =
    mode === "assistant" ? ASSISTANT_CUSTOM_TOOLS : ACTION_CUSTOM_TOOLS;
  const optionTools =
    (config.options?.customTools as Record<string, unknown> | undefined) || {};

  return {
    ...modeTools,
    ...optionTools,
  };
}

function getOptionsWithoutCustomTools(options?: Record<string, unknown>) {
  if (!options) return {};
  const next = { ...options };
  delete next.customTools;
  return next;
}

function setMode(mode: AgentMode, persist = true) {
  if (!isValidMode(mode)) return currentMode;
  currentMode = mode;

  if (persist) {
    persistMode(mode);
  }

  resetPageAgent();
  renderModeToggle();
  return currentMode;
}

function toggleMode() {
  const nextMode = currentMode === "assistant" ? "action" : "assistant";
  return setMode(nextMode, true);
}

function initializeMode() {
  const config = getConfig();
  const stored = readStoredMode();
  const configMode = isValidMode(config.mode) ? config.mode : DEFAULT_MODE;
  const initialMode = stored || configMode;
  setMode(initialMode, !stored);
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

  if (!PageAgent) return null;

  const options = getOptionsWithoutCustomTools(config.options);

  pageAgentInstance = new PageAgent({
    baseURL: config.baseURL,
    model: config.model,
    language: config.language,
    instructions: resolveInstructions(config, currentMode),
    promptForNextTask: false,
    customTools: resolveCustomTools(config, currentMode),
    ...options,
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

function getEventElementTarget(event: Event): Element | null {
  const path = event.composedPath?.();
  if (path?.length) {
    for (const node of path) {
      if (node instanceof Element) return node;
    }
  }

  const rawTarget = event.target;
  if (rawTarget instanceof Element) return rawTarget;
  if (rawTarget instanceof Node) return rawTarget.parentElement;
  return null;
}

function handleDocumentClick(event: Event) {
  const target = getEventElementTarget(event);
  if (!target) return;

  const modeToggle = target.closest("#page-agent-mode-toggle");
  if (modeToggle) {
    event.preventDefault();
    toggleMode();
    return;
  }

  const trigger = target.closest("#page-agent-trigger");
  if (!trigger) return;

  event.preventDefault();
  void showPageAgent();
}

function bindPageAgentHandlers() {
  if (clickHandlerBound) return;

  document.addEventListener("click", handleDocumentClick);
  clickHandlerBound = true;
}

function bootstrapPageAgent() {
  initializeMode();

  window.kfPageAgent = {
    init: initPageAgent,
    show: showPageAgent,
    execute: executePageAgent,
    reset: resetPageAgent,
    getMode: () => currentMode,
    setMode: mode => setMode(mode, true),
    toggleMode,
  };

  bindPageAgentHandlers();
  renderModeToggle();
  maybeOpenFromQuery();
}

bootstrapPageAgent();

document.addEventListener("astro:before-swap", () => {
  resetPageAgent();
});

document.addEventListener("astro:after-swap", () => {
  renderModeToggle();
  maybeOpenFromQuery();
});

export {};
