import React from "react";
import { onAuthenticateUser } from "@/actions/user";
import { verifyAccessToWorkspace } from "@/actions/workspace";
import { redirect } from "next/navigation";
import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query";

type Props = {
  params: { workspaceId: string };
  children: React.ReactNode;
};

// In next14, the layout pages are cached by default so it runs only once, in that case, it will check for workspace access only on the first render. (But this is not the case in next15+)

const Layout = async ({ params: { workspaceId }, children }: Props) => {

  // We can have some kind of auth provider which can check for auth so we don't have to do it here.  
  const auth = await onAuthenticateUser();
  if (!auth.user?.workspace) redirect("/auth/sign-in");
  if (!auth.user.workspace.length) redirect("/auth/sign-in");


  // This two checks are for the case if the user tries to enter the workspaceId of a workspace it's not part of, so we will redirect him/her to his workspace.
  const hasAccess = await verifyAccessToWorkspace(workspaceId);
  if (hasAccess.status !== 200) {
    redirect(`/dashboard/${auth.user?.workspace[0].id}`);
  }
  if (!hasAccess.data?.workspace) return null;


  const query = new QueryClient();

  return (
    <HydrationBoundary state={dehydrate(query)}>
      <div className="flex h-screen w-screen">
        <div className="w-full pt-28 p-6 overflow-y-scroll overflow-x-hidden">
          <div className="mt-4">{children}</div>
        </div>
      </div>
    </HydrationBoundary>
  );
};

export default Layout;
