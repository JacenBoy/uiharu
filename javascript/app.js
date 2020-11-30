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
        console.debug(JSON.stringify(telemetry.SessionState));
        if (["Racing", "ParadeLaps", "CoolDown", "GetInCar", "Warmup", "Checkered"].includes(telemetry.SessionState)) {
          elements.flagBox.text(`Lap ${telemetry.Lap}${telemetry.SessionLapsRemainEx >= 0 ? `/${(telemetry.LapCompleted >= 0 ? telemetry.LapCompleted : 0) + telemetry.SessionLapsRemainEx}` : ""}`);
        } else {
          console.debug(`Unhandled SessionState: ${telemetry.SessionState}`);
        }

        // Update flag colors
        console.debug(JSON.stringify(telemetry.SessionFlags))
        if (telemetry.SessionFlags.includes("Green")) {
          if (!elements.flagBox.hasClass("flag-green")) {
            elements.flagBox.removeClass((index, className) => {
              return (className.match(/(^|\s)flag-\S+/g || [])).join(" ");
            });
            elements.flagBox.addClass("flag-green");
          }
        } else if (telemetry.SessionFlags.includes("Caution") || telemetry.SessionFlags.includes("OneLapToGreen")) {
          if (!elements.flagBox.hasClass("flag-caution")) {
            elements.flagBox.removeClass((index, className) => {
              return (className.match(/(^|\s)flag-\S+/g || [])).join(" ");
            });
            elements.flagBox.addClass("flag-caution");
          }
        } else if (telemetry.SessionState == "Checkered") {
          // Checkered flag logic
        } else if (telemetry.SessionFlags.includes("StartHidden") || telemetry.SessionFlags == []) {
          elements.flagBox.removeClass((index, className) => {
            return (className.match(/(^|\s)flag-\S+/g || [])).join(" ");
          });
          elements.flagBox.addClass("flag-none");
        } else {
          //console.debug(`Unhandled SessionFlags: ${JSON.stringify(telemetry.SessionFlags)}`);
        }

        elements.temps.air.text(Math.round(functions.toFahrenheit(telemetry.AirTemp)));
        elements.temps.track.text(Math.round(functions.toFahrenheit(telemetry.TrackTemp)));

        elements.times.last.text(functions.toMins(telemetry.LapLastLapTime));
        elements.times.best.text(functions.toMins(telemetry.LapBestLapTime));
        elements.times.bestLap.text(telemetry.LapBestLap);
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