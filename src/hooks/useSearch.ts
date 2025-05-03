import { useEffect, useState } from 'react'

import { searchUsers } from '@/actions/user'
import { useQueryData } from './useQueryData'

// So what is this type in useSearch? 
// We can use this same useSearch to search for different things. Say Users, Workspaces, Videos. So we can accept different type and based on the type, we can conditionally call the action.

export const useSearch = (key: string, type: 'USERS') => {
    const [query, setQuery] = useState('')
    const [debounce, setDebounce] = useState('')

    // onUsers can be array of users or undefined. (Instead of undefined, we could have done empty array [])
    const [onUsers, setOnUsers] = useState<
        {
            id: string
            subscription: {
                plan: 'PRO' | 'FREE'
            } | null
            firstname: string | null
            lastname: string | null
            image: string | null
            email: string | null
        }[]
        | undefined
    >(undefined)


    // This is the callback function we will use to make the input field as controlled input field. And will do debounced search.
    const onSearchQuery = (e: React.ChangeEvent<HTMLInputElement>) => {
        setQuery(e.target.value)
    }


    // useEffect 1: This use effect runs everytime the user enters anything to search input box, this useEffect updates `debounce` state but only if there is no change in `query` state for 1 sec.
    /*
       useEffect watches query. Every time query changes:

       A new timeout is started to update debounce after 1000ms (1 second).

       Before that timeout runs, if the user types again, the previous timeout is cleared (clearTimeout).

       So, only after the user stops typing for 1 second, debounce is updated.  
   */
    //   When debounce state is changed, the other useEffect runs as it depends on debounce state.
    useEffect(() => {
        const delayInputTimeoutId = setTimeout(() => {
            setDebounce(query)
        }, 1000)

        // So the cleanup function is imp, as soon as the query changes, we run the cleanup before running this useEffect, the cleanup will delete that setTimeout.
        return () => clearTimeout(delayInputTimeoutId)
    }, [query])


    // What is debounce here and what is happing here?

    // So we are managing the debounce ourselves. So whenever we get a new word in the search query. We set the debounce as the search term entered by the user.

    // While making the request, we are sending two things to useQuery as key ["search-users",debounced_search_word]
    const { refetch, isFetching } = useQueryData(
        [key, debounce],

        // This function which we give to useQeury as queryFn, is called by useQuery() when running it. useQuery() calls this function with one argument {queryKey} and this queryKey is the same query key we pass to useQuery ["search-users",debounced_search_word]
        async ({ queryKey }) => {
            // Here is the place where based on the type, we are calling the required action. So for type="USERS", I am calling the searchUsers action.
            if (type === 'USERS') {
                const users = await searchUsers(queryKey[1] as string) // So the queryKey is ["search-users",debounced_search_word], we need the debounced_search_word to make the search call, the "search-users" is just for query caching.
                if (users.status === 200) {
                    setOnUsers(users.data)
                    return users.data
                }
                return [] // if users.status !== 200
            }
            return [] // if type !== "USERS"
        },
        false //(enabled?) We are telling that don't run this on mount, only run the useQuery when we manually call the refetch.
    )


    // useEffect 2: When debounce updates, it triggers refetch(), which makes the API call.
    useEffect(() => {
        if (debounce) refetch()
        if (!debounce) setOnUsers(undefined)

        // We don't need any cleanup function here as there is nothing to clean up here
        // return () => {
        //     debounce
        // }
    }, [debounce, refetch])
    //  This is safe — refetch is a stable function from React Query, so including it won’t cause unwanted re-renders.

    return { onSearchQuery, query, isFetching, onUsers }
}






// How react query actually works internally and what about the error: Query data cannot be undefined. Please make sure to return a value other than undefined from your query function. Affected query key: ["get-users","navi"]

/*
const { refetch, isFetching } = useQueryData(
        [key, debounce],

        // This function which we give to useQeury as queryFn, is called by useQuery() when running it. useQuery() calls this function with one argument {queryKey} and this queryKey is the same query key we pass to useQuery ["search-users",debounced_search_word]
        async ({ queryKey }) => {
            // Here is the place where based on the type, we are calling the required action. So for type="USERS", I am calling the searchUsers action.
            if (type === 'USERS') {
                const users = await searchUsers(queryKey[1] as string) // So the queryKey is ["search-users",debounced_search_word], we need the debounced_search_word to make the search call, the "search-users" is just for query caching.
                if (users.status === 200) setOnUsers(users.data)
            }
        },
        false //(enabled?) We are telling that don't run this on mount, only run the useQuery when we manually call the refetch.
    )
*/

// This above implementation of useQuery is wrong.
// This queryFunction which we pass to useQuery() should return the data, this data is critical for reactQuery to manage the cache feature.

/*
Notice: there’s no return statement.
So the function implicitly returns undefined, which React Query doesn't allow — it expects a defined value, even if it's null or an empty array.
 */

/*

🔒 Why React Query requires a return value
    React Query is a data-fetching and caching library. It:

    Runs your queryFn (the one you give it).

    Stores the result in its internal cache based on the query key.

    Provides you that data via data, isFetching, etc.

    If your queryFn doesn’t return anything, React Query can’t cache anything, which breaks its core feature set.
    That's why React Query throws this error — to prevent you from silently misusing it.

*/


// One more thing about 

/*
const [onUsers, setOnUsers] = useState<
        {
            id: string
            subscription: {
                plan: 'PRO' | 'FREE'
            } | null
            firstname: string | null
            lastname: string | null
            image: string | null
            email: string | null
        }[]
        | undefined
    >(undefined)
*/

// Right now we are managing the onUsers state ourselves by calling setOnUsers() in the useQuery function. But react query can do it for us.

// We are managing state ourselves as we are using debounce and refetch.
/*

const { data: onUsers, refetch, isFetching } = useQueryData(
  [key, debounce],
  async ({ queryKey }) => {
    if (type === 'USERS') {
      const users = await searchUsers(queryKey[1] as string)
      return users.status === 200 ? users.data : []
    }
    return []
  },
  false
)

*/