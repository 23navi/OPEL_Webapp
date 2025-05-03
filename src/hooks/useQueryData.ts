import {
  Enabled,
  QueryFunction,
  QueryKey,
  useQuery,
} from "@tanstack/react-query";

export const useQueryData = (
  queryKey: QueryKey,
  queryFn: QueryFunction,
  enabled?: Enabled
) => {
  const { data, isPending, isFetched, refetch, isFetching } = useQuery({
    queryKey,
    queryFn,
    enabled
  });
  return { data, isPending, isFetched, refetch, isFetching };
};


// So when we use this enabled property on useQuery, this is to control the refetch behaviour. By default useQuery will automatically run the function on every Mount. But sometimes we don't want this action. Say we only want to fetch some data on button click. So in that case we will set enable as false and use the refetch to trigger a refetch on some action (eg button clickl)

// EG usecase

// const getUserProfile = async () => {
//   const res = await fetch("/api/profile");
//   if (!res.ok) throw new Error("Failed to fetch");
//   return res.json();
// };

// function Profile() {
//   const { data, refetch, isPending, isFetched } = useQueryData(
//     ["userProfile"],
//     getUserProfile,
//     false // <-- disabled by default
//   );

//   return (
//     <div>
//       <button onClick={() => refetch()}>Load Profile</button>

//       {isPending && <p>Loading...</p>}
//       {isFetched && <pre>{JSON.stringify(data, null, 2)}</pre>}
//     </div>
//   );
// }