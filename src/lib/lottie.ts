// Animations from LottieFiles (Lottie Simple License). The files are loaded from the LottieFiles
// CDN when they are needed. If one cannot be loaded, the page shows its built-in fallback.
export const LOTTIE = {
  // Idle chat assistant (Oshie Labs)
  robot: "https://assets-v2.lottiefiles.com/a/b1af6370-3b4b-424d-a799-5bc869c97b07/g7vsb3xpm1.lottie",
  // Looking through archives while the assistant reads the docs (Rita Veríssimo)
  searching: "https://assets-v2.lottiefiles.com/a/9e606741-564d-45a6-9b2a-f7e21386614c/nlWcTTpi2H.lottie",
  // Something went wrong inside the chat (Boltbite)
  error: "https://assets-v2.lottiefiles.com/a/6a21fb9a-1178-11ee-a809-cbf4c1cb708c/Nin4SFU90C.lottie",
  // Setting up a new account (Irfan M)
  setup: "https://assets-v2.lottiefiles.com/a/4adc2e46-0f27-11f0-8e5b-af6022363ea0/qeq6kNrAgL.lottie",
  // Page not found (Alice Costa)
  cat: "https://assets-v2.lottiefiles.com/a/a8702950-1167-11ee-a76e-1fc0531d8bdc/OtByYrauz6.lottie"
} as const;

export type LottieName = keyof typeof LOTTIE;

export const LOTTIE_HOST = "https://assets-v2.lottiefiles.com";
export const LOTTIE_WASM = "/lottie/dotlottie-player-0.81.0.wasm";
