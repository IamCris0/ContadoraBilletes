import { contextBridge } from "electron";

contextBridge.exposeInMainWorld("controlCaja", {
  plataforma: process.platform
});
