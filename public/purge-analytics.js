window.purgeTrack = function (eventName, params) {
  try {
    if (typeof gtag === "function") {
      gtag("event", eventName, params || {});
    }
  } catch (e) {}
};
