import { ProfileView } from '@widgets/profile';
import type { useProfilePageController } from '../hooks/useProfilePageController';

interface ProfilePageContentProps {
    controller: ReturnType<typeof useProfilePageController>;
}

export function ProfilePageContent({ controller }: ProfilePageContentProps) {
    return (
        <ProfileView
            data={controller.data}
            isLoading={controller.isLoading}
            isFetching={controller.isFetching}
            isError={controller.isError}
            onRetry={() => {
                void controller.refetch();
            }}
        />
    );
}
