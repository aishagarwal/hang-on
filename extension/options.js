const DEFAULTS = { enabled: true, patterns: [] };

const enabledEl = document.getElementById("enabled");
const formEl = document.getElementById("add-form");
const inputEl = document.getElementById("pattern");
const errorEl = document.getElementById("error");
const listEl = document.getElementById("list");

// "meet.google.com" -> "https://meet.google.com/*". Throws on input Chrome would reject.
function normalize(input) {
  let s = input.trim();
  if (!s) throw new Error("Enter a site.");
  if (!/^[a-z*]+:\/\//i.test(s)) s = "https://" + s;
  const m = s.match(/^(\*|https?):\/\/([^/]+)(\/.*)?$/i);
  if (!m) throw new Error("Use a form like meet.google.com or *.zoom.us/wc/*");
  const host = m[2].toLowerCase();
  if (!/^(\*\.)?[a-z0-9-]+(\.[a-z0-9-]+)*$/.test(host)) {
    throw new Error("Host must be a name like example.com or *.example.com.");
  }
  return `${m[1].toLowerCase()}://${host}${m[3] || "/*"}`;
}

// Chrome host permissions are per origin (path is ignored), so patterns on the same
// scheme+host share one permission.
const hostKey = (pattern) => pattern.replace(/^([^:]+:\/\/[^/]+).*$/, "$1");

async function render() {
  const { enabled, patterns } = await chrome.storage.sync.get(DEFAULTS);
  enabledEl.checked = enabled;
  listEl.replaceChildren();

  if (patterns.length === 0) {
    const li = document.createElement("li");
    li.className = "empty";
    li.textContent = "No sites yet.";
    listEl.append(li);
    return;
  }

  for (const pattern of patterns) {
    const li = document.createElement("li");
    const code = document.createElement("code");
    code.textContent = pattern;
    li.append(code);

    if (!(await chrome.permissions.contains({ origins: [pattern] }))) {
      const warn = document.createElement("span");
      warn.className = "inactive";
      warn.textContent = "inactive: permission missing";
      li.append(warn);
    }

    const btn = document.createElement("button");
    btn.textContent = "Remove";
    btn.addEventListener("click", () => removePattern(pattern));
    li.append(btn);
    listEl.append(li);
  }
}

async function addPattern(raw) {
  const pattern = normalize(raw);
  const { patterns } = await chrome.storage.sync.get(DEFAULTS);
  if (patterns.includes(pattern)) throw new Error("Already in the list.");

  const granted = await chrome.permissions.request({ origins: [pattern] });
  if (!granted) throw new Error("Permission was not granted for that site.");

  await chrome.storage.sync.set({ patterns: [...patterns, pattern] });
}

async function removePattern(pattern) {
  const { patterns } = await chrome.storage.sync.get(DEFAULTS);
  const rest = patterns.filter((p) => p !== pattern);
  await chrome.storage.sync.set({ patterns: rest });

  if (!rest.some((p) => hostKey(p) === hostKey(pattern))) {
    await chrome.permissions.remove({ origins: [pattern] });
  }
}

formEl.addEventListener("submit", async (e) => {
  e.preventDefault();
  errorEl.textContent = "";
  try {
    await addPattern(inputEl.value);
    inputEl.value = "";
  } catch (err) {
    errorEl.textContent = err.message;
  }
});

enabledEl.addEventListener("change", () => chrome.storage.sync.set({ enabled: enabledEl.checked }));

chrome.storage.onChanged.addListener(render);
chrome.permissions.onAdded.addListener(render);
chrome.permissions.onRemoved.addListener(render);
render();
