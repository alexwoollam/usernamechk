const startRelay = async (listen, outbox, intervals) => {
  await listen;
  setInterval(async () => {
    await outbox();
  }, intervals);
};

export default startRelay;