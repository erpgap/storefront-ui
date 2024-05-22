import generateFlags from "@nuxtjs/device/runtime/generateFlags";
import type { EventHandler, RouterMethod, H3Event } from "h3";
import { useNuxtApp } from "nuxt/app";

type Handler = {
  route: string;
  handler: () => EventHandler | Promise<EventHandler>;
  middleware: boolean;
  method: RouterMethod | RouterMethod[];
};

export default defineNitroPlugin((nitroApp) => {
  const handlerList: Handler[] = eval("handlers");
  const enHandler = handlerList.find((r) => {
    return (
      r.route === "/" || r.route === "/product/*" || r.route === "/category/*"
    );
  });

  if (enHandler) {
    const customHandler = cachedEventHandler(
      lazyEventHandler(enHandler.handler),
      {
        group: "pages",
        getKey: (event: H3Event) => {
          const headers = getRequestHeaders(event);

          const userAgent: any = headers["user-agent"];
          const flags = generateFlags(headers, userAgent);

          if (flags.isDesktop) {
            return `desktop-${event.path}`;
          }
          return `mobile-${event.path}`;
        },
        shouldInvalidateCache: (event: H3Event) => {
          return false;
        },
        shouldBypassCache: (event: H3Event) => {
          return false;
        },
      }
    );
    nitroApp.router.use(enHandler.route, customHandler, enHandler.method);
  }
});
