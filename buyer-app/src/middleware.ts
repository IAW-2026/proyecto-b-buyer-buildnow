import {
  clerkMiddleware,
  createRouteMatcher,
} from "@clerk/nextjs/server";

const isPublicRoute =
  createRouteMatcher([
    "/login(.*)",
    "/register(.*)",
  ]);

export default clerkMiddleware(
  async (auth, req) => {
    if (!isPublicRoute(req)) {
      await auth.protect({
        unauthenticatedUrl: new URL(
          "/login",
          req.url
        ).toString(),
      });
    }
  }
);

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|png|jpg|svg|ico)).*)",
    "/(api|trpc)(.*)",
  ],
};