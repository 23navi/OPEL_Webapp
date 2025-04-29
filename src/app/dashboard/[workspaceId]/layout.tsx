import React from "react";
import { getNotifications, onAuthenticateUser } from "@/actions/user";
import {
  getAllUserVideos,
  getWorkspaceFolders,
  getWorkSpaces,
  verifyAccessToWorkspace,
} from "@/actions/workspace";
import { redirect } from "next/navigation";
import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query";
import Sidebar from "@/components/global/sidebar";

type Props = {
  params: { workspaceId: string }; // Getting from the path param of the url
  children: React.ReactNode;
};

// In next14, the layout pages are cached by default so it runs only once, in that case, it will check for workspace access only on the first render. (But this is not the case in next15+)

const Layout = async (props: Props) => {

  //  "params should be awaited before using its properties"
  const { params, children } =  props;
  const { workspaceId } = await params;

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

  // This is more of temp query client just create and used in this layout, when it is mounted on the server side, only used for prefetching and dehydration, the data it produce will be used by the client side queryClinet which we created and passed as ReactQueryProvider
  const query = new QueryClient();

  // So we are prefetching some of the data, they will be stale but when user goes to that page, he/she will see some data before refetch. So in layout we are calling all prefetchs and associate them with query-key

  await query.prefetchQuery({
    queryKey: ["user-workspaces"],
    queryFn: () => getWorkSpaces(),
  });

  await query.prefetchQuery({
    queryKey: ["workspace-folders"],
    queryFn: () => getWorkspaceFolders(workspaceId),
  });

  await query.prefetchQuery({
    queryKey: ["user-notifications"],
    queryFn: () => getNotifications(),
  });

  await query.prefetchQuery({
    queryKey: ["user-videos"],
    queryFn: () => getAllUserVideos(workspaceId),
  });

  return (
    //This hydrationBoundy is kind of similar to QueryClientProvider, but we use HydrationBoundary as we are using SSR with nextjs, and we use this only when you’re prefetching data on the server, then sending it to the client to avoid duplicate fetching
    <HydrationBoundary state={dehydrate(query)}>
      <div className="flex h-screen w-screen">
        <Sidebar activeWorkspaceId={workspaceId} />
        <div className="w-full pt-28 p-6 overflow-y-scroll overflow-x-hidden">
          <div className="mt-4">{children}</div>
        </div>
      </div>
    </HydrationBoundary>
  );
};

export default Layout;
