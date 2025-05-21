import { createFolder } from '@/actions/workspace'
import { useMutationData } from './useMutationData'

export const useCreateFolders = (workspaceId: string) => {
    const { mutate } = useMutationData(
        ['create-folder'],
        () => createFolder(workspaceId),
        'workspace-folders'
    )

    // Not sure why are we passing { name: 'Untitled', id: 'optimitsitc--id' }, it has to do something with useMutationDataState(['create-folder'])
    //const { latestVariables } = useMutationDataState(["rename-folders"]);

    const onCreateNewFolder = () => mutate({ name: 'Untitled', id: 'optimitsitc--id' })
    return { onCreateNewFolder }
}