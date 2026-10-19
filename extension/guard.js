// Runs in the page's own JS world at document_start, so it sees the page's WebRTC setup
// and its beforeunload listener is registered before any of the page's. Wrapped in an
// IIFE so nothing leaks into the page's global scope.
(() => {
  // --- Call detection ------------------------------------------------------------
  // Track every RTCPeerConnection the page creates. WeakRefs so we never keep a closed
  // connection alive.
  const Native = window.RTCPeerConnection;
  const connections = [];
  if (Native) {
    class TrackedPeerConnection extends Native {
      constructor(...args) {
        super(...args);
        connections.push(new WeakRef(this));
      }
    }
    window.RTCPeerConnection = TrackedPeerConnection;
    if (window.webkitRTCPeerConnection) window.webkitRTCPeerConnection = TrackedPeerConnection;
  }

  // A call is a connected peer connection with negotiated audio/video. "disconnected" is
  // included because it is usually a brief network drop mid-call. Data-channel-only
  // connections (file transfer, game sync) have no transceivers and don't count.
  function isCallActive() {
    let active = 0;
    for (const ref of connections) {
      const pc = ref.deref();
      if (!pc) continue;
      if (pc.connectionState !== "connected" && pc.connectionState !== "disconnected") continue;
      const hasMedia = pc
        .getTransceivers()
        .some((t) => t.currentDirection && t.currentDirection !== "stopped" && t.currentDirection !== "inactive");
      if (hasMedia) active++;
    }
    return active > 0;
  }

  // --- Page navigation exemption -------------------------------------------------
  // beforeunload also fires when the page itself navigates (e.g. Meet going from /home to
  // a meeting). The Navigation API's `navigate` event fires first for those, and never for
  // a tab close, so we use it to step aside for page-initiated navigations.
  let pageNavigating = false;
  if (window.navigation) {
    window.navigation.addEventListener("navigate", (e) => {
      if (e.userInitiated || e.destination.sameDocument) return;
      pageNavigating = true;
      setTimeout(() => (pageNavigating = false), 1000);
    });
  }

  // --- The guard -----------------------------------------------------------------
  // Capture phase makes this fire first at the window target.
  window.addEventListener(
    "beforeunload",
    (e) => {
      if (pageNavigating) return;
      // No call: behave as if the extension weren't installed.
      if (!isCallActive()) return;

      e.preventDefault();
      // Deprecated, but older Chrome (the manifest allows 102+) only shows the dialog when this is set.
      e.returnValue = "";
      // Stops the page's own beforeunload handlers (e.g. one that hangs up the call).
      e.stopImmediatePropagation();
    },
    true
  );
})();
