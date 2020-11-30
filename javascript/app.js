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

        // Update lap counts
        if (["Racing", "ParadeLaps"].includes(telemetry.SessionState)) {
          elements.flagBox.text(`Lap ${telemetry.Lap}${telemetry.SessionLapsRemainEx >= 0 ? `/${(telemetry.LapCompleted >= 0 ? telemetry.LapCompleted : 0) + telemetry.SessionLapsRemainEx}` : ""}`);
        } else {
          console.debug(`Unhandled SessionState: ${telemetry.SessionState}`);
        }

        if (telemetry.SessionFlags.includes("Green")) {
          if (!elements.flagBox.hasClass("flag-green")) {
            elements.flagBox.removeClass((index, className) => {
              return (className.match(/(^|\s)flag-\S+/g || [])).join(" ");
            });
            elements.flagBox.addClass("flag-green");
          }
        } else if (telemetry.SessionFlags == []) {
          elements.flagBox.removeClass((index, className) => {
            return (className.match(/(^|\s)flag-\S+/g || [])).join(" ");
          });
          elements.flagBox.addClass("flag-none");
        } else {
          console.debug(`Unhandled SessionFlags: ${JSON.stringify(telemetry.SessionFlags)}`);
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