const SCRIPT_ID = "guard";
const DEFAULTS = { enabled: true, patterns: [] };

// Re-registers the guard script from storage. Serialized so overlapping triggers
// (storage change + permission change) can't interleave unregister/register.
let queue = Promise.resolve();
function sync() {
  queue = queue.then(doSync).catch((err) => console.error("[hang-on] sync failed", err));
  return queue;
}

async function doSync() {
  const { enabled, patterns } = await chrome.storage.sync.get(DEFAULTS);

  await chrome.scripting.unregisterContentScripts({ ids: [SCRIPT_ID] }).catch(() => {});
  if (!enabled) return;

  // registerContentScripts fails for origins we lack host permission for. A malformed
  // stored pattern makes contains() throw; skip it so it can't disable the other sites.
  const granted = [];
  for (const pattern of patterns) {
    try {
      if (await chrome.permissions.contains({ origins: [pattern] })) granted.push(pattern);
    } catch (err) {
      console.warn("[hang-on] skipping invalid pattern", pattern, err);
    }
  }
  if (granted.length === 0) return;

  await chrome.scripting.registerContentScripts([
    {
      id: SCRIPT_ID,
      matches: granted,
      js: ["guard.js"],
      runAt: "document_start",
      world: "MAIN",
    },
  ]);
}

chrome.runtime.onInstalled.addListener(sync);
chrome.runtime.onStartup.addListener(sync);
chrome.storage.onChanged.addListener((_changes, area) => {
  if (area === "sync") sync();
});
chrome.permissions.onAdded.addListener(sync);
chrome.permissions.onRemoved.addListener(sync);
chrome.action.onClicked.addListener(() => chrome.runtime.openOptionsPage());
