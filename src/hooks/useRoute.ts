import { useEffect, useState } from "react";

export type Route = { name: "home" } | { name: "case"; id: string };

const parse = (): Route => {
  const h = window.location.hash || "#/";
  const m = h.match(/^#\/case\/([\w-]+)/);
  if (m) return { name: "case", id: m[1] };
  return { name: "home" };
};

export function useRoute(): Route {
  const [route, setRoute] = useState<Route>(parse);
  useEffect(() => {
    const onHash = () => {
      setRoute(parse());
      window.scrollTo({ top: 0, behavior: "auto" });
    };
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);
  return route;
}
