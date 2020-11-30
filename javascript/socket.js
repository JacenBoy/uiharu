export const connect = (hostname, port) => {
  if (!hostname || !port) return undefined;
  const socket = new WebSocket(`ws://${hostname}:${port}`);
  socket.onopen = (e) => {
    console.debug(`Connected to ${hostname} on port ${port}`);
  };

  socket.onclose = (e) => {
    console.debug(`Connection to ${hostname} is closed`);
  };

  return socket;
};