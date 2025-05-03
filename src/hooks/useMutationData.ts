import {
    MutationFunction,
    MutationKey,
    useMutation,
    useMutationState,
    useQueryClient,
} from '@tanstack/react-query'
import { toast } from 'sonner'


/**
 * 
 * ✅ `useMutationData` - A custom hook wrapping `useMutation` from TanStack Query with toast and query invalidation.
 *
 * ### 🔹 Responsibilities:
 * 1. Handles mutations (like API POST/PUT/DELETE).
 * 2. Shows toast messages based on response status (`Success` or `Error`).
 * 3. Invalidates a query (i.e., refetches it) after the mutation settles (either success or failure).
 * 4. Calls an optional `onSuccess` callback if provided.
 *
 * ### 🔹 Why it’s useful:
 * - Avoids writing repetitive code for toasts, query invalidation, and mutation config in every component.
 * - Standardizes how success feedback and re-fetching work across your app.
 *
 * @param mutationKey - A unique key to identify the mutation.
 * @param mutationFn - The mutation function (e.g., API call).
 * @param queryKey - (Optional) Query key to invalidate on mutation completion.
 * @param onSuccess - (Optional) Callback to execute on successful mutation.
 *
 * @returns An object with `mutate` and `isPending` values from `useMutation`.
 *
 * 
 * ### 🔹 Example:
 * ```tsx
 * const { mutate, isPending } = useMutationData(
 *   ['deleteItem'],        // mutation key
 *   deleteItemFn,          // mutation function
 *   'itemsList',           // query to invalidate
 *   () => console.log('Deleted') // success callback
 * )
 * ```
 */
export const useMutationData = (
    mutationKey: MutationKey,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    mutationFn: MutationFunction<any, any>, // What is the MutationFunction?
    queryKey?: string, // I think, we can accept an array of query keys directly
    onSuccess?: () => void
) => {
    // Why are we creating new queryClient? Why are we not using the existing one?
    const client = useQueryClient()
    const { mutate, isPending } = useMutation({
        mutationKey,
        mutationFn,
        onSuccess(data) {
            if (onSuccess) onSuccess()
            return toast(
                data?.status === 200 || data?.status === 201 ? 'Success' : 'Error',
                {
                    description: data?.data
                }
            )
        },
        onSettled: async () => {
            return await client.invalidateQueries({
                queryKey: [queryKey],
                exact: true,
            })
        },
    })

    return { mutate, isPending }
}


/**
 * 
 * ✅ `useMutationDataState` - This is a custom hook that uses useMutationState to access the state of the most recent mutation with a specific mutation key.
 *
 * ### 🔹 Responsibilities:
 * 1. Fetches the mutation(s) matching the given mutationKey.
 * 2. Returns the variables and status of the latest mutation.
 *
 * ### 🔹 Why it’s useful:
 * - Useful for reading the last variables submitted in a mutation (e.g., optimistic UI, debugging, analytics).
 * - Can track the status of that mutation (e.g., loading, success, error).
 *
 * @param mutationKey - A unique key to identify the mutation.
 *
 * 
 * ### 🔹 Example:
 * ```tsx
 * const { latestVariables } = useMutationDataState<{ id: string }>(['deleteItem'])
 *
 *  // You can now access latestVariables?.variables.id
 * ```
 */
export const useMutationDataState = (mutationKey: MutationKey) => {
    const data = useMutationState({
        filters: { mutationKey },
        select: (mutation) => {
            return {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                variables: mutation.state.variables as any,
                status: mutation.state.status,
            }
        },
    })

    const latestVariables = data[data.length - 1]
    return { latestVariables }
}