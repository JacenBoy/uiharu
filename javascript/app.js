(async () => {
  const elements = await import("./definitions.js");
  const functions = await import("./functions.js");
  const ws = await import("./socket.js");

  const params = new URLSearchParams(window.location.search);
  const wsPort = params.get("port") || 4040;
  const wsHost = params.get("host") || "localhost";
  const irPassword = params.get("password");

  var socket = ws.connect(wsHost, wsPort);

  socket.onmessage = (data) => {
    try {
      data = JSON.parse(data.data);
      if (data.type == "telemetry") {
        // Handle UI updates
        const telemetry = data.data.values;
        if (telemetry.SessionState == "Racing") {
          elements.flagBox.text(`Lap ${telemetry.Lap}${telemetry.SessionLapsRemain >= 0 ? `/${telemetry.LapCompleted + telemetry.SessionLapsRemainEx}` : ""}`);
        }
      }
      if (data.type == "ping") {
        console.debug("Server acknowledged a ping");
      }
    } catch (ex) {
      // ¯\_(ツ)_/¯
      console.debug(ex);
    }
  };

  elements.conn.click(() => {
    if (socket.readyState != WebSocket.OPEN) socket = ws.connect(wsHost, wsPort);
  });

  elements.eStop.click(() => {
    if (socket.readyState == WebSocket.OPEN) socket.close("1000", "User requested disconnection");
  });

  window.addEventListener("beforeunload", function(e) {
    if (socket.readyState == WebSocket.OPEN) socket.close("1000", "Page unloading");
  }, false);
})();